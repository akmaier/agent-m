// UC-006 release tests of batched reads (ITM-479), one for each requirement ITM-479 realises besides UC-006 itself: A REQUIREMENT IS NOT
// CHANGED WITHOUT AN IMPACT LIST, A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT, A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN.
// Run: node --test tests/release-uc-006-batched-reads.test.mjs
//
// Module: MOD-review-pages · MOD-trace-graph · MOD-repository-hosts
// Guards: UC-006; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// Level: release
//
// Input: the SPEC-entry page of a product of 1,332 files on a fake GitHub (tests/uc-006-batched-reads-harness.mjs), opened as the dashboard opens it.
// Precondition: the reviewer's token is stored, except where a test says otherwise. Nothing reaches the network.
// Expected result: stated in each test. Written by a developer who implemented none of the behaviour; no expected value is read from a document.

import test from "node:test";
import assert from "node:assert/strict";
import { productFiles, fakeGitHub, openPage, byClass, ENTRY_ID, TOKEN } from "./uc-006-batched-reads-harness.mjs";

// TST-479201 · level: release · module: MOD-review-pages; MOD-trace-graph; MOD-repository-hosts
// guards: UC-006; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: the product of 1,332 files in which UC-002, the only artifact that names "A WRITE RULE", is the last file of the tree, so that it lies in the last query of 31 files
// input: open the SPEC-entry page of entry 07, which changes "A WRITE RULE"
// expect: the impact list reads "A WRITE RULE — changed, named by UC-002", though the use case came in the last of 14 queries; at most 14 queries and at most 22 requests in all, against the 1,336 of one request for each file
test("TST-479201: an impact list names the artifact read in the last batch, within 14 queries", async () => {
  const held = productFiles(1332), uc2 = "docs/use-cases/UC-002-write-a-file.md";
  const last = held[uc2];
  delete held[uc2];
  held[uc2] = last;
  const fake = fakeGitHub(held);
  const page = await openPage(fake, { id: ENTRY_ID });

  assert.equal(byClass(page, "ul", "impact")[0].textContent, "A WRITE RULE — changed, named by UC-002");
  assert.ok(fake.graphqlRequests().at(-1).body.query.includes(uc2), "UC-002 stands in the last query");
  assert.equal(fake.namedPerQuery().at(-1), 31);
  assert.ok(fake.graphqlRequests().length <= 14);
  assert.ok(fake.requests.length <= 22, `${fake.requests.length} requests, at most 22`);
});

// TST-479202 · level: release · module: MOD-review-pages; MOD-trace-graph; MOD-repository-hosts
// guards: UC-006; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: the product on GitHub with the reviewer's token stored
// input: open the SPEC-entry page of entry 07 (the 14 queries and the reads are made)
// expect: every request goes to https://api.github.com; every request carries "Authorization: Bearer <the token>"; the token is in no address and no body; each query is a POST to https://api.github.com/graphql; and the 14 POSTs are the only requests not GET
test("TST-479202: the token goes only to api.github.com, in the header, also on the batched reads", async () => {
  const fake = fakeGitHub(productFiles(1332));
  await openPage(fake, { id: ENTRY_ID });

  assert.ok(fake.requests.length > 0);
  for (const r of fake.requests) {
    assert.equal(r.url.origin, "https://api.github.com", r.url.href);
    assert.equal(r.headers.authorization, `Bearer ${TOKEN}`, r.url.href);
    assert.equal(r.url.href.includes(TOKEN) || JSON.stringify(r.body ?? "").includes(TOKEN), false, r.url.href);
  }
  const queries = fake.graphqlRequests();
  assert.equal(queries.length, 14);
  for (const q of queries) { assert.equal(q.method, "POST"); assert.equal(q.url.href, "https://api.github.com/graphql"); }
  assert.equal(fake.requests.filter((r) => r.method !== "GET").length, 14);
});

// TST-479203 · level: release · module: MOD-review-pages; MOD-trace-graph; MOD-repository-hosts
// guards: UC-006; A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
// given: the product on GitHub with the reviewer's token; the account's hourly limit is used up, which GitHub tells on a query as (a) 403 with X-RateLimit-Remaining: 0 and (b) 200 with the error type RATE_LIMITED and X-RateLimit-Remaining: 0; and, apart, (c) a query answered 401 "Bad credentials"
// input: open the SPEC-entry page of entry 07 for each
// expect: (a) and (b) fail with RateLimited, whose text names the used-up limit and its reset (2030-01-01) and does not mention the token; (c) fails with TokenRefused; no file is read on its own after the limit is named
test("TST-479203: a used-up limit on a batched read is named RateLimited, a refused token TokenRefused", async () => {
  const limit = { "Content-Type": "application/json", "x-ratelimit-remaining": "0", "x-ratelimit-limit": "5000", "x-ratelimit-reset": "1893456000" };
  const answers = [
    [() => new Response(JSON.stringify({ message: "API rate limit exceeded" }), { status: 403, headers: limit }), "RateLimited"],
    [() => new Response(JSON.stringify({ data: null, errors: [{ type: "RATE_LIMITED", message: "API rate limit exceeded for user ID 1." }] }), { status: 200, headers: limit }), "RateLimited"],
    [() => new Response(JSON.stringify({ message: "Bad credentials" }), { status: 401, headers: { "Content-Type": "application/json" } }), "TokenRefused"],
  ];
  for (const [graphql, name] of answers) {
    const fake = fakeGitHub(productFiles(1332), { graphql });
    const failure = await openPage(fake, { id: ENTRY_ID }).then(() => null, (e) => e);
    assert.equal(failure?.name, name);
    if (name === "RateLimited") {
      assert.match(failure.message, /request limit/);
      assert.match(failure.message, /used up/);
      assert.match(failure.message, /2030-01-01/);
      assert.doesNotMatch(failure.message, /token/i);
    }
    assert.equal(fake.contentPaths().filter((p) => p.startsWith("docs/backlog/")).length, 0, "no backlog item is read on its own after the failure");
  }
});
