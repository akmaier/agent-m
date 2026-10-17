// MOD-repository-hosts' mergePullRequest (ITM-748), as the accepted text of docs/architecture/MOD-repository-hosts.md states it: "`mergePullRequest(number: number, expectedHead: string) ->
// Promise<{ commit: string }>` — merges only if the pull request's head is still `expectedHead` and the server allows it; branch protection on the server stays in force. Crosses the
// network; fails with `Moved`, `PermissionMissing`, `TokenRefused`, `RateLimited`, `Unreachable`, and with `NotMergeable { reason }` when the server refuses the merge", "`Moved { head }`
// — the branch is no longer at the head the commit was made on", "`NotMergeable { reason }` — the server refuses a merge, for example while a required check is not green", and `connect`:
// "every other function uses the REST adapter where a token is given, or throws `NotSupported`" (UC-027 step 6; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI).
// Deterministic, no network: the servers are fakes of `fetch` that answer as the real APIs document, from their own pages:
//   GitHub — docs.github.com/en/rest/pulls/pulls "Get a pull request" (GET /repos/{owner}/{repo}/pulls/{n}; head.sha) and "Merge a pull request" (PUT …/pulls/{n}/merge; body sha — "SHA that
//     pull request head must match to allow merge" —, merge_method; 200 { sha, merged, message }; 403; 404; 405 "Method not allowed if merge cannot be performed"; 409 "Conflict if sha was
//     provided and pull request head did not match"; 422).
//   GitLab — docs.gitlab.com/api/merge_requests/ "Get single MR" (GET /projects/:id/merge_requests/:iid; sha) and "Merge a merge request" (PUT …/merge; sha — "If present, then this SHA must
//     match the HEAD of the source branch, otherwise the merge fails" —; 200 the merge request with merge_commit_sha; 401; 403; 404; 405 "if the merge request cannot be merged"; 409 "SHA does
//     not match HEAD of source branch"; 422 "if the merge request cannot be merged").
// Run: node --test tests/repository-hosts-merge-pull-request.test.mjs
//
// Module: MOD-repository-hosts
// Guards: UC-027; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A REMOTE INTERFACE NAMES HOW IT FAILS; ONE CLICK PER DECISION
// Level: unit
//
// Where the accepted text leaves a reading open, the test states the one it takes, and the pull request names it:
//   - The head is read first (GET the pull request); a head other than `expectedHead` is `Moved { head: the head now }` and no merge request is sent. The merge request then carries the
//     expected head as `sha`, so a head that moves between the read and the merge is refused by the server (409), also `Moved`. The merge method is the server's default: none is sent.
//   - The answer: GitHub's `sha`, GitLab's `merge_commit_sha`, as `{ commit }`.
//   - A refusal to merge is the server's 405 or 422 (both pages name them), `NotMergeable` with the server's message as `reason`.
//   - Other failures are those of every write of the module: 401 TokenRefused, 403 and a write's 404 PermissionMissing, a used-up limit RateLimited, a network failure or any other status
//     Unreachable. Without a token, or through a clone without one, NotSupported before any request; through a clone with a token, the REST adapter.
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
const GH = "/repos/carol/sprint-tool/pulls/12";
const GL = "/api/v4/projects/space%2Fsprint-tool/merge_requests/12";
const HEAD = "2".repeat(40);
const MOVED = "3".repeat(40);
const MERGE = "9".repeat(40);

const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
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
const merges = (requests) => requests.filter((r) => r.method !== "GET");

// A server of each kind: pull / merge request 12 stands at `head`; the merge answers `merging(request)`.
const github = (head, merging = () => json(200, { sha: MERGE, merged: true, message: "Pull Request successfully merged" })) => (r) =>
  r.method === "GET" ? json(200, { number: 12, state: "open", head: { ref: "item/x", sha: head }, base: { ref: "develop", sha: "b".repeat(40) } }) : merging(r);
const gitlab = (head, merging = () => json(200, { iid: 12, state: "merged", sha: HEAD, merge_commit_sha: MERGE })) => (r) =>
  r.method === "GET" ? json(200, { iid: 12, state: "opened", sha: head, source_branch: "item/x", target_branch: "develop" }) : merging(r);
const SERVERS = [
  ["GitHub", () => connect(GITHUB, { token: GH_TOKEN }), github, GH, "authorization", `Bearer ${GH_TOKEN}`, GH_TOKEN],
  ["GitLab", () => connect(GITLAB, { token: GL_TOKEN }), gitlab, GL, "private-token", GL_TOKEN, GL_TOKEN],
];

// TST-748001 · level: unit · module: MOD-repository-hosts
// guards: UC-027; CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; ONE CLICK PER DECISION; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: on each server a repository, a token, and pull request 12 whose head is 2222…; a server that merges it into the commit 9999…
// input: mergePullRequest(12, "2222…")
// expect: { commit: "9999…" }; the requests are the read of pull request 12 and one PUT to its …/merge address carrying the head as `sha` (and no merge method), the token only in the authorisation header
for (const [label, connectTo, server, path, header, value, token] of SERVERS) {
  test(`mergePullRequest on ${label} — at the expected head it merges, carrying that head, and returns the merge commit`, async () => {
    const { result, requests } = await serving(server(HEAD), () => connectTo().mergePullRequest(12, HEAD));
    assert.deepEqual(result, { commit: MERGE });
    assert.deepEqual(requests.map((r) => [r.method, r.path]), [["GET", path], ["PUT", `${path}/merge`]]);
    assert.deepEqual(requests[1].body, { sha: HEAD });
    for (const r of requests) {
      assert.equal(r.headers[header], value);
      assert.ok(!r.href.includes(token), "the token is in no address");
    }
  });
}

// TST-748002 · level: unit · module: MOD-repository-hosts
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: on each server, pull request 12 whose head is now 3333…, not the 2222… that was read
// input: mergePullRequest(12, "2222…"); first the same call at 3333…, which merges
// expect: HostError Moved with head "3333…", and no request other than reads is sent (no merge request)
for (const [label, connectTo, server] of SERVERS) {
  test(`mergePullRequest on ${label} — a head that moved is Moved, and no merge is sent`, async () => {
    const positive = await serving(server(MOVED), () => connectTo().mergePullRequest(12, MOVED));
    assert.equal(positive.result.commit, MERGE, "known positive: at the head that stands it merges");
    assert.equal(merges(positive.requests).length, 1);
    const { result: e, requests } = await serving(server(MOVED), () => failure(connectTo().mergePullRequest(12, HEAD)));
    assert.equal(e?.name, "Moved");
    assert.equal(e.head, MOVED);
    assert.deepEqual(merges(requests), []);
  });
}

// TST-748003 · level: unit · module: MOD-repository-hosts
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: on each server, a head that is the expected one when read, and a merge that the server answers 409 (the head moved in between)
// input: mergePullRequest(12, "2222…")
// expect: HostError Moved
for (const [label, connectTo, server] of SERVERS) {
  test(`mergePullRequest on ${label} — a head that moves after it was read is refused by the server and is Moved`, async () => {
    const { result: e } = await serving(server(HEAD, () => json(409, { message: "Head branch was modified. Review and try the merge again." })), () => failure(connectTo().mergePullRequest(12, HEAD)));
    assert.equal(e?.name, "Moved");
  });
}

// TST-748004 · level: unit · module: MOD-repository-hosts
// guards: CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: on each server, branch protection that refuses the merge: 405 (both servers) or 422, with the server's message
// input: mergePullRequest(12, "2222…"); first the same call against a server that allows it
// expect: the allowed call returns the merge commit; each refusal is HostError NotMergeable whose reason is the server's message
for (const [label, connectTo, server] of SERVERS) {
  test(`mergePullRequest on ${label} — a refusal by the server is NotMergeable with its reason`, async () => {
    const positive = await serving(server(HEAD), () => connectTo().mergePullRequest(12, HEAD));
    assert.equal(positive.result.commit, MERGE, "known positive");
    for (const status of [405, 422]) {
      const message = `Required status check "ci" is expected (${status}).`;
      const { result: e } = await serving(server(HEAD, () => json(status, { message })), () => failure(connectTo().mergePullRequest(12, HEAD)));
      assert.equal(e?.name, "NotMergeable", `${label} ${status}: ${e}`);
      assert.match(String(e.reason), /Required status check "ci" is expected/);
    }
  });
}

// TST-748005 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: on each server, a token; the known positive is the merge at the expected head
// input: mergePullRequest(12, head) when the merge is answered 401; 403; 404; 403 with X-RateLimit-Remaining 0 and X-RateLimit-Limit 5000 (GitHub) / 429 (GitLab); 500; and when fetch rejects with "offline"
// expect: 401 TokenRefused; 403 and 404 PermissionMissing; the used-up limit RateLimited with limit "account"; 500 and the rejected fetch Unreachable (the latter with reason "offline")
for (const [label, connectTo, server, , , , ] of SERVERS) {
  const limited = label === "GitHub"
    ? () => json(403, { message: "rate limit" }, { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "1792227600" })
    : () => json(429, { message: "Retry later" });
  test(`mergePullRequest on ${label} — each failure is named, beside the success`, async () => {
    assert.equal((await serving(server(HEAD), () => connectTo().mergePullRequest(12, HEAD))).result.commit, MERGE, "known positive");
    for (const [what, answer, name] of [
      ["401", () => json(401, { message: "Bad credentials" }), "TokenRefused"],
      ["403", () => json(403, { message: "Forbidden" }), "PermissionMissing"],
      ["404", () => json(404, { message: "Not Found" }), "PermissionMissing"],
      ["a used-up limit", limited, "RateLimited"],
      ["500", () => json(500, { message: "oops" }), "Unreachable"],
    ]) {
      const { result: e } = await serving(server(HEAD, answer), () => failure(connectTo().mergePullRequest(12, HEAD)));
      assert.equal(e?.name, name, `${label} ${what}: ${e}`);
      if (name === "RateLimited") assert.equal(e.limit, "account");
    }
    const { result: offline } = await serving(() => { throw new Error("offline"); }, () => failure(connectTo().mergePullRequest(12, HEAD)));
    assert.equal(offline?.name, "Unreachable");
    assert.match(String(offline.reason), /offline/);
  });
}

// TST-748006 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-027
// given: a host of each server without a token; the same host with a token is shown to merge first
// input: mergePullRequest(12, head) without a token; with a clone and a token; with a clone and no token
// expect: without a token HostError NotSupported and not one request; through a clone with a token the REST adapter's requests (GET, PUT of pull request 12) and the merge commit; through a clone without a token NotSupported and no request
test("mergePullRequest — without a token it is NotSupported and sends nothing; through a clone a token makes the REST adapter merge", async () => {
  const folder = mkdtempSync(join(tmpdir(), "itm748-clone-"));
  try {
    for (const [address, token, server, path] of [[GITHUB, GH_TOKEN, github, GH], [GITLAB, GL_TOKEN, gitlab, GL]]) {
      const positive = await serving(server(HEAD), () => connect(address, { token }).mergePullRequest(12, HEAD));
      assert.equal(positive.result.commit, MERGE, "known positive: with a token it merges");
      for (const credentials of [{}, { clone: folder }]) {
        const { result: e, requests } = await serving(server(HEAD), () => failure(connect(address, credentials).mergePullRequest(12, HEAD)));
        assert.equal(e?.name, "NotSupported");
        assert.deepEqual(requests, []);
      }
      const { result, requests } = await serving(server(HEAD), () => connect(address, { clone: folder, token }).mergePullRequest(12, HEAD));
      assert.deepEqual(requests.map((r) => [r.method, r.path]), [["GET", path], ["PUT", `${path}/merge`]]);
      assert.equal(result.commit, MERGE);
    }
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-748007 · level: unit · module: MOD-repository-hosts
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; UC-027
// given: a GitHub host with a token
// input: mergePullRequest with a number that is 0, 1.5 or not a number; an expected head that is blank or not a text
// expect: the full call is first shown to succeed; each of the others throws a TypeError and makes no request
test("mergePullRequest — a number that is no pull request's or a blank expected head is a TypeError and sends nothing", async () => {
  const host = connect(GITHUB, { token: GH_TOKEN });
  assert.equal((await serving(github(HEAD), () => host.mergePullRequest(12, HEAD))).result.commit, MERGE, "known positive");
  for (const [number, head] of [[0, HEAD], [1.5, HEAD], ["12", HEAD], [12, " "], [12, undefined], [12, 5]]) {
    const { result: e, requests } = await serving(github(HEAD), () => failure(host.mergePullRequest(number, head)));
    assert.ok(e instanceof TypeError, `${number}, ${head}: ${e}`);
    assert.deepEqual(requests, []);
  }
});
