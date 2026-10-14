// ITM-476 foundation: the accepted parseOutcomes interface, not the workflow entry or schedule.
// Module: MOD-result-records
// Level: unit
// Guards: EVERY TEST RUN LEAVES A RESULT RECORD; A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; UC-028
// Run: node --test tests/result-records-junit.test.mjs
// Author/executor: developer-terra-a (this Codex session; runtime model unavailable).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as records from "../src/result-records/index.mjs";
import { testDeclarations } from "../src/test-document/index.mjs";
import { readDocument, writeDocument } from "../src/documents/index.mjs";

const fixture = (name) => readFileSync(new URL(`./fixtures/result-records/${name}`, import.meta.url), "utf8");
const declarations = testDeclarations("tests/fixtures/result-records/declarations.txt", fixture("declarations.txt"));
const selected = (...ids) => declarations.filter((declaration) => ids.includes(declaration.id));
const byTest = (outcomes, id) => outcomes.find((outcome) => outcome.test === id);

function parse(report, tests) {
  assert.equal(typeof records.parseOutcomes, "function", "MOD-result-records public parseOutcomes must be implemented");
  return records.parseOutcomes(report, tests);
}

// TST-476200
// level: unit
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: the existing result schema and reader, with a canonical fixture run and declarations from their public owner
// input: readDocument/writeDocument and resultsAt on that run
// expect: the fixture round-trips, runs and expect have the accepted declaration fields, and TST-900001 is passed at unit level
test("TST-476200: existing result reader and declaration fixture are a positive control", async () => {
  const path = "runs/1111111111111111111111111111111111111111/20261014-0800-commit-a1b2.md";
  const text = fixture("run.md");
  const document = readDocument(records.resultSchema.run, path, text);
  assert.equal(writeDocument(records.resultSchema.run, document), text);
  assert.equal(selected("TST-900020")[0].runs, 4);
  assert.equal(selected("TST-900002")[0].expect, "expected <ready> & stable");
  const levels = await records.resultsAt({ paths: [path], read: async () => text, blob: () => null },
    document.fields.commit, selected("TST-900001"));
  assert.equal(levels[0].tests[0].outcome, "passed");
  assert.equal(levels[0].passed, 1);
});

// TST-476201
// level: unit
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: states.xml with passed, failure, error and skipped cases and their declarations
// input: parseOutcomes(report, declarations)
// expect: one Outcome per declared test: passed, failed, failed, not run; failed cases retain declaration expect and runner output
test("TST-476201: JUnit pass, failure, error and skipped map to declared outcomes", () => {
  const outcomes = parse(fixture("states.xml"), selected("TST-900001", "TST-900002", "TST-900003", "TST-900004"));
  assert.equal(outcomes.length, 4);
  assert.deepEqual(byTest(outcomes, "TST-900001"), { test: "TST-900001", level: "unit", outcome: "passed", runs: null, failure: null });
  for (const [id, level, observed, log] of [
    ["TST-900002", "component", "wrong value", "expected ready, observed waiting"],
    ["TST-900003", "unit", "connection unavailable", "operation raised an error"],
  ]) {
    const outcome = byTest(outcomes, id);
    assert.equal(outcome.level, level);
    assert.equal(outcome.outcome, "failed");
    assert.equal(outcome.runs, null);
    assert.equal(outcome.failure.expected, selected(id)[0].expect);
    assert.ok(outcome.failure.observed.includes(observed), `${id}: observed runner message`);
    assert.ok(outcome.failure.log.includes(log), `${id}: failure/error output retained`);
  }
  assert.deepEqual(byTest(outcomes, "TST-900004"), { test: "TST-900004", level: "component", outcome: "not run", runs: null, failure: null });
});

// TST-476202
// level: unit
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: unmatched.xml with an unknown leading ID, no ID, and an ID only in the middle; TST-900001 is declared
// input: parseOutcomes(report, declarations)
// expect: each unmatched case is undeclared under its full name with null level/runs/failure; the middle ID does not mark TST-900001 passed
test("TST-476202: undeclared and non-leading identifiers never match a declaration", () => {
  const outcomes = parse(fixture("unmatched.xml"), selected("TST-900001"));
  for (const name of ["TST-999999 unknown declaration", "ordinary case without an identifier", "prefix TST-900001 is not a leading identifier"]) {
    assert.deepEqual(byTest(outcomes, name), { test: name, level: null, outcome: "undeclared", runs: null, failure: null });
  }
  assert.equal(byTest(outcomes, "TST-900001").outcome, "not run");
  assert.equal(outcomes.length, 4);
});

// TST-476203
// level: unit
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: states.xml and a declaration for TST-900005 which has no report case
// input: parseOutcomes(report, declarations)
// expect: absent TST-900005 is present once at unit level as not run with null runs and failure
test("TST-476203: a declared test missing from the report is not run", () => {
  const outcomes = parse(fixture("states.xml"), selected("TST-900001", "TST-900005"));
  assert.deepEqual(byTest(outcomes, "TST-900005"), { test: "TST-900005", level: "unit", outcome: "not run", runs: null, failure: null });
  assert.equal(outcomes.filter((outcome) => outcome.test === "TST-900005").length, 1);
});

// TST-476204
// level: unit
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: aggregate.xml with all-pass, failure-then-pass and skip-then-pass deterministic groups across two suites
// input: parseOutcomes(report, declarations)
// expect: exactly three outcomes; all-pass passed, failure-then-pass failed, skip-then-pass not run; a later pass cannot overwrite an earlier non-pass
test("TST-476204: deterministic aggregation passes only when every case passes", () => {
  const outcomes = parse(fixture("aggregate.xml"), selected("TST-900010", "TST-900011", "TST-900012"));
  assert.equal(outcomes.length, 3);
  assert.equal(byTest(outcomes, "TST-900010").outcome, "passed");
  assert.equal(byTest(outcomes, "TST-900011").outcome, "failed");
  assert.equal(byTest(outcomes, "TST-900012").outcome, "not run");
  assert.equal(byTest(outcomes, "TST-900011").failure.expected, "both pass");
});

// TST-476205
// level: unit
// module: MOD-result-records
// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; UC-028
// given: rates.xml with two passes, one failure and one error for a model-dependent declaration fixing four runs
// input: parseOutcomes(report, declarations)
// expect: exactly one TST-900020 outcome, level system, runs 2 of 4 using the predeclared denominator, not an incomplete run
test("TST-476205: model cases are a rate against the fixed declaration count", () => {
  const outcomes = parse(fixture("rates.xml"), selected("TST-900020"));
  const entries = outcomes.filter((outcome) => outcome.test === "TST-900020");
  assert.equal(entries.length, 1);
  assert.equal(entries[0].level, "system");
  assert.equal(entries[0].runs, "2 of 4");
  assert.notEqual(entries[0].outcome, "not run", "all four runs executed");
});

// TST-476206
// level: unit
// module: MOD-result-records
// guards: A MODEL-DEPENDENT TEST IS MEASURED AS A RATE; UC-028
// given: rates.xml with two passes and one skipped case for a declaration fixing four runs
// input: parseOutcomes(report, declarations)
// expect: TST-900021 is not run, runs 2 of 4, never 2 of 2 or 2 of 3; the skipped case does not complete an executed run
test("TST-476206: incomplete model runs remain not run with the fixed denominator", () => {
  const outcome = byTest(parse(fixture("rates.xml"), selected("TST-900021")), "TST-900021");
  assert.equal(outcome.outcome, "not run");
  assert.equal(outcome.runs, "2 of 4");
});

// TST-476207
// level: unit
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: nested.xml with nested suites, decoded attributes/entities, CDATA containing fake testcase markup and a missing real case
// input: parseOutcomes(report, declarations)
// expect: real nested cases matched once, undecorated decoded case name retained, failure text decoded, CDATA not parsed as a case, TST-900003 not run
test("TST-476207: nested JUnit and decoded CDATA/entities preserve actual cases and failure evidence", () => {
  const outcomes = parse(fixture("nested.xml"), selected("TST-900001", "TST-900002", "TST-900003"));
  assert.equal(outcomes.length, 4);
  assert.equal(byTest(outcomes, "TST-900001").outcome, "passed");
  const failed = byTest(outcomes, "TST-900002");
  assert.equal(failed.failure.expected, "expected <ready> & stable");
  assert.ok(failed.failure.observed.includes("observed <waiting> & unstable"));
  assert.ok(failed.failure.log.includes("expected <ready> & stable; saw <waiting>"));
  assert.ok(failed.failure.log.includes("output <waiting> & A"));
  assert.equal(byTest(outcomes, "plain & decoded A").outcome, "undeclared");
  assert.equal(byTest(outcomes, "TST-900003").outcome, "not run", "CDATA's fake testcase is text, not a report case");
});

// TST-476208
// level: unit
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: a valid states.xml positive followed by malformed.xml with mismatched nesting
// input: parseOutcomes(report, declarations)
// expect: valid JUnit is accepted; malformed XML throws UnreadableReport with a nonempty reason, never returns passing outcomes
test("TST-476208: malformed XML is UnreadableReport, not a successful partial report", () => {
  assert.equal(byTest(parse(fixture("states.xml"), selected("TST-900001")), "TST-900001").outcome, "passed");
  assert.throws(() => parse(fixture("malformed.xml"), selected("TST-900001")), (error) => {
    assert.equal(error.name, "UnreadableReport");
    assert.equal(typeof error.reason, "string");
    assert.ok(error.reason.trim());
    return true;
  });
});

// TST-476209
// level: unit
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: a valid JUnit positive, well-formed non-report.xml containing a testcase, ordinary text and empty text
// input: parseOutcomes(report, declarations) for each
// expect: valid JUnit accepted; each non-report rejected as UnreadableReport with a nonempty reason
test("TST-476209: non-JUnit XML and non-XML text are rejected as UnreadableReport", () => {
  assert.equal(byTest(parse(fixture("states.xml"), selected("TST-900001")), "TST-900001").outcome, "passed");
  for (const report of [fixture("non-report.xml"), "not a report", ""]) {
    assert.throws(() => parse(report, selected("TST-900001")), (error) => error.name === "UnreadableReport" && Boolean(error.reason?.trim()));
  }
});
