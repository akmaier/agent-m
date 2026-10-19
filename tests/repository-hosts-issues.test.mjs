// MOD-repository-hosts' listIssues, commentOnIssue, setIssueLabels and setIssueState (ITM-581), as the accepted text of docs/architecture/MOD-repository-hosts.md states them:
// "`listIssues(filter: { state?: "open" | "closed" | "all", labels?: string[], search?: string }) -> Promise<Issue[]>` — crosses the network; fails as `readSnapshot`, and with `NotSupported` through a clone.
// `commentOnIssue(number, body) -> Promise<void>` — fails as `createIssue`. `setIssueLabels(number, labels: { add?: string[], remove?: string[] }) -> Promise<void>` — fails as `createIssue`.
// `setIssueState(number, state: "open" | "closed") -> Promise<void>` — fails as `createIssue`." And `Issue` — `{ number, title, body, labels, state, url, comments: { author, body, date }[] }`.
// `createIssue` fails with `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`, `NotSupported`. UC-012: an issue is opened in Agent M, commented, labelled and "closed with the reason".
// Run: node --test tests/repository-hosts-issues.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-012; A REMOTE INTERFACE NAMES HOW IT FAILS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// Level: unit
//
// The servers are fakes of `fetch`, deterministic, no network, answering as the APIs document: GitHub's "List repository issues" (GET /repos/{owner}/{repo}/issues: state open, closed or all; labels as a
// comma-separated text; per_page up to 100 and page; the answer lists pull requests too, each with a `pull_request` key), "List issue comments" (GET …/issues/{n}/comments: user.login, body, created_at),
// "Create an issue comment" (POST …/issues/{n}/comments), "Add labels to an issue" (POST …/issues/{n}/labels with labels), "Remove a label from an issue" (DELETE …/issues/{n}/labels/{name}; 404 where the issue
// does not carry it), "Update an issue" (PATCH …/issues/{n} with state open or closed) and "Search issues and pull requests" (GET /search/issues with q); GitLab's "List project issues" (GET /projects/:id/issues:
// state opened, closed or all; labels; search; per_page and page), "List project issue notes" (GET …/issues/:iid/notes: author.username, body, created_at, system), "Create new issue note" (POST …/issues/:iid/notes
// with body) and "Edit an issue" (PUT …/issues/:iid with add_labels, remove_labels and state_event close or reopen).
// Readings the texts leave open, which the tests state (the pull request names them):
//   - Without a state in the filter, the open issues are listed. A filter's labels must all be on an issue (both servers' `labels`). On GitHub a search is the search API's, on an issue-only query of the repository.
//   - GitHub's pull requests, which its issue list holds too, are not issues and are left out; GitLab's system notes are not comments and are left out. A comment's author is the account, its date the server's.
//   - A write without a token is NotSupported before any request, as createBranch's is. A removal of a label the issue does not carry is not a failure.
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

const GH_WEB = "https://github.com/carol/release-tool", GH_PREFIX = "/repos/carol/release-tool";
const GH_TOKEN = "github_pat_CAROLreleaseTOOL0123456789abcdef";
const GL_WEB = "https://gitlab.example.org/space/release-tool", GL_PREFIX = "/api/v4/projects/space%2Frelease-tool";
const GL_TOKEN = "glpat-SPACEreleaseTOOL0123456789";

function fake(answer) {
  const requests = [];
  const fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const headers = Object.fromEntries(new Headers(init.headers ?? {}).entries());
    const request = { method: init.method ?? "GET", href: url.href, origin: url.origin, path: url.pathname, query: Object.fromEntries(url.searchParams), headers, body: init.body === undefined ? null : JSON.parse(init.body) };
    requests.push(request);
    return answer(request);
  };
  return { requests, fetch };
}
const hub = () => connect(parseAddress(GH_WEB), { token: GH_TOKEN, tokenName: "carol's token" });
const lab = () => connect(parseAddress(GL_WEB), { token: GL_TOKEN, tokenName: "space token" });
const writes = (server) => server.requests.filter((r) => r.method !== "GET").map((r) => [r.method, r.path, r.body]);

// ---------------------------------------------------------------- GitHub's fixture: issues 3 (open, two labels, one comment), 4 (a pull request), 5 (closed) and the comments

const GH_ISSUES = [
  { number: 3, title: "The export fails", body: "Empty file.", labels: [{ name: "defect" }, { name: "export" }], state: "open", html_url: `${GH_WEB}/issues/3`, comments: 1 },
  { number: 4, title: "A pull request", body: "", labels: [], state: "open", html_url: `${GH_WEB}/pull/4`, comments: 0, pull_request: {} },
  { number: 5, title: "Old wish", body: "Dark mode.", labels: [{ name: "change" }], state: "closed", html_url: `${GH_WEB}/issues/5`, comments: 0 },
];
const GH_COMMENTS = { 3: [{ user: { login: "alice" }, body: "Seen on 1.2.", created_at: "2026-10-12T09:00:00Z" }] };
function githubServer() {
  return fake((r) => {
    if (r.path === `${GH_PREFIX}/issues` && r.method === "GET") {
      const wanted = r.query.labels ? r.query.labels.split(",") : [];
      const page = GH_ISSUES.filter((i) => (r.query.state === "all" || (r.query.state ?? "open") === i.state) && wanted.every((w) => i.labels.some((l) => l.name === w)));
      return json(200, Number(r.query.page ?? 1) === 1 ? page : []);
    }
    const comments = /^\/repos\/carol\/release-tool\/issues\/(\d+)\/comments$/.exec(r.path);
    if (comments && r.method === "GET") return json(200, GH_COMMENTS[comments[1]] ?? []);
    if (comments && r.method === "POST") return json(201, { id: 1, body: r.body.body });
    if (/\/issues\/\d+\/labels$/.test(r.path) && r.method === "POST") return json(200, r.body.labels.map((name) => ({ name })));
    if (/\/issues\/\d+\/labels\/[^/]+$/.test(r.path) && r.method === "DELETE") return decodeURIComponent(r.path).endsWith("/missing") ? json(404, { message: "Label does not exist" }) : json(200, []);
    if (/\/issues\/\d+$/.test(r.path) && r.method === "PATCH") return json(200, { number: 3, state: r.body.state });
    if (r.path === "/search/issues") return json(200, { total_count: 2, items: [GH_ISSUES[0], GH_ISSUES[1]] });
    return json(404, { message: "Not Found" });
  });
}
const GH_ISSUE_3 = { number: 3, title: "The export fails", body: "Empty file.", labels: ["defect", "export"], state: "open", url: `${GH_WEB}/issues/3`, comments: [{ author: "alice", body: "Seen on 1.2.", date: "2026-10-12T09:00:00Z" }] };
const GH_ISSUE_5 = { number: 5, title: "Old wish", body: "Dark mode.", labels: ["change"], state: "closed", url: `${GH_WEB}/issues/5`, comments: [] };

// ---------------------------------------------------------------- GitLab's fixture: issues 7 (opened, labels, a system note and a comment) and 8 (closed)

const GL_ISSUES = [
  { iid: 7, title: "The export fails", description: "Empty file.", labels: ["defect", "export"], state: "opened", web_url: `${GL_WEB}/-/issues/7` },
  { iid: 8, title: "Old wish", description: "Dark mode.", labels: ["change"], state: "closed", web_url: `${GL_WEB}/-/issues/8` },
];
const GL_NOTES = { 7: [{ author: { username: "alice" }, body: "Seen on 1.2.", created_at: "2026-10-12T09:00:00Z", system: false }, { author: { username: "alice" }, body: "added ~defect label", created_at: "2026-10-12T09:01:00Z", system: true }] };
function gitlabServer() {
  return fake((r) => {
    if (r.path === `${GL_PREFIX}/issues` && r.method === "GET") {
      const wanted = r.query.labels ? r.query.labels.split(",") : [];
      const wantedState = r.query.state ?? "opened";
      const page = GL_ISSUES.filter((i) => (wantedState === "all" || wantedState === i.state) && wanted.every((w) => i.labels.includes(w)) && (!r.query.search || i.title.includes(r.query.search)));
      return json(200, Number(r.query.page ?? 1) === 1 ? page : []);
    }
    const notes = /^\/api\/v4\/projects\/space%2Frelease-tool\/issues\/(\d+)\/notes$/.exec(r.path);
    if (notes && r.method === "GET") return json(200, GL_NOTES[notes[1]] ?? []);
    if (notes && r.method === "POST") return json(201, { id: 1, body: r.body.body });
    if (/\/issues\/\d+$/.test(r.path) && r.method === "PUT") return json(200, { iid: 7 });
    return json(404, { message: "404 Not found" });
  });
}
const GL_ISSUE_7 = { number: 7, title: "The export fails", body: "Empty file.", labels: ["defect", "export"], state: "open", url: `${GL_WEB}/-/issues/7`, comments: [{ author: "alice", body: "Seen on 1.2.", date: "2026-10-12T09:00:00Z" }] };
const GL_ISSUE_8 = { number: 8, title: "Old wish", body: "Dark mode.", labels: ["change"], state: "closed", url: `${GL_WEB}/-/issues/8`, comments: [] };

// TST-581001 · level: unit · module: MOD-repository-hosts
// guards: UC-012
// given: a GitHub repository with the open issue 3 (labels defect and export, one comment by alice), the pull request 4 and the closed issue 5; the same on a GitLab server as the issues 7 and 8 (7 has a comment and a system note)
// input: listIssues({}), listIssues({ state: "all" }), listIssues({ labels: ["defect", "export"] }), listIssues({ state: "closed" }) on each
// expect: GitHub: [3]; [3, 5]; [3]; [5]; GitLab: [7]; [7, 8]; [7]; [8] — each an Issue with number, title, body, labels, state, url and its comments { author, body, date }; GitHub's pull request and GitLab's system note are not listed
test("listIssues — GitHub and GitLab list the issues of a state and of labels, each with its comments, without pull requests and system notes", async () => {
  const gh = githubServer(), gl = gitlabServer();
  const ask = (host, server, filter) => using(server.fetch, () => host.listIssues(filter));
  assert.deepEqual(await ask(hub(), gh, {}), [GH_ISSUE_3]);
  assert.deepEqual(await ask(hub(), gh, { state: "all" }), [GH_ISSUE_3, GH_ISSUE_5]);
  assert.deepEqual(await ask(hub(), gh, { labels: ["defect", "export"] }), [GH_ISSUE_3]);
  assert.deepEqual(await ask(hub(), gh, { state: "closed" }), [GH_ISSUE_5]);
  assert.deepEqual(await ask(lab(), gl, {}), [GL_ISSUE_7]);
  assert.deepEqual(await ask(lab(), gl, { state: "all" }), [GL_ISSUE_7, GL_ISSUE_8]);
  assert.deepEqual(await ask(lab(), gl, { labels: ["defect", "export"] }), [GL_ISSUE_7]);
  assert.deepEqual(await ask(lab(), gl, { state: "closed" }), [GL_ISSUE_8]);
});

// TST-581002 · level: unit · module: MOD-repository-hosts
// guards: UC-012
// given: the same servers
// input: listIssues({ search: "export" }) on each
// expect: GitHub answers through its search of issues, with a query that holds repo:carol/release-tool, is:issue, state:open and the word export, and the host lists the issues of that answer that are no pull requests; GitLab through the issues list with search=export; the issue 7 of GitLab is listed
test("listIssues — a search is the server's own search of the repository's issues", async () => {
  const gh = githubServer(), gl = gitlabServer();
  const onGitHub = await using(gh.fetch, () => hub().listIssues({ search: "export" }));
  const query = gh.requests.find((r) => r.path === "/search/issues")?.query.q ?? "";
  for (const part of ["repo:carol/release-tool", "is:issue", "state:open", "export"]) assert.ok(query.includes(part), `${part} in ${query}`);
  assert.deepEqual(onGitHub.map((i) => i.number), [3]);
  const onGitLab = await using(gl.fetch, () => lab().listIssues({ search: "export" }));
  assert.equal(gl.requests.find((r) => r.path === `${GL_PREFIX}/issues`).query.search, "export");
  assert.deepEqual(onGitLab.map((i) => i.number), [7]);
});

// TST-581003 · level: unit · module: MOD-repository-hosts
// guards: UC-012
// given: a GitHub repository with 101 open issues and no comments, which the server gives 100 to a page; a public repository and a host without a token
// input: listIssues({}) with the token; listIssues({}) without a token on a public repository
// expect: all 101 issues, read over two pages (page 1 and 2 with per_page 100); without a token the open issues are read and listed, with no authorisation header
test("listIssues — every page is read, and a public repository's issues are listed without a token", async () => {
  const many = Array.from({ length: 101 }, (_, i) => ({ number: i + 1, title: `Issue ${i + 1}`, body: "", labels: [], state: "open", html_url: `${GH_WEB}/issues/${i + 1}`, comments: 0 }));
  const server = fake((r) => json(200, Number(r.query.page ?? 1) === 1 ? many.slice(0, 100) : Number(r.query.page) === 2 ? many.slice(100) : []));
  const issues = await using(server.fetch, () => hub().listIssues({}));
  assert.equal(issues.length, 101);
  assert.deepEqual(server.requests.slice(0, 2).map((r) => [r.query.page, r.query.per_page]), [["1", "100"], ["2", "100"]]);
  const open = fake(() => json(200, [many[0]]));
  const listed = await using(open.fetch, () => connect(parseAddress(GH_WEB)).listIssues({}));
  assert.equal(listed.length, 1);
  assert.equal(open.requests[0].headers.authorization, undefined);
});

// TST-581004 · level: unit · module: MOD-repository-hosts
// guards: UC-012
// given: both servers, issue 3 on GitHub (labels defect, export) and issue 7 on GitLab
// input: commentOnIssue(3, "Fixed in 1.3."), setIssueLabels(3, { add: ["fixed"], remove: ["defect", "missing"] }), setIssueState(3, "closed") and setIssueState(3, "open") on GitHub; the same with 7 on GitLab
// expect: GitHub: POST …/issues/3/comments {body}; POST …/issues/3/labels {labels: ["fixed"]}; DELETE …/issues/3/labels/defect and …/missing — the second's 404 is no failure —; PATCH …/issues/3 {state: "closed"} and {state: "open"}. GitLab: POST …/issues/7/notes {body}; PUT …/issues/7 {add_labels: "fixed", remove_labels: "defect,missing"}; PUT {state_event: "close"} and {state_event: "reopen"}. Each resolves with no value
test("commentOnIssue, setIssueLabels and setIssueState — each writes through the server's own call", async () => {
  const gh = githubServer(), gl = gitlabServer();
  const results = [];
  await using(gh.fetch, async () => {
    results.push(await hub().commentOnIssue(3, "Fixed in 1.3."));
    results.push(await hub().setIssueLabels(3, { add: ["fixed"], remove: ["defect", "missing"] }));
    results.push(await hub().setIssueState(3, "closed"), await hub().setIssueState(3, "open"));
  });
  assert.deepEqual(writes(gh), [
    ["POST", `${GH_PREFIX}/issues/3/comments`, { body: "Fixed in 1.3." }], ["POST", `${GH_PREFIX}/issues/3/labels`, { labels: ["fixed"] }],
    ["DELETE", `${GH_PREFIX}/issues/3/labels/defect`, null], ["DELETE", `${GH_PREFIX}/issues/3/labels/missing`, null],
    ["PATCH", `${GH_PREFIX}/issues/3`, { state: "closed" }], ["PATCH", `${GH_PREFIX}/issues/3`, { state: "open" }],
  ]);
  await using(gl.fetch, async () => {
    results.push(await lab().commentOnIssue(7, "Fixed in 1.3."));
    results.push(await lab().setIssueLabels(7, { add: ["fixed"], remove: ["defect", "missing"] }));
    results.push(await lab().setIssueState(7, "closed"), await lab().setIssueState(7, "open"));
  });
  assert.deepEqual(writes(gl), [
    ["POST", `${GL_PREFIX}/issues/7/notes`, { body: "Fixed in 1.3." }], ["PUT", `${GL_PREFIX}/issues/7`, { add_labels: "fixed", remove_labels: "defect,missing" }],
    ["PUT", `${GL_PREFIX}/issues/7`, { state_event: "close" }], ["PUT", `${GL_PREFIX}/issues/7`, { state_event: "reopen" }],
  ]);
  assert.ok(results.every((value) => value === undefined));
});

// TST-581005 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
// given: servers that answer 401; 403 without rate-limit headers; 403 with x-ratelimit-remaining 0; and a server that cannot be reached; on GitHub for each of the four functions, and on GitLab for listIssues and commentOnIssue
// input: each function on each server
// expect: TokenRefused (naming the token), PermissionMissing, RateLimited and Unreachable — each by its name
test("listIssues, commentOnIssue, setIssueLabels and setIssueState — each failure is named: TokenRefused, PermissionMissing, RateLimited, Unreachable", async () => {
  const refuse = (status, headers = {}) => fake(() => json(status, { message: "refused" }, headers));
  const LIMIT = { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "1790000000" };
  const calls = {
    listIssues: (host) => host.listIssues({}), commentOnIssue: (host) => host.commentOnIssue(3, "text"),
    setIssueLabels: (host) => host.setIssueLabels(3, { add: ["fixed"] }), setIssueState: (host) => host.setIssueState(3, "closed"),
  };
  const run = async (host, name, server) => (await using(server.fetch, () => failure(calls[name](host()))))?.name;
  const unreachable = { fetch: async () => { throw new TypeError("Failed to fetch"); } };
  for (const name of Object.keys(calls)) {
    assert.equal(await run(hub, name, refuse(401)), "TokenRefused", `${name} 401`);
    assert.equal(await run(hub, name, refuse(403)), "PermissionMissing", `${name} 403`);
    assert.equal(await run(hub, name, refuse(403, LIMIT)), "RateLimited", `${name} 403 with a used-up limit`);
    assert.equal(await run(hub, name, unreachable), "Unreachable", `${name} unreachable`);
  }
  for (const name of ["listIssues", "commentOnIssue"]) {
    assert.equal(await run(lab, name, refuse(401)), "TokenRefused", `GitLab ${name} 401`);
    assert.equal(await run(lab, name, refuse(403)), "PermissionMissing", `GitLab ${name} 403`);
  }
});

// TST-581006 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host through a local clone without a token; and a GitHub host without a token
// input: listIssues, commentOnIssue, setIssueLabels and setIssueState through the clone; commentOnIssue, setIssueLabels and setIssueState without a token
// expect: through the clone every one fails with NotSupported; the three writes without a token fail with NotSupported too; no request goes out
test("listIssues and the three writes — through a clone without a token, and a write without a token, are NotSupported with no request", async () => {
  const server = githubServer();
  const clone = connect(parseAddress(GH_WEB), { clone: "/tmp/a-clone" }), bare = connect(parseAddress(GH_WEB));
  const names = [];
  await using(server.fetch, async () => {
    for (const run of [() => clone.listIssues({}), () => clone.commentOnIssue(3, "x"), () => clone.setIssueLabels(3, { add: ["a"] }), () => clone.setIssueState(3, "closed"),
      () => bare.commentOnIssue(3, "x"), () => bare.setIssueLabels(3, { add: ["a"] }), () => bare.setIssueState(3, "closed")]) names.push((await failure(run()))?.name);
  });
  assert.deepEqual(names, Array(7).fill("NotSupported"));
  assert.deepEqual(server.requests, []);
});

// TST-581007 · level: unit · module: MOD-repository-hosts
// guards: A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CREDENTIAL IS NEVER PLACED IN A URL
// given: known positive TST-581001 and TST-581004; both servers
// input: the four functions on each
// expect: every request goes to the issuing server only, with the GitHub token in the authorisation header and the GitLab token in the private-token header, and in no address or body
test("the four issue functions — the token goes only in the header to the server that issued it", async () => {
  const gh = githubServer(), gl = gitlabServer();
  await using(gh.fetch, async () => { await hub().listIssues({}); await hub().commentOnIssue(3, "x"); await hub().setIssueLabels(3, { add: ["a"] }); await hub().setIssueState(3, "closed"); });
  await using(gl.fetch, async () => { await lab().listIssues({}); await lab().commentOnIssue(7, "x"); await lab().setIssueLabels(7, { add: ["a"] }); await lab().setIssueState(7, "closed"); });
  assert.ok(gh.requests.length >= 4 && gl.requests.length >= 4, "known positive: the calls were made");
  assert.deepEqual([...new Set(gh.requests.map((r) => r.origin))], ["https://api.github.com"]);
  assert.deepEqual([...new Set(gl.requests.map((r) => r.origin))], ["https://gitlab.example.org"]);
  assert.ok(gh.requests.every((r) => r.headers.authorization === `Bearer ${GH_TOKEN}` && !("private-token" in r.headers)));
  assert.ok(gl.requests.every((r) => r.headers["private-token"] === GL_TOKEN && !("authorization" in r.headers)));
  for (const r of [...gh.requests, ...gl.requests]) assert.ok(![r.href, JSON.stringify(r.body)].some((text) => text.includes(GH_TOKEN) || text.includes(GL_TOKEN)));
});

// TST-581008 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a number that is no positive whole number, a state that is neither open nor closed, labels that are no lists of texts, a comment that is empty, a filter with a state outside the three
// input: the functions with each
// expect: a TypeError naming what is wrong, and no request goes out
test("the four issue functions — a wrong argument is a TypeError with no request", async () => {
  const server = githubServer();
  const host = hub();
  const bad = [() => host.commentOnIssue(0, "x"), () => host.commentOnIssue(3, "  "), () => host.setIssueLabels(3, {}), () => host.setIssueLabels(3, { add: "a" }),
    () => host.setIssueState(3, "done"), () => host.setIssueState(1.5, "closed"), () => host.listIssues({ state: "everything" }), () => host.listIssues({ labels: "defect" })];
  await using(server.fetch, async () => { for (const run of bad) assert.ok((await failure(run())) instanceof TypeError); });
  assert.deepEqual(server.requests, []);
});
