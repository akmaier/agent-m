// A run-tests answer names each outcome's level (ITM-1080) — MOD-job-catalogue's `run-tests` kind: the schema of its answer requires `level` of each outcome and allows the five levels, because the record the writer
// `result-record` appends has the column `Level` (docs/architecture/MOD-result-records.md:83-84: "a table with the columns `Test`, `Level`, `Outcome`, `Runs`") and the writer refuses an outcome without one (OutcomeWithoutLevel).
// The five levels are MOD-test-document's (docs/architecture/MOD-test-document.md:54: "one of `unit`, `component`, `system`, `release`, `user`"). The answer's schema and its envelope: docs/architecture/MOD-job-catalogue.md:73-76.
// Run: node --test tests/job-catalogue-run-tests-level.test.mjs
//
// Module: MOD-job-catalogue
// Guards: EVERY TEST HAS ONE LEVEL; EVERY TEST RUN LEAVES A RESULT RECORD; UC-013; UC-028
// Level: unit
//
// The answer is read by MOD-job-runner's runJob, the reader of an answer; the job is prepared by hand with no checks, recipes or steps, so that only the reading of the answer decides; the driver is a fixture that
// answers once. Reading taken: "allows the levels" is the enum of the five levels on `level` (sprint 97's text: the answer schemas "require and allow the levels the record and MOD-test-document state"). Nothing reaches the network.
// The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

const DRAFTER = { name: "runner-a", type: "model endpoint", model: "example-model", context: 200000, price: null, capabilities: ["draft text"], place: "this machine", route: "endpoint" };

// The answer of the kind with `outcomes`, read by runJob: its result.
async function read(outcomes) {
  const kind = await kindOf("run-tests");
  const prepared = { blocking: [], notFitting: [], kind: { ...kind, checks: [], recipes: [], preconditions: [], steps: [] }, parts: [], limit: 1, drafter: DRAFTER };
  const driver = { participant: DRAFTER, async send() { return { text: JSON.stringify({ draft: { outcomes }, answers: [] }), usage: null }; } };
  return runJob(prepared, { drafter: driver, reviewers: [] }, { attended: true, context: { kind, params: {}, gates: [], person: "alice", jobId: null } });
}

// TST-1080101 · level: unit · module: MOD-job-catalogue
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-013
// given: the kind run-tests of the catalogue, and an answer of two outcomes that each name a level (unit, release)
// input: the answer read by runJob
// expect: it is read, stoppedBecause is "passed", and the draft holds both outcomes with their levels (the known positive beside the refusals below)
test("run-tests — an answer whose outcomes name their levels is read", async () => {
  const result = await read([{ test: "TST-101", level: "unit", outcome: "passed" }, { test: "TST-102", level: "release", outcome: "not run" }]);
  assert.equal(result.stoppedBecause, "passed");
  assert.deepEqual(result.draft.outcomes.map((one) => [one.test, one.level]), [["TST-101", "unit"], ["TST-102", "release"]]);
});

// TST-1080102 · level: unit · module: MOD-job-catalogue
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-013
// given: an answer of two outcomes, the second without a level
// input: the answer read by runJob
// expect: the schema requires level for each outcome (items.required holds test, level and outcome); the answer is refused: stoppedBecause is "unusable", no draft, and the finding of the first round names the field level
test("run-tests — an outcome without a level is refused by the schema, with the field named", async () => {
  const items = (await kindOf("run-tests")).answer.properties.outcomes.items;
  assert.deepEqual([...items.required].sort(), ["level", "outcome", "test"]);
  const result = await read([{ test: "TST-101", level: "unit", outcome: "passed" }, { test: "TST-102", outcome: "failed" }]);
  assert.equal(result.stoppedBecause, "unusable");
  assert.equal(result.draft, null);
  assert.match(result.rounds[0].findings[0].what, /outcomes\[1\] has no level/);
});

// TST-1080103 · level: unit · module: MOD-job-catalogue
// guards: EVERY TEST HAS ONE LEVEL; UC-013
// given: answers of one outcome each, with the level unit, component, system, release and user; and one with the level "smoke"
// input: each answer read by runJob
// expect: the five are read (passed); the one with "smoke" is refused (unusable) with a finding that names the level
test("run-tests — the five levels are allowed and another word is refused", async () => {
  for (const level of ["unit", "component", "system", "release", "user"]) {
    assert.equal((await read([{ test: "TST-101", level, outcome: "passed" }])).stoppedBecause, "passed", level);
  }
  const result = await read([{ test: "TST-101", level: "smoke", outcome: "passed" }]);
  assert.equal(result.stoppedBecause, "unusable");
  assert.match(result.rounds[0].findings[0].what, /level/);
});
