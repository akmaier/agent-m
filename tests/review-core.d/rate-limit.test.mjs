// A used-up rate limit, told from a refused token (docs/assets/git-host.mjs usedUpLimit) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-git-host
// Guards: A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
// Level: component
//
// The servers' answers are the ones measured on 2026-10-01 (SPEC queue 2026-10-01b): GitHub answers a used-up limit with
// `403` or `429` and exposes X-RateLimit-Limit, -Remaining and -Reset to pages; gitlab.com answers `429` and exposes no
// rate-limit header to pages. Each check below was first red on the commit that held only these tests (ITM-005); the faults
// planted afterwards in the finished code, and the checks they turned red, are listed in the pull request of ITM-005.

import test from "node:test";
import assert from "node:assert/strict";
import * as gitHost from "../../docs/assets/git-host.mjs";
import { fakeGitHub, withFetch, GL_ADDR, GL_TOKEN, fakeGitLab } from "./helpers.mjs";

const { fetchText, tokenRefusal, parseProductAddress, gitlabAuth, gitlabApiBase, commitFiles, commitFilesGitLab } = gitHost;
// The authority a write is made on (ARC-003 decision 3): here a person's click.
const authority = Object.freeze({ kind: "click" });

const RESET = 1790000000; // X-RateLimit-Reset: seconds since 1970, UTC
const limitHeaders = (limit, remaining = 0) => ({ "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining),
  "X-RateLimit-Used": String(limit - remaining), "X-RateLimit-Reset": String(RESET), "X-RateLimit-Resource": "core" });
const answer = (status, headers = {}, message = "API rate limit exceeded for user ID 1.") =>
  async () => new Response(JSON.stringify({ message }), { status, statusText: status === 403 ? "Forbidden" : "Too Many Requests", headers });
// The error fetchText throws for one GET to GitHub's API — with the token or without one.
async function readError(fetchMock, token = "github_pat_STORED") {
  let err = null;
  await withFetch(fetchMock, async () => {
    try { await fetchText("https://api.github.com/repos/akmaier/agent-m/commits/main", {}, token); } catch (e) { err = e; }
  });
  assert.ok(err, "the request was refused");
  return err;
}

test("A USED-UP RATE LIMIT IS NAMED — a 403 with X-RateLimit-Remaining: 0 and X-RateLimit-Limit: 5000 is the account's limit, with its reset time", async () => {
  const err = await readError(answer(403, limitHeaders(5000)));
  const l = gitHost.usedUpLimit(err, null);
  assert.ok(l, "named as a used-up limit");
  assert.equal(l.limit, "account");
  assert.ok(l.resetsAt instanceof Date);
  assert.equal(l.resetsAt.getTime(), RESET * 1000);
  // ... and not as a refused token: such an error never reaches tokenRefusal.
  assert.equal(tokenRefusal(err), null);
});

test("A USED-UP RATE LIMIT IS NAMED — GitHub's 429 is the same limit", async () => {
  const l = gitHost.usedUpLimit(await readError(answer(429, limitHeaders(5000))), null);
  assert.deepEqual(l && { limit: l.limit, at: l.resetsAt?.getTime() }, { limit: "account", at: RESET * 1000 });
});

test("A USED-UP RATE LIMIT IS NAMED — without a token, X-RateLimit-Limit: 60 is the network's limit", async () => {
  const err = await readError(answer(403, limitHeaders(60)), null);
  const l = gitHost.usedUpLimit(err, null);
  assert.deepEqual(l && { limit: l.limit, at: l.resetsAt?.getTime() }, { limit: "network", at: RESET * 1000 });
  assert.equal(tokenRefusal(err), null);
});

test("A USED-UP RATE LIMIT IS NAMED — counter-proof: a 403 without those headers is still a missing permission, not a limit", async () => {
  const plain = await readError(answer(403, {}, "Resource not accessible by personal access token"));
  assert.equal(gitHost.usedUpLimit(plain, null), null);
  // A limit that is not used up does not mark the refusal either.
  const left = await readError(answer(403, limitHeaders(5000, 4711), "Resource not accessible by personal access token"));
  assert.equal(gitHost.usedUpLimit(left, null), null);
  // Nor a status other than 403 or 429.
  assert.equal(gitHost.usedUpLimit(await readError(answer(404, limitHeaders(5000), "Not Found")), null), null);
  assert.equal(gitHost.usedUpLimit(null, null), null);
});

test("A USED-UP RATE LIMIT IS NAMED — a refused write carries the server's headers too", async () => {
  const g = fakeGitHub();
  const limited = async (u, init) => (init.method === "GET" && new URL(u).pathname.endsWith("/git/ref/heads/main")
    ? answer(403, limitHeaders(5000))() : g.fetchMock(u, init));
  let err = null;
  await withFetch(limited, async () => {
    try {
      await commitFiles({ repo: "akmaier/agent-m", branch: "main", files: [{ path: "a.md", content: "x\n" }], message: "m",
        token: "github_pat_STORED", authority });
    } catch (e) { err = e; }
  });
  assert.ok(err && err.status === 403, "the write was refused with 403");
  const l = gitHost.usedUpLimit(err, null);
  assert.equal(l?.limit, "account");
  assert.equal(l?.resetsAt?.getTime(), RESET * 1000);
  assert.equal(tokenRefusal(err), null);
});

test("A USED-UP RATE LIMIT IS NAMED — a GitLab product's 429 is its limit, named without a time; a 403 there is not", async () => {
  const p = parseProductAddress(GL_ADDR);
  const read = async (status, token) => {
    let err = null;
    await withFetch(answer(status, {}, "Retry later"), async () => {
      try { await fetchText(gitlabApiBase(p), {}, gitlabAuth(p, token)); } catch (e) { err = e; }
    });
    return err;
  };
  const withToken = gitHost.usedUpLimit(await read(429, GL_TOKEN), p);
  assert.deepEqual(withToken, { limit: "account", resetsAt: null });
  const without = gitHost.usedUpLimit(await read(429, null), p);
  assert.deepEqual(without, { limit: "network", resetsAt: null });
  // Counter-proof: GitLab's 403 is a protected branch or a missing scope, not a limit.
  assert.equal(gitHost.usedUpLimit(await read(403, GL_TOKEN), p), null);
  // A write to a GitLab product refused with 429 is the same limit.
  const m = await fakeGitLab({ files: { "SPEC.md": "x\n" }, postStatus: 429, postBody: { message: "Retry later" } });
  let err = null;
  await withFetch(m.fetchMock, async () => {
    try {
      await commitFilesGitLab({ product: p, branch: "main", message: "m", token: GL_TOKEN, authority, files: [{ path: "SPEC.md", content: "y\n" }] });
    } catch (e) { err = e; }
  });
  assert.equal(err?.status, 429);
  assert.deepEqual(gitHost.usedUpLimit(err, p), { limit: "account", resetsAt: null });
});

test("AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a 401 stays a refused token, rate-limit headers or not", async () => {
  // GitHub sends its rate-limit headers on every answer, a refusal of the token included — even one whose limit is used up.
  const err = await readError(answer(401, limitHeaders(60, 0), "Bad credentials"));
  assert.equal(gitHost.usedUpLimit(err, null), null, "a refused token is not a used-up limit");
  const r = tokenRefusal(err);
  assert.equal(r?.token, "GitHub token");
  assert.equal(r?.renewUrl, "https://github.com/settings/personal-access-tokens");
});
