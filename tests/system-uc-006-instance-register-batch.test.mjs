// UC-006 system tests of the instance's register on a product's SPEC-entry page (ITM-844): the register of requirement sources lives in the
// instance's repository, not in the product's. Drawing the page reads none of it: the page's subject gives no source of the person — the person's account
// is the source the prompt bar gives every message (MOD-prompt-bar, MOD-review-pages) —, so the register is read only where the page needs it, on acceptance.
// Run: node --test tests/system-uc-006-instance-register-batch.test.mjs
//
// Module: MOD-review-pages
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; THE PERSON WHO PROMPTS IS A SOURCE; A REQUIREMENT HAS A REGISTERED SOURCE
// Level: system
//
// The page is the `spec-entry` route of MOD-review-pages over the real GitHub host, as tests/system-uc-006-batched-reads.test.mjs reaches it, but here the
// instance is a second fake GitHub (alice/agent-m, tests/uc-006-batched-reads-harness.mjs) that holds the register, so the read of the register is reached.
// The product is a fake GitHub of 10 files. Every request of each repository is recorded by its own fake. Every expected number is written out in its test.

import test from "node:test";
import assert from "node:assert/strict";
import { productWithLinks, instanceFiles, INSTANCE_REPO, fakeGitHub, openPage, lastContext, ENTRY_ID } from "./uc-006-batched-reads-harness.mjs";

const pages = await import("../src/review-pages/index.mjs");
const route = pages.view.routes.find((candidate) => candidate.name === "spec-entry");

// TST-844201 · level: system · module: MOD-review-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; THE PERSON WHO PROMPTS IS A SOURCE
// given: a product on GitHub with the links file docs/sources.md; an instance alice/agent-m whose register docs/sources/ holds SRC-alice, of the account github.com/alice, and SRC-bob; the reviewer's token is stored
// input: open the SPEC-entry page of entry 07 of the product, then ask the route for the parameters of a message
// expect: no request names a file of the instance's register — no batch names one, and none is read on its own —; the parameters hold no `source` key, though the register holds the author's entry; known positive: the page is drawn, the product's files read in batches
test("TST-844201: drawing a product's entry page reads no file of the instance's register, and its subject gives no source", async () => {
  const product = fakeGitHub(productWithLinks(10)), instance = fakeGitHub(instanceFiles(), { repo: INSTANCE_REPO });
  await openPage(product, { id: ENTRY_ID }, { instance });

  assert.ok(product.requests.length > 0, "known positive: the page reads the product");
  assert.deepEqual(instance.graphqlRequests().flatMap((request) => request.body.query.match(/docs\/sources\/SRC-[a-z]+\.md/g) ?? []), []);
  assert.deepEqual(instance.contentPaths(), []);
  assert.equal(Object.hasOwn(route.subject({ id: ENTRY_ID }, lastContext()).paramsFor({}), "source"), false);
});

// TST-844202 · level: system · module: MOD-review-pages
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; THE PERSON WHO PROMPTS IS A SOURCE
// given: the same product and instance; no token is stored
// input: open the SPEC-entry page of entry 07 of the product, then ask the route for the parameters of a message
// expect: no request to /graphql and none that carries an Authorization header, on either repository; no file of the instance's register is read from the raw host; the parameters hold
//   no `source` key
test("TST-844202: without a token the page reads no file of the instance's register either", async () => {
  const product = fakeGitHub(productWithLinks(10)), instance = fakeGitHub(instanceFiles(), { repo: INSTANCE_REPO });
  await openPage(product, { id: ENTRY_ID }, { instance, token: null });

  assert.equal(instance.graphqlRequests().length, 0);
  assert.equal(product.graphqlRequests().length, 0);
  assert.deepEqual(instance.contentPaths(), []);
  assert.equal(instance.requests.filter((r) => r.url.origin === "https://raw.githubusercontent.com").length, 0);
  assert.equal([...instance.requests, ...product.requests].filter((r) => "authorization" in r.headers).length, 0);
  assert.equal(Object.hasOwn(route.subject({ id: ENTRY_ID }, lastContext()).paramsFor({}), "source"), false);
});
