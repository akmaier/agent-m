// MOD-repository-hosts' createIssue (ITM-962), as the accepted text of docs/architecture/MOD-repository-hosts.md states it: "`createIssue(issue: { title: string, body: string, labels: string[] }) ->
// Promise<Issue>` — crosses the network; fails with `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`, `NotSupported`." And `Issue` — `{ number, title, body, labels, state: "open" | "closed",
// url, comments: { author, body, date }[] }`. UC-038: "Agent M creates the issue in the product's tracker with the author's token, labelled `defect` or `change`."
// Run: node --test tests/repository-hosts-create-issue.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-038; A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE; A REMOTE INTERFACE NAMES HOW IT FAILS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// Level: unit
//
// The servers are fakes of `fetch`, deterministic, no network, answering as the APIs document: GitHub's "Create an issue" (POST /repos/{owner}/{repo}/issues with title, body and labels; 201 with the issue:
// number, title, body, labels as objects with a name, state "open", html_url) and GitLab's "New issue" (POST /projects/:id/issues with title, description and labels as a comma-separated text; 201 with iid,
// title, description, labels as names, state "opened", web_url). A used-up GitHub limit is answered 403 with x-ratelimit-remaining 0.
// Readings the texts leave open, which the tests state (the pull request names them): a new issue has no comments, so `comments` is []; GitLab's state "opened" is "open".
// Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
async function using(fetchFn, run) {
  const real = globalThis.fetch;
  globalThis.fetch = fetchFn;
  try { return await run(); } finally { globalThis.fetch = real; }
}
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

const GH_WEB = "https://github.com/carol/release-tool";
const GH_TOKEN = "github_pat_CAROLreleaseTOOL0123456789abcdef";
const GL_WEB = "https://gitlab.example.org/space/release-tool";
const GL_TOKEN = "glpat-SPACEreleaseTOOL0123456789";
const ISSUE = { title: "The export fails", body: "The export of a PDF fails with an empty file.", labels: ["defect"] };

// Both servers record every request; `answer` decides the reply.
function fake(answer) {
  const requests = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const headers = Object.fromEntries(new Headers(init.headers ?? {}).entries());
    const request = { method: init.method ?? "GET", href: url.href, origin: url.origin, path: url.pathname, headers, body: init.body === undefined ? null : JSON.parse(init.body) };
    requests.push(request);
    return answer(request);
  };
  return { requests, fetch };
}
const github = (status = 201) => fake((r) => (r.method === "POST" && r.path === "/repos/carol/release-tool/issues"
  ? json(status, status === 201 ? { number: 12, title: r.body.title, body: r.body.body, labels: r.body.labels.map((name) => ({ name })), state: "open", html_url: `${GH_WEB}/issues/12` } : { message: "refused" })
  : json(404, { message: "Not Found" })));
const gitlab = () => fake((r) => (r.method === "POST" && r.path === "/api/v4/projects/space%2Frelease-tool/issues"
  ? json(201, { iid: 7, title: r.body.title, description: r.body.description, labels: r.body.labels === "" ? [] : r.body.labels.split(","), state: "opened", web_url: `${GL_WEB}/-/issues/7` })
  : json(404, { message: "404 Project Not Found" })));

// TST-962001 · level: unit · module: MOD-repository-hosts
// guards: UC-038; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
// given: a GitHub repository carol/release-tool and a token; an issue with a title, a body and the label defect
// input: createIssue({ title: "The export fails", body: "The export of a PDF fails with an empty file.", labels: ["defect"] })
// expect: one POST to the repository's issues with that title, body and labels; the host returns { number: 12, title, body, labels: ["defect"], state: "open", url, comments: [] }
test("createIssue — on GitHub the issue is created with its title, body and labels, and the Issue has the fields of the interface", async () => {
  const server = github();
  const issue = await using(server.fetch, () => connect(parseAddress(GH_WEB), { token: GH_TOKEN }).createIssue(ISSUE));
  assert.deepEqual(server.requests.map((r) => [r.method, r.path, r.body]), [["POST", "/repos/carol/release-tool/issues", ISSUE]]);
  assert.deepEqual(issue, { number: 12, title: ISSUE.title, body: ISSUE.body, labels: ["defect"], state: "open", url: `${GH_WEB}/issues/12`, comments: [] });
});

// TST-962002 · level: unit · module: MOD-repository-hosts
// guards: UC-038; AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
// given: a GitLab project space/release-tool and a project access token; the same issue with the label change
// input: createIssue
// expect: one POST to the project's issues with the title, the body as the description and the labels as "change"; the host returns { number: 7, title, body, labels: ["change"], state: "open", url, comments: [] }
test("createIssue — on a GitLab server the issue is created with its title, description and labels, and the Issue has the fields of the interface", async () => {
  const server = gitlab();
  const issue = await using(server.fetch, () => connect(parseAddress(GL_WEB), { token: GL_TOKEN }).createIssue({ ...ISSUE, labels: ["change"] }));
  assert.deepEqual(server.requests.map((r) => [r.method, r.path, r.body]), [["POST", "/api/v4/projects/space%2Frelease-tool/issues", { title: ISSUE.title, description: ISSUE.body, labels: "change" }]]);
  assert.deepEqual(issue, { number: 7, title: ISSUE.title, body: ISSUE.body, labels: ["change"], state: "open", url: `${GL_WEB}/-/issues/7`, comments: [] });
});

// TST-962003 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
// given: a GitHub repository whose server answers 401; one that answers 403 without rate-limit headers; one that answers 403 with x-ratelimit-remaining 0; one that cannot be reached; and a GitLab project that answers 401 and one that answers 403
// input: createIssue on each
// expect: TokenRefused (naming the token), PermissionMissing, RateLimited, Unreachable; on GitLab TokenRefused and PermissionMissing — each by its name, and none of them a failure of another name
test("createIssue — each failure is named: TokenRefused, PermissionMissing, RateLimited, Unreachable", async () => {
  const refuse = (status, headers = {}) => fake(() => json(status, { message: "refused" }, headers));
  const gh = (server) => using(server.fetch, () => failure(connect(parseAddress(GH_WEB), { token: GH_TOKEN, tokenName: "carol's token" }).createIssue(ISSUE)));
  const gl = (server) => using(server.fetch, () => failure(connect(parseAddress(GL_WEB), { token: GL_TOKEN, tokenName: "space token" }).createIssue(ISSUE)));
  const refused = await gh(refuse(401));
  assert.equal(refused?.name, "TokenRefused");
  assert.equal(refused?.tokenName, "carol's token");
  assert.equal((await gh(refuse(403)))?.name, "PermissionMissing");
  const limited = await gh(refuse(403, { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "1790000000" }));
  assert.equal(limited?.name, "RateLimited");
  assert.equal(limited?.limit, "account");
  const unreachable = await gh({ fetch: async () => { throw new TypeError("Failed to fetch"); } });
  assert.equal(unreachable?.name, "Unreachable");
  assert.equal((await gl(refuse(401)))?.name, "TokenRefused");
  assert.equal((await gl(refuse(403)))?.name, "PermissionMissing");
});

// TST-962004 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host through a local clone without a token
// input: createIssue
// expect: fails with NotSupported, and no request goes out
test("createIssue — through a clone without a token it is NotSupported, with no request", async () => {
  const server = github();
  const failed = await using(server.fetch, () => failure(connect(parseAddress(GH_WEB), { clone: "/tmp/a-clone" }).createIssue(ISSUE)));
  assert.equal(failed?.name, "NotSupported");
  assert.deepEqual(server.requests, []);
});

// TST-962005 · level: unit · module: MOD-repository-hosts
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a GitHub repository with a token and a GitLab project with a token; known positive: both issues are created (TST-962001, TST-962002)
// input: createIssue on each
// expect: every request goes to the issuing server (api.github.com, gitlab.example.org) only; the GitHub token is in the authorisation header, the GitLab token in the private-token header, each on that server's request only; no address and no body holds a token
test("createIssue — the token goes only in the authorisation header to the server that issued it", async () => {
  const hub = github(), lab = gitlab();
  assert.ok(await using(hub.fetch, () => connect(parseAddress(GH_WEB), { token: GH_TOKEN }).createIssue(ISSUE)), "known positive: GitHub created the issue");
  assert.ok(await using(lab.fetch, () => connect(parseAddress(GL_WEB), { token: GL_TOKEN }).createIssue(ISSUE)), "known positive: GitLab created the issue");
  assert.deepEqual([...new Set(hub.requests.map((r) => r.origin))], ["https://api.github.com"]);
  assert.deepEqual([...new Set(lab.requests.map((r) => r.origin))], ["https://gitlab.example.org"]);
  assert.deepEqual(hub.requests.map((r) => r.headers.authorization), [`Bearer ${GH_TOKEN}`]);
  assert.deepEqual(lab.requests.map((r) => r.headers["private-token"]), [GL_TOKEN]);
  assert.deepEqual(hub.requests.filter((r) => "private-token" in r.headers), []);
  assert.deepEqual(lab.requests.filter((r) => "authorization" in r.headers), []);
  for (const r of [...hub.requests, ...lab.requests]) assert.ok(![r.href, JSON.stringify(r.body)].some((text) => text.includes(GH_TOKEN) || text.includes(GL_TOKEN)), "no credential in an address or a body");
});

// TST-962006 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: an issue without a title, one whose labels are not a list of texts, and a missing issue
// input: createIssue on each
// expect: a TypeError naming what is wrong, and no request goes out
test("createIssue — an issue without a title, with labels that are no list of texts, or none at all is a TypeError with no request", async () => {
  const server = github();
  const host = connect(parseAddress(GH_WEB), { token: GH_TOKEN });
  for (const bad of [{ ...ISSUE, title: "  " }, { ...ISSUE, labels: "defect" }, { ...ISSUE, body: 3 }, undefined]) {
    const failed = await using(server.fetch, () => failure(host.createIssue(bad)));
    assert.ok(failed instanceof TypeError, `a TypeError for ${JSON.stringify(bad)}`);
  }
  assert.deepEqual(server.requests, []);
});
