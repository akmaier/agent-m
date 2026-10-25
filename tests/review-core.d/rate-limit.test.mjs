// A used-up rate limit, told from a refused token and from a missing permission, by the hosts of MOD-repository-hosts
// (src/repository-hosts/index.mjs connect; RateLimited, TokenRefused, PermissionMissing) — deterministic, no network.
// Run through tests/review-core.test.mjs, which SPEC.md names for these checks: node --test tests/*.test.mjs
//
// Module: MOD-repository-hosts
// Guards: A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
// Level: component
//
// The servers' answers are the ones measured on 2026-10-01 (SPEC queue 2026-10-01b): GitHub answers a used-up limit with
// `403` or `429` and exposes X-RateLimit-Limit, -Remaining and -Reset to pages; gitlab.com answers `429` and exposes no
// rate-limit header to pages. Each server here is a fake of `fetch` that answers every request with that answer.

import test from "node:test";
import assert from "node:assert/strict";
import { parseAddress, connect } from "../../src/repository-hosts/index.mjs";
import { withFetch, GL_ADDR, GL_TOKEN } from "./helpers.mjs";

const GITHUB = parseAddress("https://github.com/akmaier/agent-m"), GITLAB = parseAddress(GL_ADDR);
const GH_TOKEN = "github_pat_STORED0123456789abcdef";
const RESET = 1790000000; // X-RateLimit-Reset: seconds since 1970, UTC
const limitHeaders = (limit, remaining = 0) => ({ "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": String(remaining),
  "X-RateLimit-Used": String(limit - remaining), "X-RateLimit-Reset": String(RESET), "X-RateLimit-Resource": "core" });
// A server that answers every request with `status`, `headers` and `message`; every request is recorded.
function answering(status, headers = {}, message = "API rate limit exceeded for user ID 1.") {
  const sent = [];
  const fetchMock = async (u, init = {}) => {
    sent.push(`${(init.method ?? "GET").toUpperCase()} ${u}`);
    return new Response(JSON.stringify({ message }), { status, headers: { "Content-Type": "application/json", ...headers } });
  };
  return { sent, fetchMock };
}
// The failure a call through a host ends in, under a server that answers as `server` does.
const failure = (server, call) => withFetch(server.fetchMock, () => Promise.resolve().then(call).then(() => null, (e) => e));
const info = (address, token) => () => connect(address, { token }).repositoryInfo();

// A USED-UP RATE LIMIT IS NAMED — Expected: GitHub's 403 with X-RateLimit-Remaining: 0 and X-RateLimit-Limit: 5000 fails the read
// as RateLimited, the account's limit, with the reset time the server sent — not as a refused token and not as a missing
// permission. Known positive of the fake: the same server answering 200 gives the repository's information.
test("A USED-UP RATE LIMIT IS NAMED — a 403 with X-RateLimit-Remaining: 0 and X-RateLimit-Limit: 5000 is the account's limit, with its reset time", async () => {
  const fine = await withFetch(async () => new Response(JSON.stringify({ default_branch: "main", visibility: "public" }), { status: 200 }),
    () => connect(GITHUB, { token: GH_TOKEN }).repositoryInfo());
  assert.equal(fine.defaultBranch, "main", "known positive");
  const e = await failure(answering(403, limitHeaders(5000)), info(GITHUB, GH_TOKEN));
  assert.equal(e?.name, "RateLimited", "named as a used-up limit, neither TokenRefused nor PermissionMissing");
  assert.equal(e.limit, "account");
  assert.equal(e.resetsAt?.getTime(), RESET * 1000);
});

// A USED-UP RATE LIMIT IS NAMED — Expected: GitHub's 429 with the same headers is the same limit.
test("A USED-UP RATE LIMIT IS NAMED — GitHub's 429 is the same limit", async () => {
  const e = await failure(answering(429, limitHeaders(5000)), info(GITHUB, GH_TOKEN));
  assert.deepEqual([e?.name, e?.limit, e?.resetsAt?.getTime()], ["RateLimited", "account", RESET * 1000]);
});

// A USED-UP RATE LIMIT IS NAMED — Expected: without a token, X-RateLimit-Limit: 60 is the network's limit, with its reset time.
test("A USED-UP RATE LIMIT IS NAMED — without a token, X-RateLimit-Limit: 60 is the network's limit", async () => {
  const e = await failure(answering(403, limitHeaders(60)), info(GITHUB, null));
  assert.deepEqual([e?.name, e?.limit, e?.resetsAt?.getTime()], ["RateLimited", "network", RESET * 1000]);
});

// A USED-UP RATE LIMIT IS NAMED — counter-proof. Expected: a 403 without those headers is still a missing permission
// (PermissionMissing), and so is one whose limit is not used up; a 404 with them is NotFound, no limit.
test("A USED-UP RATE LIMIT IS NAMED — counter-proof: a 403 without those headers is still a missing permission, not a limit", async () => {
  const plain = await failure(answering(403, {}, "Resource not accessible by personal access token"), info(GITHUB, GH_TOKEN));
  assert.equal(plain?.name, "PermissionMissing");
  const left = await failure(answering(403, limitHeaders(5000, 4711), "Resource not accessible by personal access token"), info(GITHUB, GH_TOKEN));
  assert.equal(left?.name, "PermissionMissing");
  assert.equal((await failure(answering(404, limitHeaders(5000), "Not Found"), info(GITHUB, GH_TOKEN)))?.name, "NotFound");
});

// A USED-UP RATE LIMIT IS NAMED — Expected: a write refused with a used-up limit is that limit too, and nothing is written.
test("A USED-UP RATE LIMIT IS NAMED — a refused write is named the same, and nothing is written", async () => {
  const server = answering(403, limitHeaders(5000));
  const e = await failure(server, () => connect(GITHUB, { token: GH_TOKEN }).commitFiles({ branch: "main", expectedHead: "a".repeat(40),
    message: "m", files: [{ path: "a.md", text: "x\n" }] }));
  assert.deepEqual([e?.name, e?.limit, e?.resetsAt?.getTime()], ["RateLimited", "account", RESET * 1000]);
  assert.deepEqual(server.sent.filter((s) => !s.startsWith("GET ")), [], "nothing is written");
});

// A USED-UP RATE LIMIT IS NAMED — Expected: a GitLab project's 429 is the account's limit with its project token, the network's
// without one, named without a time where the server gives the page none. Counter-proof: GitLab's 403 is a protected branch or
// a missing scope — PermissionMissing, no limit.
test("A USED-UP RATE LIMIT IS NAMED — a GitLab product's 429 is its limit, named without a time; a 403 there is not", async () => {
  const withToken = await failure(answering(429, {}, "Retry later"), info(GITLAB, GL_TOKEN));
  assert.deepEqual([withToken?.name, withToken?.limit, withToken?.resetsAt], ["RateLimited", "account", null]);
  const without = await failure(answering(429, {}, "Retry later"), info(GITLAB, null));
  assert.deepEqual([without?.name, without?.limit, without?.resetsAt], ["RateLimited", "network", null]);
  assert.equal((await failure(answering(403, {}, "403 Forbidden"), info(GITLAB, GL_TOKEN)))?.name, "PermissionMissing");
});

// AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — Expected: a 401 stays a refused token even when the answer carries a used-up
// limit's headers, as GitHub sends them on every answer: TokenRefused, naming the GitHub token and GitHub's list of the person's
// tokens, where it is renewed; never RateLimited.
test("AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED — a 401 stays a refused token, rate-limit headers or not", async () => {
  const e = await failure(answering(401, limitHeaders(60, 0), "Bad credentials"), info(GITHUB, GH_TOKEN));
  assert.deepEqual([e?.name, e?.tokenName, e?.renewal], ["TokenRefused", "GitHub token", "https://github.com/settings/personal-access-tokens"]);
});
