// A run's outcomes read from the reports of all its jobs, with a reason for a test not run — MOD-result-records'
// parseOutcomes(reports, declarations), Outcome.reason and the record's optional column Reason, as the accepted text of
// docs/architecture/MOD-result-records.md states them (ITM-1212): the JUnit XML reports of a run's jobs are read together
// as one — several cases of a deterministic test, in one report or several, pass only if all pass; a declared test
// without a case in any report is not run —; UnreadableReport { index, reason } names the place of a report that is not
// one, a report cut off counting as one; parseOutcomes gives reason null; a record with the column Reason is valid and
// read back with it, and a record of the four columns before it is valid and read by every reader with no reason.
// Run: node --test tests/result-records-reports.test.mjs
//
// Module: MOD-result-records
// Guards: EVERY TEST RUN LEAVES A RESULT RECORD; A RESULT RECORD IS NEVER REWRITTEN; UC-027; UC-028
// Level: unit
//
// The fixture reports are written as node's JUnit reporter writes them; the declarations are plain objects of
// TestDeclaration's shape; the branch test-results is a plain object of Snapshot's shape (MOD-repository-hosts) — paths
// and a read() of the given records. Nothing reads a file, waits or reaches the network. The counter-proofs are recorded
// in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { documentFindings, readDocument, writeDocument } from "../src/documents/index.mjs";
import { flakyTests, parseOutcomes, rateComparison, resultSchema, resultsAt, testHistory } from "../src/result-records/index.mjs";

const declaration = (id, level, extra = {}) => ({
  id, level, module: "MOD-result-records", guards: ["EVERY TEST RUN LEAVES A RESULT RECORD"], given: "g", input: "i",
  expect: `${id} expects x`, runs: null, phrasings: null, paid: null, path: "tests/x.test.mjs", line: 1, ...extra,
});

// A report as node's JUnit reporter writes it, of the given cases: [name, "ok" | "fail" | "skip"].
const report = (cases) => `<?xml version="1.0" encoding="utf-8"?>
<testsuites>
${cases.map(([name, kind]) => (kind === "fail"
    ? `\t<testcase name="${name}" classname="test"><failure type="testCodeFailure" message="boom">boom</failure></testcase>`
    : kind === "skip" ? `\t<testcase name="${name}" classname="test"><skipped type="skipped" message="why"/></testcase>`
      : `\t<testcase name="${name}" classname="test"/>`)).join("\n")}
</testsuites>
`;

const DECLARATIONS = [declaration("TST-121201", "unit"), declaration("TST-121202", "unit"), declaration("TST-121203", "component")];
const simple = (o) => ({ test: o.test, outcome: o.outcome });

// TST-121201 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: two reports of one run's two jobs — the first with a passing case of TST-121201, the second with a passing case of TST-121202 and a failing case of TST-121203 — and the declarations of the three
// input: parseOutcomes([first, second], declarations)
// expect: the three outcomes as one run, in the order the tests first appear across the reports — TST-121201 passed, TST-121202 passed, TST-121203 failed —, each with its declared level and with reason null
test("parseOutcomes — the reports of two jobs are read as one run", () => {
  const outcomes = parseOutcomes([report([["TST-121201 a", "ok"]]), report([["TST-121202 b", "ok"], ["TST-121203 c", "fail"]])], DECLARATIONS);
  assert.deepEqual(outcomes.map(simple), [
    { test: "TST-121201", outcome: "passed" }, { test: "TST-121202", outcome: "passed" }, { test: "TST-121203", outcome: "failed" },
  ]);
  assert.deepEqual(outcomes.map((o) => [o.level, o.reason]), [["unit", null], ["unit", null], ["component", null]]);
});

// TST-121202 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: two reports, each with a case of the deterministic TST-121201 — failing in the first, passing in the second —, and the second with a passing case of TST-121202
// input: parseOutcomes([first, second], declarations of TST-121201 and TST-121202)
// expect: one outcome for TST-121201, failed, with its failure's observed result "boom"; TST-121202 passed; no other outcome
test("parseOutcomes — a test failing in one report and passing in the other is failed", () => {
  const outcomes = parseOutcomes([report([["TST-121201 a", "fail"]]), report([["TST-121201 a", "ok"], ["TST-121202 b", "ok"]])], DECLARATIONS.slice(0, 2));
  assert.deepEqual(outcomes.map(simple), [{ test: "TST-121201", outcome: "failed" }, { test: "TST-121202", outcome: "passed" }]);
  assert.equal(outcomes[0].failure.observed, "boom");
});

// TST-121203 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: two reports, the first with a case of TST-121201, the second with a case of TST-121202, and the declarations of TST-121201, TST-121202 and TST-121203 — the last in no report
// input: parseOutcomes([first, second], declarations)
// expect: TST-121203 not run, after the tests with a case, with its level component, failure null and reason null; TST-121201 and TST-121202 passed
test("parseOutcomes — a declared test in no report of the run is not run", () => {
  const outcomes = parseOutcomes([report([["TST-121201 a", "ok"]]), report([["TST-121202 b", "ok"]])], DECLARATIONS);
  assert.deepEqual(outcomes.map(simple), [
    { test: "TST-121201", outcome: "passed" }, { test: "TST-121202", outcome: "passed" }, { test: "TST-121203", outcome: "not run" },
  ]);
  assert.deepEqual([outcomes[2].level, outcomes[2].failure, outcomes[2].reason], ["component", null, null]);
});

// TST-121204 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: a readable first report, and a second report cut off in the middle of a test case — as a job stopped at its time limit leaves it
// input: parseOutcomes([first, cut off], declarations); then parseOutcomes([cut off, first], declarations)
// expect: each throws an error named UnreadableReport with a non-empty reason, its index 1 for the first call and 0 for the second
test("parseOutcomes — a cut-off second report gives UnreadableReport with index 1", () => {
  const first = report([["TST-121201 a", "ok"]]);
  const cut = report([["TST-121202 b", "ok"], ["TST-121203 c", "fail"]]).slice(0, 120);
  const unreadableAt = (index) => (error) => error.name === "UnreadableReport" && error.index === index && typeof error.reason === "string" && error.reason.length > 0;
  assert.throws(() => parseOutcomes([first, cut], DECLARATIONS), unreadableAt(1));
  assert.throws(() => parseOutcomes([cut, first], DECLARATIONS), unreadableAt(0));
});

// Records of the branch test-results.
const COMMIT = "c".repeat(40);
const RELEASE = "d".repeat(40);
const head = (commit, minute) => ["---", `commit: ${commit}`, "levels:", "  - unit", "occasion: pull-request", "participant: GitHub Actions",
  `date: 2026-10-26 10:${minute} UTC`, "---", "## Outcomes", ""].join("\n");
const WITH_REASON = `${head(COMMIT, "00")}\n| Test | Level | Outcome | Runs | Reason |\n|---|---|---|---|---|\n| TST-121201 | unit | passed |  |  |\n| TST-121202 | unit | not run |  | secret missing: OPENAI_API_KEY |\n`;
const FOUR_COLUMNS = `${head(COMMIT, "05")}\n| Test | Level | Outcome | Runs |\n|---|---|---|---|\n| TST-121201 | unit | failed |  |\n| TST-121203 | unit | passed |  |\n`;
const WITH_REASON_PATH = `runs/${COMMIT}/20261026-1000-pull-request-aaaa.md`;
const FOUR_COLUMNS_PATH = `runs/${COMMIT}/20261026-1005-pull-request-bbbb.md`;
const rowsOf = (document) => document.sections.find((section) => section.heading === "## Outcomes").rows.map((row) => row.cells);
const branch = (texts) => ({ commit: "e".repeat(40), paths: Object.keys(texts), read: async (path) => texts[path] ?? null, blob: () => null });

// TST-121205 · level: unit · module: MOD-result-records
// guards: A RESULT RECORD IS NEVER REWRITTEN; UC-027
// given: a record whose Outcomes table has the column Reason, TST-121202 not run with the reason "secret missing: OPENAI_API_KEY" and TST-121201 passed with none
// input: readDocument(resultSchema.run, path, text), its findings, and writeDocument of what was read
// expect: no finding; the rows read TST-121202 not run with Reason "secret missing: OPENAI_API_KEY" and TST-121201 with no reason; written again, the text is byte for byte the one read
test("result record — a record with the column Reason round-trips", () => {
  const document = readDocument(resultSchema.run, WITH_REASON_PATH, WITH_REASON);
  assert.deepEqual(documentFindings(resultSchema.run, document), []);
  assert.deepEqual(rowsOf(document).map((cells) => [cells.Test, cells.Outcome, cells.Reason || null]),
    [["TST-121201", "passed", null], ["TST-121202", "not run", "secret missing: OPENAI_API_KEY"]]);
  assert.equal(writeDocument(resultSchema.run, document), WITH_REASON);
});

// TST-121206 · level: unit · module: MOD-result-records
// guards: A RESULT RECORD IS NEVER REWRITTEN; UC-028
// given: on one commit, a record of the four columns before Reason (TST-121201 failed, TST-121203 passed) beside a record with Reason (TST-121201 passed, TST-121202 not run with a reason); the commit also the last release's
// input: readDocument of the four-column record and its findings; resultsAt, flakyTests, rateComparison and testHistory over the branch holding both
// expect: no finding, and its rows have no reason; resultsAt reads from both records — TST-121201 flaky with both records, TST-121202 not run, TST-121203 passed; flakyTests names TST-121201 passed in the record with Reason and failed in the four-column one; rateComparison names no test; testHistory of TST-121201 marks the commit flaky
test("result record — a record of the four columns before Reason is read by every reader with no reason", async () => {
  const document = readDocument(resultSchema.run, FOUR_COLUMNS_PATH, FOUR_COLUMNS);
  assert.deepEqual(documentFindings(resultSchema.run, document), []);
  assert.deepEqual(rowsOf(document).map((cells) => [cells.Test, cells.Reason ?? null]), [["TST-121201", null], ["TST-121203", null]]);
  const results = branch({ [WITH_REASON_PATH]: WITH_REASON, [FOUR_COLUMNS_PATH]: FOUR_COLUMNS });
  const [unit] = await resultsAt(results, COMMIT, [{ id: "TST-121201", level: "unit" }, { id: "TST-121202", level: "unit" }, { id: "TST-121203", level: "unit" }]);
  assert.deepEqual(unit.tests.map((t) => [t.id, t.outcome, t.records.length]), [["TST-121201", "flaky", 2], ["TST-121202", "not run", 1], ["TST-121203", "passed", 1]]);
  assert.deepEqual(await flakyTests(results, COMMIT), [{ test: "TST-121201", passedIn: [WITH_REASON_PATH], failedIn: [FOUR_COLUMNS_PATH] }]);
  assert.deepEqual(await rateComparison(results, COMMIT, RELEASE), []);
  assert.deepEqual((await testHistory(results, "TST-121201", [])).commits, [{ commit: COMMIT, outcome: "flaky" }]);
});
