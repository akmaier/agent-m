// A run's outcomes from its JUnit XML report — MOD-result-records' parseOutcomes (junit.mjs), as the accepted text of
// docs/architecture/MOD-result-records.md states it (ITM-750): each case matched to its declaration by the TST-<nnn>
// at the start of its name; failure or error failed, skipped not run, any other passed; several cases of a
// deterministic test pass only if all pass; a model-dependent test's cases are its runs, "<k> of <n>", and not run when
// fewer ran than its declaration fixes; a case without an identifier undeclared; a declared test without a case not
// run; a text that is not a JUnit XML report UnreadableReport. Each report is given as the one report of its run, the list
// parseOutcomes reads (ITM-1212); several reports of a run are tests/result-records-reports.test.mjs's.
// Run: node --test tests/result-records-junit.test.mjs
//
// Module: MOD-result-records
// Guards: EVERY TEST RUN LEAVES A RESULT RECORD; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; EVERY TEST HAS ONE LEVEL
// Level: unit
//
// The fixture reports are written as node's JUnit reporter (node --test --test-reporter=junit) and as pytest
// (--junitxml) write them; the declarations are plain objects of TestDeclaration's shape. Nothing reads a file, waits
// or reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { parseOutcomes } from "../src/result-records/index.mjs";

const declaration = (id, level, extra = {}) => ({
  id, level, module: "MOD-result-records", guards: ["EVERY TEST RUN LEAVES A RESULT RECORD"], given: "g", input: "i",
  expect: `${id} expects x`, runs: null, phrasings: null, paid: null, path: "tests/x.test.mjs", line: 1, ...extra,
});

const NODE_REPORT = `<?xml version="1.0" encoding="utf-8"?>
<testsuites>
	<testcase name="TST-750001 passes" time="0.0007" classname="test" file="/w/tests/x.test.mjs"/>
	<testcase name="TST-750002 fails" time="0.0001" classname="test" file="/w/tests/x.test.mjs" failure="boom &lt;&amp;>">
		<failure type="testCodeFailure" message="boom &lt;&amp;>">
[Error [ERR_TEST_FAILURE]: boom] { code: 'ERR_TEST_FAILURE' }
		</failure>
	</testcase>
	<testcase name="TST-750003 skipped" time="0.00005" classname="test" file="/w/tests/x.test.mjs">
		<skipped type="skipped" message="why"/>
	</testcase>
	<!-- tests 3 -->
	<!-- fail 1 -->
</testsuites>
`;

const PYTEST_REPORT = `<?xml version="1.0" encoding="utf-8"?><testsuites><testsuite name="pytest" errors="1" failures="1" skipped="1" tests="4"><testcase classname="tests.test_x" name="TST-750001 passes" time="0.001"/><testcase classname="tests.test_x" name="TST-750002 fails" time="0.002"><failure message="assert 1 == 2">def test_f():
&gt;       assert 1 == 2
E       assert 1 == 2</failure></testcase><testcase classname="tests.test_x" name="TST-750003 skipped" time="0.0"><skipped type="pytest.skip" message="why">tests/test_x.py:9: why</skipped></testcase><testcase classname="tests.test_x" name="TST-750004 errors" time="0.0"><error message="collection failure">ImportError</error></testcase></testsuite></testsuites>`;

const DECLARATIONS = [
  declaration("TST-750001", "unit"), declaration("TST-750002", "component"), declaration("TST-750003", "unit"),
  declaration("TST-750004", "system"),
];

const simple = (o) => ({ test: o.test, outcome: o.outcome });

// TST-750101 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: a report as node's JUnit reporter writes it — TST-750001 a plain case, TST-750002 with a failure element, TST-750003 with a skipped element — and declarations of the three
// input: parseOutcomes([NODE_REPORT], declarations)
// expect: TST-750001 passed with level unit, TST-750002 failed with level component, TST-750003 not run; no other outcome; no run counts
test("parseOutcomes — node's report: a failure is failed, a skipped case not run, any other passed", () => {
  const outcomes = parseOutcomes([NODE_REPORT], DECLARATIONS.slice(0, 3));
  assert.deepEqual(outcomes.map(simple), [
    { test: "TST-750001", outcome: "passed" }, { test: "TST-750002", outcome: "failed" },
    { test: "TST-750003", outcome: "not run" },
  ]);
  assert.deepEqual(outcomes.map((o) => [o.level, o.runs]), [["unit", null], ["component", null], ["unit", null]]);
});

// TST-750102 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: a report as pytest writes it — TST-750001 plain, TST-750002 with a failure, TST-750003 skipped, TST-750004 with an error element — and declarations of the four
// input: parseOutcomes([PYTEST_REPORT], declarations)
// expect: TST-750001 passed, TST-750002 failed, TST-750003 not run, TST-750004 failed (an error is a failure)
test("parseOutcomes — pytest's report: failure and error failed, skipped not run, any other passed", () => {
  assert.deepEqual(parseOutcomes([PYTEST_REPORT], DECLARATIONS).map(simple), [
    { test: "TST-750001", outcome: "passed" }, { test: "TST-750002", outcome: "failed" },
    { test: "TST-750003", outcome: "not run" }, { test: "TST-750004", outcome: "failed" },
  ]);
});

// TST-750103 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: the node report and pytest report above, the declaration of TST-750002 expecting "TST-750002 expects x"
// input: parseOutcomes([report], declarations), for each report, read at the failed outcome
// expect: failure.expected is the declaration's expected result, failure.observed the failure's message (node: "boom <&>", pytest: "assert 1 == 2"), failure.log holds the text of the element (node: ERR_TEST_FAILURE; pytest: the traceback line "E       assert 1 == 2"); a passed outcome has failure null
test("parseOutcomes — a failed outcome carries the expected result, the observed one and the log", () => {
  const fromNode = parseOutcomes([NODE_REPORT], DECLARATIONS);
  const failedNode = fromNode.find((o) => o.test === "TST-750002");
  assert.equal(failedNode.failure.expected, "TST-750002 expects x");
  assert.equal(failedNode.failure.observed, "boom <&>");
  assert.match(failedNode.failure.log, /ERR_TEST_FAILURE/);
  assert.equal(fromNode.find((o) => o.test === "TST-750001").failure, null);
  const failedPytest = parseOutcomes([PYTEST_REPORT], DECLARATIONS).find((o) => o.test === "TST-750002");
  assert.equal(failedPytest.failure.observed, "assert 1 == 2");
  assert.match(failedPytest.failure.log, /E {7}assert 1 == 2/);
});

// TST-750104 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: declarations of TST-750001 (three cases, all passing) and TST-750002 (three cases, the second failing), deterministic
// input: parseOutcomes([report], declarations)
// expect: one outcome per test, in order — TST-750001 passed, TST-750002 failed; neither carries runs
test("parseOutcomes — several cases of a deterministic test pass only if all pass", () => {
  const cases = (name, outcomes) => outcomes.map((o, i) =>
    `<testcase name="${name} case ${i}" classname="t">${o === "fail" ? '<failure message="no">x</failure>' : ""}</testcase>`).join("");
  const report = `<testsuites><testsuite name="s">${cases("TST-750001", ["ok", "ok", "ok"])}${cases("TST-750002", ["ok", "fail", "ok"])}</testsuite></testsuites>`;
  const outcomes = parseOutcomes([report], DECLARATIONS.slice(0, 2));
  assert.deepEqual(outcomes.map(simple), [
    { test: "TST-750001", outcome: "passed" }, { test: "TST-750002", outcome: "failed" },
  ]);
  assert.deepEqual(outcomes.map((o) => o.runs), [null, null]);
});

const runsReport = (name, passed, failed) =>
  `<testsuites><testsuite name="s">${("<testcase name=\"" + name + " run\" classname=\"t\"/>").repeat(passed)}${
    ("<testcase name=\"" + name + " run\" classname=\"t\"><failure message=\"wrong\">w</failure></testcase>").repeat(failed)
  }</testsuite></testsuites>`;
const RATE = [declaration("TST-750010", "unit", { runs: 20, phrasings: 4 })];

// TST-750105 · level: unit · module: MOD-result-records
// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: a model-dependent test TST-750010 fixing 20 runs, and a report with 20 cases of it, 17 passing and 3 failing
// input: parseOutcomes([report], declarations)
// expect: one outcome for TST-750010, level unit, runs "17 of 20", outcome passed (the failures are counted in the rate, they do not fail the test), failure null
test("parseOutcomes — a model-dependent test with 17 of 20 runs passed reads 17 of 20", () => {
  const outcomes = parseOutcomes([runsReport("TST-750010", 17, 3)], RATE);
  assert.equal(outcomes.length, 1);
  assert.equal(outcomes[0].test, "TST-750010");
  assert.equal(outcomes[0].level, "unit");
  assert.equal(outcomes[0].runs, "17 of 20");
  assert.equal(outcomes[0].outcome, "passed");
  assert.equal(outcomes[0].failure, null);
});

// TST-750106 · level: unit · module: MOD-result-records
// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
// given: the same test fixing 20 runs, and a report with only 12 cases of it, all passing
// input: parseOutcomes([report], declarations)
// expect: TST-750010 not run, because fewer ran than the 20 it fixes
test("parseOutcomes — a model-dependent test with fewer cases than its fixed runs is not run", () => {
  const outcomes = parseOutcomes([runsReport("TST-750010", 12, 0)], RATE);
  assert.deepEqual(outcomes.map(simple), [{ test: "TST-750010", outcome: "not run" }]);
});

// TST-750107 · level: unit · module: MOD-result-records
// guards: EVERY TEST HAS ONE LEVEL
// given: a report with a case named "plain case" and one named "TST-999999 nobody declared this", and a declaration of TST-750001 only
// input: parseOutcomes([report], declarations)
// expect: the two cases are undeclared, test is the case's name, level null, runs null; and TST-750001, declared and without a case, is not run with its level unit, after them
test("parseOutcomes — a case without a declaration is undeclared; a declared test without a case is not run", () => {
  const report = `<testsuites><testsuite name="s"><testcase name="plain case" classname="t"/><testcase name="TST-999999 nobody declared this" classname="t"><failure message="f">x</failure></testcase></testsuite></testsuites>`;
  const outcomes = parseOutcomes([report], [declaration("TST-750001", "unit")]);
  assert.deepEqual(outcomes.map((o) => [o.test, o.outcome, o.level, o.runs]), [
    ["plain case", "undeclared", null, null],
    ["TST-999999 nobody declared this", "undeclared", null, null],
    ["TST-750001", "not run", "unit", null],
  ]);
});

// TST-750108 · level: unit · module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD
// given: texts that are not a JUnit XML report — "", "plain text", a JSON object, an HTML page, a report cut off in the middle of a tag
// input: parseOutcomes([text], declarations)
// expect: each throws an error named UnreadableReport with a reason; a report of one empty testsuite is readable and gives every declared test not run
test("parseOutcomes — a text that is not a JUnit XML report gives UnreadableReport", () => {
  for (const text of ["", "plain text", '{"tests": []}', "<html><body>x</body></html>", '<testsuites><testsuite name="s"><testcase name="TST-750001 a'])
    assert.throws(() => parseOutcomes([text], DECLARATIONS), (error) => error.name === "UnreadableReport" && typeof error.reason === "string" && error.reason.length > 0, text);
  assert.deepEqual(parseOutcomes(['<testsuites><testsuite name="s"/></testsuites>'], [declaration("TST-750001", "unit")]).map(simple),
    [{ test: "TST-750001", outcome: "not run" }]);
});
