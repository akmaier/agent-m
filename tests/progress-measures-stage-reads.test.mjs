// What stageShares reads, at this repository's size — MOD-progress-measures' stageShares reads the branch test-results through
// MOD-result-records' resultsAt for the tests stage, and nothing else: it reads no file of the product's snapshot, sends no request,
// and asks for the records of one commit — the commit of the default branch the facts were read at —, however many requirements
// and tests the product holds and however many commits the branch test-results holds records of. The size is this repository's
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
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; UC-046
// given: this repository's size — 412 requirements, 2499 tests each guarding one of them, the branch test-results holding 86 records of 85 commits, two of them of the default branch's commit
// input: stageShares(facts), counting the reads of the branch test-results and of the product's snapshot
// expect: the tests stage is 1 (every requirement is guarded by a passing test); the branch test-results is asked to read exactly the two records of the default branch's commit, once each — none of the other 84; the product's snapshot is not read
test("stageShares — at this repository's size it reads the two records of the default branch's commit and no other file", async () => {
  const r = repository();
  const tests = (await stageShares(r.facts)).find((s) => s.stage === "Tests");
  assert.equal(tests.share, 1);
  assert.deepEqual(r.results.reads.sort(), [`runs/${COMMIT}/20261016-1000-commit-aaaa.md`, `runs/${COMMIT}/20261016-1010-pull-request-bbbb.md`]);
  assert.deepEqual(r.productReads, []);
});

// TST-685016 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; UC-046
// given: this repository's size, with the branch test-results present, but (a) a trace graph in which no test guards any requirement; (b) the trace graph not read; (c) the requirements not read; (d) the test declarations not read; (e) no declaration of the tests that guard; (f) a repository with no commit yet (the snapshot's commit null)
// input: stageShares of each, counting the reads of the branch test-results
// expect: no read of any record in any of them — the records are read only where a requirement is guarded by a declared test and the facts hold the commit
test("stageShares — it reads no record where the facts already say what the records would add", async () => {
  const noCommit = { commit: null, paths: [], blob: () => null, read: async () => null };
  const cases = { unguarded: { graph: graphOf(names, []) }, graph: { graph: "unknown" }, requirements: { requirements: "unknown" },
    declarations: { tests: "unknown" }, undeclared: { tests: [] }, commitless: { snapshot: noCommit } };
  for (const [name, over] of Object.entries(cases)) {
    const r = repository();
    await stageShares({ ...r.facts, ...over });
    assert.deepEqual(r.results.reads, [], name);
  }
});

// TST-685017 · level: unit · module: MOD-progress-measures
// guards: THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE; UC-046
// given: the same facts but with three requirements and the tests that guard them (a small product), and this repository's branch test-results
// input: stageShares(facts), counting the reads of the branch test-results
// expect: the same two reads as at this repository's size — the reads do not grow with the number of requirements or tests
test("stageShares — the number of reads does not grow with the number of requirements or tests", async () => {
  const small = ["REQUIREMENT 0", "REQUIREMENT 1", "REQUIREMENT 2"];
  const guards = ids.slice(0, 6).map((id, i) => [id, small[i % 3]]);
  const r = repository();
  const f = { ...r.facts, requirements: small, graph: graphOf(small, guards), tests: guards.map(([id]) => ({ id, level: "unit", module: "MOD-x", guards: [] })) };
  const tests = (await stageShares(f)).find((s) => s.stage === "Tests");
  assert.equal(tests.share, 1);
  assert.equal(r.results.reads.length, 2);
});
