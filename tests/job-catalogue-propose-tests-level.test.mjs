// A proposed test case may be of level user (ITM-1085) — MOD-job-catalogue's `propose-tests` kind: the schema of its answer lists the five levels of a test, as MOD-test-document gives them (docs/architecture/MOD-test-document.md:54:
// "one of `unit`, `component`, `system`, `release`, `user` (`EVERY TEST HAS ONE LEVEL`)"). The answer's schema and its envelope: docs/architecture/MOD-job-catalogue.md:73-76.
// Run: node --test tests/job-catalogue-propose-tests-level.test.mjs
//
// Module: MOD-job-catalogue
// Guards: EVERY TEST HAS ONE LEVEL; UC-026
// Level: unit
//
// The answer is read by MOD-job-runner's runJob, the reader of an answer; the job is prepared by hand with no checks, recipes or steps, so that only the reading of the answer decides; the driver is a fixture that answers once.
// Nothing reaches the network. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { kindOf } from "../src/job-catalogue/index.mjs";
import { runJob } from "../src/job-runner/index.mjs";

const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "example-model", context: 200000, price: null, capabilities: ["draft text"], place: "this machine", route: "endpoint" };
const CASE = { identifier: "TST-1", level: "unit", guards: ["UC-026"], precondition: "none", input: "x", expected: "y", class: "new" };

async function read(proposed) {
  const kind = await kindOf("propose-tests");
  const prepared = { blocking: [], notFitting: [], kind: { ...kind, checks: [], recipes: [], preconditions: [], steps: [] }, parts: [], limit: 1, drafter: DRAFTER };
  const driver = { participant: DRAFTER, async send() { return { text: JSON.stringify({ draft: { cases: proposed }, answers: [] }), usage: null }; } };
  return runJob(prepared, { drafter: driver, reviewers: [] }, { attended: true, context: { kind, params: {}, gates: [], person: "alice", jobId: null } });
}

// TST-1085101 · level: unit · module: MOD-job-catalogue
// guards: EVERY TEST HAS ONE LEVEL; UC-026
// given: the kind propose-tests of the catalogue, and answers of one case each, of the level unit, component, system and release
// input: each answer read by runJob
// expect: each is read (stoppedBecause "passed") and the draft holds the case with its level (the known positive beside the case of level user)
test("propose-tests — a case of level unit, component, system or release is read", async () => {
  for (const level of ["unit", "component", "system", "release"]) {
    const result = await read([{ ...CASE, level }]);
    assert.equal(result.stoppedBecause, "passed", level);
    assert.equal(result.draft.cases[0].level, level);
  }
});

// TST-1085102 · level: unit · module: MOD-job-catalogue
// guards: EVERY TEST HAS ONE LEVEL; UC-026
// given: an answer of one case of the level user
// input: the answer read by runJob
// expect: the schema's level enum holds the five levels of MOD-test-document in that order — unit, component, system, release, user —; the answer is read, stoppedBecause is "passed", and the draft holds the case of level user
test("propose-tests — a case of level user is read, and the enum holds the five levels", async () => {
  const levels = (await kindOf("propose-tests")).answer.properties.cases.items.properties.level;
  assert.deepEqual(levels.enum, ["unit", "component", "system", "release", "user"]);
  const result = await read([{ ...CASE, level: "user" }]);
  assert.equal(result.stoppedBecause, "passed");
  assert.equal(result.draft.cases[0].level, "user");
});

// TST-1085103 · level: unit · module: MOD-job-catalogue
// guards: EVERY TEST HAS ONE LEVEL; UC-026
// given: an answer of one case of the level "smoke", which is no level
// input: the answer read by runJob
// expect: it is refused: stoppedBecause is "unusable", no draft, and the finding of the first round names the level
test("propose-tests — a case of another word is refused", async () => {
  const result = await read([{ ...CASE, level: "smoke" }]);
  assert.equal(result.stoppedBecause, "unusable");
  assert.equal(result.draft, null);
  assert.match(result.rounds[0].findings[0].what, /level/);
});
