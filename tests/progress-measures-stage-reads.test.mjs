// What stageShares reads, at this repository's size — MOD-progress-measures' stageShares tells the six stages from the facts it is
// given: it reads no record of the branch test-results and no file of the product's snapshot, and sends no request, however many
// requirements and tests the product holds and however many commits the branch test-results holds records of. The size is this repository's
// (the sizes are stated below, as counted on the base of sprint 74): 412 requirements in SPEC.md, 2499 distinct test identifiers
// declared in tests/, and the 85 commits whose records stand on the branch test-results.
// Run: node --test tests/progress-measures-stage-reads.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-046; THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The facts are held in memory
// (tests/progress-measures-facts.mjs): the branch test-results is a Snapshot that records every path it is asked to read, and the
// product's snapshot likewise. `fetch` is replaced by a spy for every test and must not have been called when the test ends. The
// counter-proofs are recorded in the pull request.

import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { stageShares } from "../src/progress-measures/index.mjs";
import { COMMIT, facts, graphOf, resultsSnapshot, runRecord } from "./progress-measures-facts.mjs";

let fetched = [];
const realFetch = globalThis.fetch;
beforeEach(() => {
  fetched = [];
  globalThis.fetch = async (input) => { fetched.push(String(input?.url ?? input)); throw new Error("a test reached the network"); };
});
afterEach(() => {
  globalThis.fetch = realFetch;
  assert.deepEqual(fetched, [], "no request reaches the network");
});

const REQUIREMENTS = 412, TESTS = 2499, COMMITS = 85;
const names = Array.from({ length: REQUIREMENTS }, (_, i) => `REQUIREMENT ${i}`);
const ids = Array.from({ length: TESTS }, (_, i) => `TST-${100000 + i}`);

// This repository: every test guards one requirement (test i guards requirement i mod 412); the branch test-results holds one
// record of each of 84 other commits and two records of the commit of the default branch, in which every test passed.
function repository(over = {}) {
  const texts = {};
  for (let c = 0; c < COMMITS - 1; c += 1) {
    const commit = c.toString(16).padStart(40, "0");
    texts[`runs/${commit}/20261010-1000-pull-request-aaaa.md`] = runRecord(commit, [[ids[c], "unit", "passed"]]);
  }
  const rows = ids.map((id) => [id, "unit", "passed"]);
  texts[`runs/${COMMIT}/20261016-1000-commit-aaaa.md`] = runRecord(COMMIT, rows.slice(0, 1200));
  texts[`runs/${COMMIT}/20261016-1010-pull-request-bbbb.md`] = runRecord(COMMIT, rows.slice(1200));
  const results = resultsSnapshot(texts);
  const productReads = [];
  const snapshot = { commit: COMMIT, paths: [], blob: () => null, read: async (path) => { productReads.push(path); return null; } };
  return {
    results, productReads,
    facts: facts({ requirements: names, graph: graphOf(names, ids.map((id, i) => [id, names[i % REQUIREMENTS]])),
      tests: ids.map((id) => ({ id, level: "unit", module: "MOD-x", guards: [] })), results, snapshot, ...over }),
  };
}

// TST-685015 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT’S PROGRESS BY STAGE; UC-046
// given: this repository’s size — 412 requirements, 2499 tests each guarding one of them, the branch test-results holding 86 records of 85 commits, two of them of the commit of the facts
// input: stageShares(facts), counting the reads of the branch test-results and of the product’s snapshot
// expect: no read of either — the stages are told from the facts as they are held; the tests stage has no share
test("stageShares — at this repository’s size it reads no record and no file", async () => {
  const r = repository();
  const tests = (await stageShares(r.facts)).find((s) => s.stage === "Tests");
  assert.equal(tests.share, null);
  assert.deepEqual(r.results.reads, []);
  assert.deepEqual(r.productReads, []);
});
