// A proposed test case names the paid service it really calls (ITM-890) — MOD-job-catalogue's `propose-tests` kind: the schema of
// its answer holds, beside `response`, the key `paid` — the key a test declaration uses for the same (MOD-test-document) —, and
// the kind's prompt asks for it in one sentence. The answer is read by MOD-job-runner's runJob, the reader of an answer.
// Run: node --test tests/job-catalogue-propose-tests.test.mjs
//
// Module: MOD-job-catalogue
// Guards: COMMIT TESTS CALL NO PAID SERVICE; UC-026
// Level: unit
//
// The job is prepared by hand with no checks, recipes or steps, so that only the reading of the answer decides; the driver is a
// fixture that answers once. Nothing reaches the network.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "endpoint" };
const CASE = { identifier: "TST-1", level: "unit", guards: ["UC-026"], precondition: "none", input: "x", expected: "y", class: "new" };

// The answer of the kind with `proposed` as its cases, read by runJob: its result.
async function read(proposed) {
  const kind = await kindOf("propose-tests");
  const prepared = { blocking: [], notFitting: [], kind: { ...kind, checks: [], recipes: [], preconditions: [], steps: [] },
    parts: [], limit: 1, drafter: DRAFTER };
  const driver = { participant: DRAFTER, async send() { return { text: JSON.stringify({ draft: { cases: proposed }, answers: [] }), usage: null }; } };
  const context = { kind, params: {}, gates: [], person: "alice", jobId: null };
  return runJob(prepared, { drafter: driver, reviewers: [] }, { attended: true, context });
}

// TST-890001 · level: unit · module: MOD-job-catalogue
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-026
// given: the kind propose-tests of the catalogue, and an answer of two cases, one with paid "openai" and one without paid
// input: the answer read by runJob
// expect: the case's schema holds paid as { type: "string" } and does not require it; the answer is read, stoppedBecause is "passed", and the draft's cases hold paid "openai" in the first and no paid in the second
test("propose-tests — a case with paid naming a service and a case without it are both read", async () => {
  const items = (await kindOf("propose-tests")).answer.properties.cases.items;
  assert.deepEqual(items.properties.paid, { type: "string" });
  assert.equal(items.required.includes("paid"), false);
  const result = await read([{ ...CASE, paid: "openai" }, CASE]);
  assert.equal(result.stoppedBecause, "passed");
  assert.equal(result.draft.cases[0].paid, "openai");
  assert.equal("paid" in result.draft.cases[1], false);
});

// TST-890002 · level: unit · module: MOD-job-catalogue
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-026
// given: the kind propose-tests of the catalogue, and an answer of one case with paid 5
// input: the answer read by runJob
// expect: the answer is unusable, and its one finding says "the answer cannot be read: draft.cases[0].paid is not a text"; the known positive is response 5, which says "draft.cases[0].response is not a text"
test("propose-tests — a paid that is not a text is refused", async () => {
  const positive = await read([{ ...CASE, response: 5 }]);
  assert.equal(positive.stoppedBecause, "unusable");
  assert.equal(positive.rounds[0].findings[0].what, "the answer cannot be read: draft.cases[0].response is not a text");
  const result = await read([{ ...CASE, paid: 5 }]);
  assert.equal(result.stoppedBecause, "unusable");
  assert.equal(result.rounds[0].findings[0].what, "the answer cannot be read: draft.cases[0].paid is not a text");
});

// TST-890003 · level: unit · module: MOD-job-catalogue
// guards: COMMIT TESTS CALL NO PAID SERVICE; UC-026
// given: the kind propose-tests of the catalogue
// input: kindOf("propose-tests"), its prompt
// expect: the prompt holds the sentence "A case that really calls a paid service names the service in `paid`; a case that does not leaves `paid` out."
test("propose-tests — the prompt asks for paid in one sentence", async () => {
  const { prompt } = await kindOf("propose-tests");
  assert.ok(prompt.includes("A case that really calls a paid service names the service in `paid`; a case that does not leaves `paid` out."));
});
