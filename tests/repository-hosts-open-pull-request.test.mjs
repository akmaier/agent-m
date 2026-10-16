// MOD-repository-hosts' openPullRequest (ITM-606), as the accepted text of docs/architecture/MOD-repository-hosts.md states it: "`openPullRequest(request: { branch: string, base: string,
// title: string, body: string, draft?: boolean }) -> Promise<PullRequest>` — crosses the network; fails with `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable`,
// `NotSupported`", "`PullRequest` — { number, title, branch, base, head, state, draft, url, opened, merged, closed, body }: a pull request on GitHub, a merge request on GitLab", and
// `connect`: "With `clone`, files are read and committed in that clone and pushed with the clone's own credentials, and every other function uses the REST adapter where a token is
// given, or throws `NotSupported`" (UC-024; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI). Deterministic, no network: the servers are fakes of `fetch` that
// answer as the real APIs document, from their own pages, read 2026-10-17:
//   GitHub — docs.github.com/en/rest/pulls/pulls "Create a pull request" (POST /repos/{owner}/{repo}/pulls; body title, head, base, body, draft; 201 with the pull request; 403, 422).
//   GitLab — docs.gitlab.com/api/merge_requests/ "Create MR" (POST /projects/:id/merge_requests; source_branch, target_branch, title, description; 201 with the merge request; the page
//     lists no draft parameter, and its response carries `draft`).
// Run: node --test tests/repository-hosts-open-pull-request.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-024; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A REMOTE INTERFACE NAMES HOW IT FAILS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// Level: unit
//
// Where the accepted text leaves a reading open, the test states the one it takes, and the pull request names it:
//   - The request is sent as the pages name its fields: GitHub head = branch, base = base, title, body, draft (false where the request names none); GitLab source_branch = branch,
//     target_branch = base, title, description = body. The page of GitLab lists no draft parameter; a draft there is GitLab's draft marker, the title prefix "Draft: ".
//   - The answer is read with the mapping listPullRequests uses, so the PullRequest is the one listPullRequests gives for the same server record.
//   - Failures are those of every write of the module: 401 TokenRefused, 403 and a write's 404 PermissionMissing, a used-up limit RateLimited, a network failure or any other status Unreachable.
//   - Without a token, or through a clone without one, NotSupported before any request; through a clone with a token, the REST adapter.
// Each test states its input and its expected result before it runs (given / input / expect); where a test asserts a refusal, the same call is first shown to succeed. A name the
// module does not provide yet fails each test by itself. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseAddress, connect } from "../src/repository-hosts/index.mjs";

const GH_TOKEN = "github_pat_CAROLsprintTOOL0123456789abcdef";
const GL_TOKEN = "glpat-SPACEsprintTOOLvalue0123456789";
const GITHUB = parseAddress("https://github.com/carol/sprint-tool");
const GITLAB = parseAddress("https://gitlab.example.org/space/sprint-tool");
const GH = "/repos/carol/sprint-tool/pulls";
const GL = "/api/v4/projects/space%2Fsprint-tool/merge_requests";
const HEAD_SHA = "2".repeat(40);
const REQUEST = { branch: "JOB-20261017-1000-abcd", base: "develop", title: "JOB-20261017-1000-abcd: implement", body: "Job: JOB-20261017-1000-abcd\nKind: implement" };

const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
// The fake `fetch`: every request is recorded; `answer` gives the response (or throws, as a network failure does).
async function serving(answer, run) {
  const requests = [], real = globalThis.fetch;
  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "object" && !(input instanceof URL) ? input.url : String(input));
    const raw = init.headers ?? {};
    const headers = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k.toLowerCase(), String(v)]));
    const r = { method: String(init.method ?? "GET").toUpperCase(), href: url.href, host: url.host, path: url.pathname, headers, body: init.body === undefined ? undefined : JSON.parse(init.body) };
    requests.push(r);
    return answer(r);
  };
  try { return { result: await run(), requests }; } finally { globalThis.fetch = real; }
}
const failure = (p) => Promise.resolve(p).then(() => null, (e) => e);

// What each server answers with 201: pull request / merge request number 12 on the branch, opened now.
const ghCreated = (draft = false) => json(201, { number: 12, title: REQUEST.title, state: "open", draft, html_url: "https://github.com/carol/sprint-tool/pull/12", created_at: "2026-10-17T09:00:00Z",
  body: REQUEST.body, merged_at: null, closed_at: null, head: { ref: REQUEST.branch, sha: HEAD_SHA }, base: { ref: "develop", sha: "b".repeat(40) } });
const glCreated = (r) => json(201, { iid: 12, title: r.body.title, description: r.body.description, state: "opened", draft: r.body.title.startsWith("Draft: "),
  web_url: "https://gitlab.example.org/space/sprint-tool/-/merge_requests/12", created_at: "2026-10-17T09:00:00Z", merged_at: null, closed_at: null,
  source_branch: r.body.source_branch, target_branch: r.body.target_branch, sha: HEAD_SHA });

// TST-606001 · level: unit · module: MOD-repository-hosts
// guards: UC-024; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitHub repository carol/sprint-tool and a token; a server that answers a pull request 201 as number 12
// input: openPullRequest({ branch: "JOB-20261017-1000-abcd", base: "develop", title: "JOB-20261017-1000-abcd: implement", body: "Job: JOB-20261017-1000-abcd\nKind: implement" })
// expect: one request, POST https://api.github.com/repos/carol/sprint-tool/pulls with the JSON body { title, head: the branch, base: "develop", body, draft: false } and the token only as a Bearer header; the PullRequest is { number: 12, title, branch, base: "develop", head: 2222…, state: "open", draft: false, url: "https://github.com/carol/sprint-tool/pull/12", opened: "2026-10-17T09:00:00Z", merged: null, closed: null, body }
test("openPullRequest on GitHub — the request carries branch, base, title and body, and the answer is the server's pull request", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  const { result, requests } = await serving(() => ghCreated(), () => host.openPullRequest(REQUEST));
  assert.equal(requests.length, 1);
  assert.deepEqual([requests[0].method, requests[0].host, requests[0].path], ["POST", "api.github.com", GH]);
  assert.deepEqual(requests[0].body, { title: REQUEST.title, head: REQUEST.branch, base: "develop", body: REQUEST.body, draft: false });
  assert.equal(requests[0].headers.authorization, `Bearer ${GH_TOKEN}`);
  assert.ok(!requests[0].href.includes(GH_TOKEN), "the token is in no address");
  assert.deepEqual(result, { number: 12, title: REQUEST.title, branch: REQUEST.branch, base: "develop", head: HEAD_SHA, state: "open", draft: false,
    url: "https://github.com/carol/sprint-tool/pull/12", opened: "2026-10-17T09:00:00Z", merged: null, closed: null, body: REQUEST.body });
});

// TST-606002 · level: unit · module: MOD-repository-hosts
// guards: UC-024; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: the same GitHub repository
// input: openPullRequest({ ...the request, draft: true })
// expect: the JSON body carries draft: true, and the PullRequest returned has draft: true
test("openPullRequest on GitHub — a draft is sent as a draft", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  const { result, requests } = await serving(() => ghCreated(true), () => host.openPullRequest({ ...REQUEST, draft: true }));
  assert.equal(requests[0].body.draft, true);
  assert.equal(result.draft, true);
});

// TST-606003 · level: unit · module: MOD-repository-hosts
// guards: UC-024; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a GitLab project space/sprint-tool on gitlab.example.org and its project token; a server that answers a merge request 201 as iid 12
// input: openPullRequest(the request of TST-606001)
// expect: one request, POST https://gitlab.example.org/api/v4/projects/space%2Fsprint-tool/merge_requests with the JSON body { source_branch: the branch, target_branch: "develop", title, description: the body } and the token only as PRIVATE-TOKEN; the PullRequest is { number: 12, title, branch, base: "develop", head: 2222…, state: "open", draft: false, url: ".../-/merge_requests/12", opened: "2026-10-17T09:00:00Z", merged: null, closed: null, body }
test("openPullRequest on GitLab — the request carries branch, base, title and body, and the answer is the server's merge request", async () => {
  const host = connect(GITLAB, { token: GL_TOKEN });
  const { result, requests } = await serving(glCreated, () => host.openPullRequest(REQUEST));
  assert.equal(requests.length, 1);
  assert.deepEqual([requests[0].method, requests[0].host, requests[0].path], ["POST", "gitlab.example.org", GL]);
  assert.deepEqual(requests[0].body, { source_branch: REQUEST.branch, target_branch: "develop", title: REQUEST.title, description: REQUEST.body });
  assert.equal(requests[0].headers["private-token"], GL_TOKEN);
  assert.ok(!requests[0].href.includes(GL_TOKEN), "the token is in no address");
  assert.deepEqual(result, { number: 12, title: REQUEST.title, branch: REQUEST.branch, base: "develop", head: HEAD_SHA, state: "open", draft: false,
    url: "https://gitlab.example.org/space/sprint-tool/-/merge_requests/12", opened: "2026-10-17T09:00:00Z", merged: null, closed: null, body: REQUEST.body });
});

// TST-606004 · level: unit · module: MOD-repository-hosts
// guards: UC-024; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
// given: the same GitLab project
// input: openPullRequest({ ...the request, draft: true })
// expect: the title sent is "Draft: JOB-20261017-1000-abcd: implement" (GitLab's draft marker; the page lists no draft parameter), and the merge request returned has draft: true
test("openPullRequest on GitLab — a draft is sent with GitLab's draft marker in the title", async () => {
  const host = connect(GITLAB, { token: GL_TOKEN });
  const { result, requests } = await serving(glCreated, () => host.openPullRequest({ ...REQUEST, draft: true }));
  assert.equal(requests[0].body.title, "Draft: JOB-20261017-1000-abcd: implement");
  assert.equal(result.draft, true);
});

// TST-606005 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: on each server, a token; the known positive is the server's 201 answer
// input: openPullRequest(the request) when the server answers 201 (positive); 401; 403; 404; 403 with X-RateLimit-Remaining 0 and X-RateLimit-Limit 5000 (GitHub) / 429 (GitLab); 500; and when fetch itself rejects with "offline"
// expect: 201 gives the PullRequest number 12; 401 HostError TokenRefused; 403 and 404 PermissionMissing; the used-up limit RateLimited with limit "account"; 500 and the rejected fetch Unreachable (the latter with reason "offline")
for (const [label, connectTo, created, limited] of [
  ["GitHub", () => connect(GITHUB, { token: GH_TOKEN }), () => ghCreated(), () => json(403, { message: "rate limit" }, { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "1792227600" })],
  ["GitLab", () => connect(GITLAB, { token: GL_TOKEN }), glCreated, () => json(429, { message: "Retry later" })],
]) {
  test(`openPullRequest on ${label} — each failure is named, beside the success`, async () => {
    const positive = await serving(created, () => connectTo().openPullRequest(REQUEST));
    assert.equal(positive.result.number, 12, "known positive: the server's 201 gives the pull request");
    for (const [what, answer, name] of [
      ["401", () => json(401, { message: "Bad credentials" }), "TokenRefused"],
      ["403", () => json(403, { message: "Forbidden" }), "PermissionMissing"],
      ["404", () => json(404, { message: "Not Found" }), "PermissionMissing"],
      ["a used-up limit", limited, "RateLimited"],
      ["500", () => json(500, { message: "oops" }), "Unreachable"],
    ]) {
      const { result: e } = await serving(answer, () => failure(connectTo().openPullRequest(REQUEST)));
      assert.equal(e?.name, name, `${label} ${what}: ${e}`);
      if (name === "RateLimited") assert.equal(e.limit, "account");
    }
    const { result: offline } = await serving(() => { throw new Error("offline"); }, () => failure(connectTo().openPullRequest(REQUEST)));
    assert.equal(offline?.name, "Unreachable");
    assert.match(String(offline.reason), /offline/);
  });
}

// TST-606006 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-024
// given: a host of each server without a token; the same host with a token is shown to open a pull request first
// input: openPullRequest(the request) without a token
// expect: HostError NotSupported, and not one request is made
for (const [label, address, token, created] of [["GitHub", GITHUB, GH_TOKEN, () => ghCreated()], ["GitLab", GITLAB, GL_TOKEN, glCreated]]) {
  test(`openPullRequest on ${label} — without a token it is NotSupported and sends nothing`, async () => {
    const positive = await serving(created, () => connect(address, { token }).openPullRequest(REQUEST));
    assert.equal(positive.result.number, 12, "known positive: with a token it opens one");
    const { result: e, requests } = await serving(created, () => failure(connect(address, {}).openPullRequest(REQUEST)));
    assert.equal(e?.name, "NotSupported");
    assert.deepEqual(requests, []);
  });
}

// TST-606007 · level: unit · module: MOD-repository-hosts
// guards: UC-024; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a host connected with a clone (a folder) — the CI case — on GitHub and on GitLab
// input: openPullRequest(the request) with the person's token, and without one
// expect: with the token, the REST adapter's request (one POST to the server's pulls / merge_requests address) and the server's PullRequest number 12; without the token HostError NotSupported and no request
test("openPullRequest through a clone — with a token the REST adapter opens it, without one NotSupported", async () => {
  const folder = mkdtempSync(join(tmpdir(), "itm606-clone-"));
  try {
    for (const [address, token, path, created] of [[GITHUB, GH_TOKEN, GH, () => ghCreated()], [GITLAB, GL_TOKEN, GL, glCreated]]) {
      const { result, requests } = await serving(created, () => connect(address, { clone: folder, token }).openPullRequest(REQUEST));
      assert.deepEqual(requests.map((r) => [r.method, r.path]), [["POST", path]]);
      assert.equal(result.number, 12);
      const { result: e, requests: none } = await serving(created, () => failure(connect(address, { clone: folder }).openPullRequest(REQUEST)));
      assert.equal(e?.name, "NotSupported");
      assert.deepEqual(none, []);
    }
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-606008 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-024
// given: a GitHub host with a token
// input: openPullRequest with a blank branch; a blank base; a blank title; a body that is not a text; no request at all
// expect: the full request is first shown to succeed; each of the others throws a TypeError and makes no request
test("openPullRequest — a request without its branch, base, title or body text is a TypeError and sends nothing", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  assert.equal((await serving(() => ghCreated(), () => host.openPullRequest(REQUEST))).result.number, 12, "known positive");
  for (const bad of [{ ...REQUEST, branch: " " }, { ...REQUEST, base: "" }, { ...REQUEST, title: "  " }, { ...REQUEST, body: 5 }, undefined]) {
    const { result: e, requests } = await serving(() => ghCreated(), () => failure(host.openPullRequest(bad)));
    assert.ok(e instanceof TypeError, `${JSON.stringify(bad)}: ${e}`);
    assert.deepEqual(requests, []);
  }
});
