// The outcomes of a commit — MOD-result-records' Outcome, resultSchema, resultsAt, flakyTests and rateComparison, as
// the accepted text of docs/architecture/MOD-result-records.md states them: what the records of the branch
// test-results say about one commit — its outcomes per level, a level without a record of the commit not run, never
// passed, and a record marked uncommitted left out —, the deterministic tests that both passed and failed on it, and
// each model-dependent test's rate beside the last release's. Reading a JUnit report (parseOutcomes), appending a
// record (appendResult), a test's history (testHistory) and the job kinds' strategies (resultStrategies) are UC-026's
// and UC-028's and not part of this item (ITM-251, Outcome). Nothing else of the module is part of this item.
// Run: node --test tests/result-records-outcomes.test.mjs
//
// Module: MOD-result-records
// Guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// Level: unit
//
// resultsAt, flakyTests and rateComparison read the branch test-results through the Snapshot they are given
// (MOD-repository-hosts): results.paths to find a commit's run records, results.read(path) for each one's text.
// read(path) -> Promise<string | null>, always (src/repository-hosts/index.mjs: a path the commit does not hold
// answers Promise.resolve(null); a path it does answers a cached or pending fetch — never a plain value), so
// fulfilling what this module's Data table asks of these three — reading each run record's front matter and its
// ## Outcomes table — needs that read, and all three are async here, as MOD-spec-changes' queues(snapshot) already is
// for the same reason (tests/spec-changes-queues.test.mjs, src/spec-changes/queues.mjs) — and as MOD-approvals'
// statuses(snapshot) (src/approvals/status.mjs) correctly is NOT, since it alone derives its answer from paths and
// blob SHAs, without reading a single file. docs/architecture/MOD-result-records.md (Interfaces: resultsAt,
// flakyTests, rateComparison) types them without Promise<>, and names no crossing of the network — the same gap
// already resolved the same way for MOD-job-ledger's listJobs (typed JobRow[] there): docs/backlog/sprints/12.md,
// "notes of earlier gates" — "listJobs is async (#183, #191) ... ITM-254 awaits it, names the point in its pull
// request, and no item needs the file changed now." Named here in the pull request for the same reason; no item
// needs MOD-result-records.md's or its callers' (MOD-release-evidence.md, MOD-work-plans.md) signatures changed now.
//
// Each test states its input and its expected result before it runs (given / input / expect). The fixture snapshot
// below is a plain object of Snapshot's shape (MOD-repository-hosts) — no readSnapshot, no fetch. Nothing sleeps or
// waits. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { resultsAt, flakyTests, rateComparison } from "../src/result-records/index.mjs";

// A fixture snapshot (MOD-repository-hosts' Snapshot): paths and a read() of the given run records' texts; blob is
// unused by these three functions and stubbed to null.
function fixtureSnapshot(texts) {
  return {
    paths: Object.keys(texts),
    blob: () => null,
    read: async (path) => (Object.hasOwn(texts, path) ? texts[path] : null),
  };
}

const COMMIT = "1".repeat(40);
const RELEASE_COMMIT = "3".repeat(40);

// One run record's text, in result-record.schema.md's form: front matter, then its ## Outcomes table of the given
// rows ([Test, Level, Outcome, Runs]) — and nothing else.
function record({ commit = COMMIT, levels = ["unit"], occasion = "commit", uncommitted = false, rows }) {
  const front = [
    "---",
    `commit: ${commit}`,
    "levels:",
    ...levels.map((l) => `  - ${l}`),
    `occasion: ${occasion}`,
    "participant: ci",
    "date: 2026-10-07 10:00 UTC",
    ...(uncommitted ? ["uncommitted: true"] : []),
    "---",
  ].join("\n");
  const table = ["| Test | Level | Outcome | Runs |", "|---|---|---|---|", ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
  return `${front}\n## Outcomes\n\n${table}\n`;
}

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: one run record of COMMIT at level unit (TST-001 passed, TST-002 failed) and a second, on another occasion,
//        where TST-003 failed after it passed in the first — a flaky test, not a passed one; tests of levels unit
//        (TST-001, TST-002, TST-003) and component (TST-004, no record of this commit at all)
// input: resultsAt(fixture, COMMIT, tests)
// expect: level unit — passed 1, failed 1, flaky 1, notRun 0, TST-001 passed, TST-002 failed, TST-003 flaky with
//         both its records; level component — passed 0, failed 0, flaky 0, notRun 1, TST-004 not run
test("resultsAt — a commit's outcomes per level, with their counts", async () => {
  const path1 = `runs/${COMMIT}/20261007-1000-commit-aaaa.md`;
  const path2 = `runs/${COMMIT}/20261007-1030-pull-request-bbbb.md`;
  const snapshot = fixtureSnapshot({
    [path1]: record({
      rows: [["TST-001", "unit", "passed", ""], ["TST-002", "unit", "failed", ""], ["TST-003", "unit", "passed", ""]],
    }),
    [path2]: record({ occasion: "pull-request", rows: [["TST-003", "unit", "failed", ""]] }),
  });
  const tests = [
    { id: "TST-001", level: "unit" }, { id: "TST-002", level: "unit" }, { id: "TST-003", level: "unit" },
    { id: "TST-004", level: "component" },
  ];
  const result = await resultsAt(snapshot, COMMIT, tests);
  const unit = result.find((l) => l.level === "unit");
  const component = result.find((l) => l.level === "component");
  assert.deepEqual([unit.passed, unit.failed, unit.flaky, unit.notRun], [1, 1, 1, 0]);
  assert.equal(unit.tests.find((t) => t.id === "TST-001").outcome, "passed");
  assert.equal(unit.tests.find((t) => t.id === "TST-002").outcome, "failed");
  const flakyOne = unit.tests.find((t) => t.id === "TST-003");
  assert.equal(flakyOne.outcome, "flaky");
  assert.deepEqual(flakyOne.records.slice().sort(), [path1, path2].sort());
  assert.deepEqual([component.passed, component.failed, component.flaky, component.notRun], [0, 0, 0, 1]);
  assert.equal(component.tests.find((t) => t.id === "TST-004").outcome, "not run");
});

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: a run record of COMMIT at level unit only, naming TST-001; tests also name TST-005 at level system, which no
//        record of this commit mentions at any level
// input: resultsAt(fixture, COMMIT, tests)
// expect: level system — notRun 1, passed 0, failed 0; TST-005 not run, never passed
test("resultsAt — a level without a record of the commit reads not run, never passed", async () => {
  const snapshot = fixtureSnapshot({
    [`runs/${COMMIT}/20261007-1000-commit-aaaa.md`]: record({ rows: [["TST-001", "unit", "passed", ""]] }),
  });
  const tests = [{ id: "TST-001", level: "unit" }, { id: "TST-005", level: "system" }];
  const result = await resultsAt(snapshot, COMMIT, tests);
  const system = result.find((l) => l.level === "system");
  assert.deepEqual([system.passed, system.failed, system.notRun], [0, 0, 1]);
  assert.equal(system.tests.find((t) => t.id === "TST-005").outcome, "not run");
});

// guards: A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: two records of COMMIT at level unit, both naming TST-001 — one passed, marked uncommitted; one failed, not
//        marked
// input: resultsAt(fixture, COMMIT, [{id: "TST-001", level: "unit"}])
// expect: TST-001 failed (the uncommitted record's passed outcome is left out, not counted, not averaged in)
test("resultsAt — a record marked uncommitted is left out", async () => {
  const snapshot = fixtureSnapshot({
    [`runs/${COMMIT}/20261007-0900-on-demand-cccc.md`]: record({ uncommitted: true, rows: [["TST-001", "unit", "passed", ""]] }),
    [`runs/${COMMIT}/20261007-1000-commit-dddd.md`]: record({ rows: [["TST-001", "unit", "failed", ""]] }),
  });
  const result = await resultsAt(snapshot, COMMIT, [{ id: "TST-001", level: "unit" }]);
  const unit = result.find((l) => l.level === "unit");
  assert.equal(unit.tests.find((t) => t.id === "TST-001").outcome, "failed");
  assert.deepEqual([unit.passed, unit.failed, unit.flaky], [0, 1, 0]);
});

// guards: A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
// given: two records of COMMIT — TST-001 (deterministic) passed in one, failed in the other; TST-010 (model-
//        dependent, a Runs cell in both) at two different rates in the two records
// input: flakyTests(fixture, COMMIT)
// expect: exactly TST-001, with both records named in passedIn and failedIn; TST-010 not reported — a model-
//         dependent test's rate moves by design, which is not the flakiness this requirement names
test("flakyTests — a deterministic test with both outcomes on one commit, with both records; a model-dependent test is not reported", async () => {
  const path1 = `runs/${COMMIT}/20261007-1000-commit-aaaa.md`;
  const path2 = `runs/${COMMIT}/20261007-1030-pull-request-bbbb.md`;
  const snapshot = fixtureSnapshot({
    [path1]: record({ rows: [["TST-001", "unit", "passed", ""], ["TST-010", "unit", "passed", "7 of 10"]] }),
    [path2]: record({ occasion: "pull-request", rows: [["TST-001", "unit", "failed", ""], ["TST-010", "unit", "failed", "4 of 10"]] }),
  });
  const result = await flakyTests(snapshot, COMMIT);
  assert.equal(result.length, 1, "only the deterministic test is reported");
  const [flaky] = result;
  assert.equal(flaky.test, "TST-001");
  assert.deepEqual(flaky.passedIn, [path1]);
  assert.deepEqual(flaky.failedIn, [path2]);
});

// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: TST-010 recorded 6 of 10 at COMMIT and 8 of 10 at RELEASE_COMMIT; TST-011 recorded 9 of 10 at COMMIT and
//        7 of 10 at RELEASE_COMMIT
// input: rateComparison(fixture, COMMIT, RELEASE_COMMIT)
// expect: TST-010 now "6 of 10", then "8 of 10", worse true (lower); TST-011 now "9 of 10", then "7 of 10", worse
//         false (not lower)
test("rateComparison — a rate lower than the last release's is marked worse, one at or above is not", async () => {
  const snapshot = fixtureSnapshot({
    [`runs/${COMMIT}/20261007-1000-commit-aaaa.md`]: record({
      rows: [["TST-010", "unit", "failed", "6 of 10"], ["TST-011", "unit", "passed", "9 of 10"]],
    }),
    [`runs/${RELEASE_COMMIT}/20260901-1000-release-candidate-eeee.md`]: record({
      commit: RELEASE_COMMIT,
      occasion: "release-candidate",
      rows: [["TST-010", "unit", "passed", "8 of 10"], ["TST-011", "unit", "passed", "7 of 10"]],
    }),
  });
  const result = await rateComparison(snapshot, COMMIT, RELEASE_COMMIT);
  const ten = result.find((r) => r.test === "TST-010");
  const eleven = result.find((r) => r.test === "TST-011");
  assert.deepEqual([ten.now, ten.then, ten.worse], ["6 of 10", "8 of 10", true]);
  assert.deepEqual([eleven.now, eleven.then, eleven.worse], ["9 of 10", "7 of 10", false]);
});

// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: TST-010 recorded 6 of 10 at COMMIT; no last release
// input: rateComparison(fixture, COMMIT, null)
// expect: no comparison — an empty array
test("rateComparison — no comparison without a last release", async () => {
  const snapshot = fixtureSnapshot({
    [`runs/${COMMIT}/20261007-1000-commit-aaaa.md`]: record({ rows: [["TST-010", "unit", "failed", "6 of 10"]] }),
  });
  const result = await rateComparison(snapshot, COMMIT, null);
  assert.deepEqual(result, []);
});
