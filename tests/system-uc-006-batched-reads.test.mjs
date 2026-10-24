// UC-006 system tests of batched reads (ITM-479): the reviewer opens the SPEC entries list and an entry with its impact list, over a
// product of 1,332 files on GitHub with the reviewer's token, and the files the impact list needs are read in a handful of requests.
// Run: node --test tests/system-uc-006-batched-reads.test.mjs
//
// Module: MOD-review-pages · MOD-spec-changes · MOD-trace-graph · MOD-repository-hosts
// Guards: UC-006; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
// Level: system
//
// The page is the `spec-entry` route of MOD-review-pages over MOD-repository-hosts' real GitHub host, as tests/system-uc-006-approve-spec-change.test.mjs
// reaches it; GitHub is a fake of `fetch` (tests/uc-006-batched-reads-harness.mjs) that answers as GitHub's REST API and GraphQL API answer.
// Nothing reaches the network. Written from UC-006 steps 1 to 2 and alternative 3b, by a developer who implemented none of the behaviour. The impact
// list is derived from the trace graph the workflow "main changed" stored for the commit, which the page reads in one request and never builds
// (MOD-trace-graph: "A page never builds the graph: it reads the stored one through `storedGraph`"), so the number of the product's files no longer
// adds requests. Every expected number is written out in its test, with the arithmetic.

import test from "node:test";
import assert from "node:assert/strict";
import { productFiles, fakeGitHub, openPage, byClass, ENTRY_ID } from "./uc-006-batched-reads-harness.mjs";

const QUEUE = "docs/spec-freigaben/2026-03-01_sample";
// The page reads no file of the product on its own: the queue's index and decisions come in one batch, the SPEC in the next one, the entry's proposal
// and rationale in a third; the graph is the stored one, `<commit>.json.gz` on the branch trace-cache, read by one request.
const GRAPH = /^[0-9a-f]{40}\.json\.gz$/;
const graphReads = (fake) => fake.requests.filter((r) => r.url.pathname.endsWith(".json.gz") && (r.url.searchParams.get("ref") === "trace-cache" || r.url.pathname.includes("/trace-cache/")));

// TST-479101 · level: system · module: MOD-review-pages; MOD-trace-graph; MOD-repository-hosts
// guards: UC-006; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
// given: a product on GitHub with 1,332 files (SPEC.md, 2 use cases, 1,329 backlog items) and one open entry 07 that changes "A WRITE RULE", which UC-002 realises; the reviewer's token is stored
// input: open the SPEC-entry page of entry 07
// expect: the page shows the current text, the proposal, the difference, the rationale and the impact list "A WRITE RULE — changed, named by UC-002", as before; in all at most 7 requests (1 repository + 2 snapshot + 3 GraphQL queries: one of the queue's 2 files, one of SPEC.md, one of the entry's 2 files (proposal and rationale) + 1 read of the stored graph), of which the GETs of file contents are none but the stored graph's; nothing is written
test("TST-479101: UC-006 3b opens an entry with its impact list over 1,332 files in at most 7 requests", async () => {
  const fake = fakeGitHub(productFiles(1332));
  const page = await openPage(fake, { id: ENTRY_ID });

  assert.match(byClass(page, "section", "current")[0].textContent, /A writer writes a file whole/);
  assert.match(byClass(page, "section", "proposal")[0].textContent, /A writer writes a file entirely/);
  assert.match(byClass(page, "section", "difference")[0].textContent, /\+ A writer writes a file entirely\./);
  assert.match(byClass(page, "section", "difference")[0].textContent, /- A writer writes a file whole\./);
  assert.match(byClass(page, "section", "rationale")[0].textContent, /fixture reviewer needs a proposed wording/);
  assert.equal(byClass(page, "ul", "impact")[0].textContent, "A WRITE RULE — changed, named by UC-002");

  // The queue's 2 files, SPEC.md, the entry's proposal and rationale: 3 queries; the graph of the 1,332 files is read stored, by one request.
  assert.deepEqual(fake.namedPerQuery(), [2, 1, 2]);
  assert.deepEqual(fake.contentPaths().filter((path) => !GRAPH.test(path)), []);
  assert.equal(graphReads(fake).length, 1, "the stored graph, read once");
  assert.ok(fake.requests.length <= 7, `${fake.requests.length} requests, at most 7`);
  assert.deepEqual(fake.requests.filter((r) => r.method !== "GET").map((r) => `${r.method} ${r.url.pathname}`), Array(3).fill("POST /graphql"), "only the 3 queries are POSTs: nothing is written");
});

// TST-479102 · level: system · module: MOD-review-pages; MOD-spec-changes; MOD-repository-hosts
// guards: UC-006
// given: the same product of 1,332 files and the reviewer's token
// input: open the SPEC entries list (the page without an id)
// expect: the list shows entry 07 as open; at most 5 requests (1 repository + 2 snapshot + 2 GraphQL queries: one of the queue's index and decisions, one of SPEC.md), no read of a file on its own, no read of a backlog item
test("TST-479102: UC-006 1 opens the SPEC entries list over 1,332 files in at most 5 requests", async () => {
  const fake = fakeGitHub(productFiles(1332));
  const page = await openPage(fake, {});

  assert.match(page.textContent, /entry 07|07/);
  assert.match(page.textContent, /open/);
  assert.deepEqual(fake.contentPaths(), []);
  assert.deepEqual(fake.namedPerQuery(), [2, 1]);
  assert.ok(fake.requests.length <= 5, `${fake.requests.length} requests, at most 5`);
});

// TST-479104 · level: system · module: MOD-review-pages; MOD-trace-graph; MOD-repository-hosts
// guards: UC-006; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// given: the product of 1,332 files on a GitHub whose /graphql answers 404 (a server that serves none); the reviewer's token
// input: open the SPEC-entry page of entry 07
// expect: the page is the same as with GraphQL (impact list "A WRITE RULE — changed, named by UC-002", the five sections); the batch is tried once by each of the three reads ahead (3 requests to /graphql: the queue's two files, SPEC.md, the entry's proposal and rationale), then each of the 5 files of the page is read on its own; the graph is the stored one, read by one request: 5 + 1 = 6 GETs of file contents
test("TST-479104: UC-006 3b is unchanged on a server that serves no /graphql", async () => {
  const fake = fakeGitHub(productFiles(1332), { graphql: () => new Response(JSON.stringify({ message: "Not Found" }), { status: 404, headers: { "Content-Type": "application/json" } }) });
  const page = await openPage(fake, { id: ENTRY_ID });

  assert.equal(byClass(page, "ul", "impact")[0].textContent, "A WRITE RULE — changed, named by UC-002");
  assert.match(byClass(page, "section", "current")[0].textContent, /A writer writes a file whole/);
  assert.match(byClass(page, "section", "proposal")[0].textContent, /A writer writes a file entirely/);
  assert.match(byClass(page, "section", "rationale")[0].textContent, /fixture reviewer needs a proposed wording/);
  assert.equal(fake.graphqlRequests().length, 3, "the batch is tried once by each read ahead and no more");
  assert.equal(fake.contentPaths().filter((path) => !GRAPH.test(path)).length, 5);
  assert.equal(graphReads(fake).length, 1, "the stored graph, read once");
});

// TST-479105 · level: system · module: MOD-review-pages; MOD-trace-graph; MOD-repository-hosts
// guards: UC-006; WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
// given: the product of 1,332 files, public, and no token stored in the browser
// input: open the SPEC-entry page of entry 07
// expect: the page shows the impact list "A WRITE RULE — changed, named by UC-002"; nothing is read ahead: 0 requests to /graphql, no request carries an Authorization header, and every file the page reads is read on its own from GitHub's raw host: the 5 own reads + the stored graph = 6
test("TST-479105: UC-006 4b without a token reads nothing ahead and sends no credentials", async () => {
  const fake = fakeGitHub(productFiles(1332));
  const page = await openPage(fake, { id: ENTRY_ID }, { token: null });

  assert.equal(byClass(page, "ul", "impact")[0].textContent, "A WRITE RULE — changed, named by UC-002");
  assert.equal(fake.graphqlRequests().length, 0);
  assert.equal(fake.requests.filter((r) => "authorization" in r.headers).length, 0);
  assert.equal(fake.requests.filter((r) => r.url.origin === "https://raw.githubusercontent.com").length, 6);
  assert.equal(graphReads(fake).length, 1, "the stored graph, read once from the raw host");
});
