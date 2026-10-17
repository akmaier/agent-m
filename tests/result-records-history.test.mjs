// A test's history — MOD-result-records' testHistory, as the accepted text of docs/architecture/MOD-result-records.md
// states it: one mark per commit on which the test ran, a flaky commit marked as such, one row per release tag with its
// outcome (not run where the tag's commit holds no record of the test), a model-dependent test's rate with its runs on
// its release row, and a record marked uncommitted left out (ITM-751; UC-029 step 5).
// Run: node --test tests/result-records-history.test.mjs
//
// Module: MOD-result-records
// Guards: A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; EVERY TEST RUN LEAVES A RESULT RECORD
// Level: unit
//
// testHistory is async here, as resultsAt, flakyTests and rateComparison are (read(path) is a Promise); the module
// file types it without Promise<> — a gap named in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { testHistory } from "../src/result-records/index.mjs";

function fixtureSnapshot(texts) {
  return {
    paths: Object.keys(texts),
    blob: () => null,
    read: async (path) => (Object.hasOwn(texts, path) ? texts[path] : null),
  };
}

const C1 = "1".repeat(40);
const C2 = "2".repeat(40);
const C3 = "3".repeat(40);
const C4 = "4".repeat(40);

function record({ commit, occasion = "commit", uncommitted = false, rows }) {
  const front = [
    "---", `commit: ${commit}`, "levels:", "  - unit", `occasion: ${occasion}`, "participant: ci",
    "date: 2026-10-07 10:00 UTC", ...(uncommitted ? ["uncommitted: true"] : []), "---",
  ].join("\n");
  const table = ["| Test | Level | Outcome | Runs |", "|---|---|---|---|", ...rows.map((r) => `| ${r.join(" | ")} |`)].join("\n");
  return `${front}\n## Outcomes\n\n${table}\n`;
}

const at = (commit, name) => `runs/${commit}/${name}.md`;

// TST-751001 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: TST-001 recorded on three commits C1 (passed), C2 (failed), C3 (passed); TST-002 recorded on C1 only
// input: testHistory(fixture, "TST-001", [])
// expect: three marks, one per commit C1, C2, C3, with outcomes passed, failed, passed; no mark for TST-002's records
test("testHistory — one mark per commit on which the test ran", async () => {
  const snapshot = fixtureSnapshot({
    [at(C1, "20261001-1000-commit-aaaa")]: record({ commit: C1, rows: [["TST-001", "unit", "passed", ""], ["TST-002", "unit", "passed", ""]] }),
    [at(C2, "20261002-1000-commit-bbbb")]: record({ commit: C2, rows: [["TST-001", "unit", "failed", ""]] }),
    [at(C3, "20261003-1000-commit-cccc")]: record({ commit: C3, rows: [["TST-001", "unit", "passed", ""]] }),
  });
  const { commits } = await testHistory(snapshot, "TST-001", []);
  assert.deepEqual(commits.map((m) => [m.commit, m.outcome]), [[C1, "passed"], [C2, "failed"], [C3, "passed"]]);
});

// TST-751002 · level: unit · module: MOD-result-records
// guards: A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
// given: two records of C1, TST-001 passed in one and failed in the other; one record of C2, TST-001 passed
// input: testHistory(fixture, "TST-001", [])
// expect: C1's mark outcome is flaky; C2's is passed
test("testHistory — a commit with a passing and a failing record is marked flaky", async () => {
  const snapshot = fixtureSnapshot({
    [at(C1, "20261001-1000-commit-aaaa")]: record({ commit: C1, rows: [["TST-001", "unit", "passed", ""]] }),
    [at(C1, "20261001-1030-pull-request-bbbb")]: record({ commit: C1, occasion: "pull-request", rows: [["TST-001", "unit", "failed", ""]] }),
    [at(C2, "20261002-1000-commit-cccc")]: record({ commit: C2, rows: [["TST-001", "unit", "passed", ""]] }),
  });
  const { commits } = await testHistory(snapshot, "TST-001", []);
  assert.equal(commits.find((m) => m.commit === C1).outcome, "flaky");
  assert.equal(commits.find((m) => m.commit === C2).outcome, "passed");
});

// TST-751003 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: release tags v1 at C1 (TST-001 passed there), v2 at C4 (no record of TST-001 on C4 at all)
// input: testHistory(fixture, "TST-001", [{tag: "v1", commit: C1}, {tag: "v2", commit: C4}])
// expect: two rows in the tags' order: v1 passed with runs null; v2 not run with runs null
test("testHistory — one row per release tag, a tag with no record of the test reads not run", async () => {
  const snapshot = fixtureSnapshot({
    [at(C1, "20261001-1000-commit-aaaa")]: record({ commit: C1, rows: [["TST-001", "unit", "passed", ""]] }),
    [at(C4, "20261004-1000-commit-dddd")]: record({ commit: C4, rows: [["TST-009", "unit", "passed", ""]] }),
  });
  const { releases } = await testHistory(snapshot, "TST-001", [{ tag: "v1", commit: C1 }, { tag: "v2", commit: C4 }]);
  assert.deepEqual(releases, [
    { tag: "v1", outcome: "passed", runs: null },
    { tag: "v2", outcome: "not run", runs: null },
  ]);
});

// TST-751004 · level: unit · module: MOD-result-records
// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: TST-010, model-dependent, recorded 17 of 20 (passed) on C1, the commit of release tag v1
// input: testHistory(fixture, "TST-010", [{tag: "v1", commit: C1}])
// expect: v1's row has runs "17 of 20" and outcome passed
test("testHistory — a model-dependent test's release row carries its rate with its runs", async () => {
  const snapshot = fixtureSnapshot({
    [at(C1, "20261001-1000-release-candidate-aaaa")]: record({ commit: C1, occasion: "release-candidate", rows: [["TST-010", "unit", "passed", "17 of 20"]] }),
  });
  const { releases } = await testHistory(snapshot, "TST-010", [{ tag: "v1", commit: C1 }]);
  assert.deepEqual(releases, [{ tag: "v1", outcome: "passed", runs: "17 of 20" }]);
});

// TST-751005 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: TST-001 passed on C1 in a record marked uncommitted, and failed on C2 in a committed one; release tag v1 at C1
// input: testHistory(fixture, "TST-001", [{tag: "v1", commit: C1}])
// expect: one mark only, for C2 (failed); v1 reads not run, the uncommitted record counting for neither
test("testHistory — a record marked uncommitted is left out", async () => {
  const snapshot = fixtureSnapshot({
    [at(C1, "20261001-0900-on-demand-aaaa")]: record({ commit: C1, occasion: "on-demand", uncommitted: true, rows: [["TST-001", "unit", "passed", ""]] }),
    [at(C2, "20261002-1000-commit-bbbb")]: record({ commit: C2, rows: [["TST-001", "unit", "failed", ""]] }),
  });
  const { commits, releases } = await testHistory(snapshot, "TST-001", [{ tag: "v1", commit: C1 }]);
  assert.deepEqual(commits.map((m) => [m.commit, m.outcome]), [[C2, "failed"]]);
  assert.deepEqual(releases, [{ tag: "v1", outcome: "not run", runs: null }]);
});
