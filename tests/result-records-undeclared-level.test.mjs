// ITM-476: nullable undeclared levels across the public result-record interfaces.
// Module: MOD-result-records
// Level: component
// Guards: EVERY TEST RUN LEAVES A RESULT RECORD; EVERY TEST HAS ONE LEVEL; UC-028
// Run: node --test tests/result-records-undeclared-level.test.mjs
// Author/executor: developer-terra-a (this Codex session; actual runtime model unknown).
// KISS/DRY: reuse the public schemas, parser, writer and reader; fixture data stays separate.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readDocument, documentFindings, writeDocument } from "../src/documents/index.mjs";
import { parseOutcomes, appendResult, resultSchema, resultsAt } from "../src/result-records/index.mjs";
import { testDeclarations } from "../src/test-document/index.mjs";

const COMMIT = "1".repeat(40), HEAD = "2".repeat(40), MADE = "3".repeat(40);
const PATH = `runs/${COMMIT}/20261014-2305-pull-request-a1b2.md`;
const fixture = (name) => readFileSync(new URL(`./fixtures/result-records/${name}`, import.meta.url), "utf8");
const declarations = testDeclarations("tests/fixtures/result-records/declarations.txt", fixture("declarations.txt"));
const selected = (...ids) => declarations.filter((declaration) => ids.includes(declaration.id));
const declared = () => parseOutcomes(fixture("states.xml"), selected("TST-900001", "TST-900002", "TST-900003", "TST-900004"));
const unknown = () => parseOutcomes(fixture("unmatched.xml"), selected("TST-900001"));
const rowsOf = (document, heading = "## Outcomes") => document.sections.find((section) => section.heading === heading)?.rows ?? [];
const cell = (value) => String(value ?? "").replace(/\r?\n/g, "\\n");

// The same public Document mapping used by onTestsFinished, without another report parser or validator.
function recordOf(outcomes) {
  const document = readDocument(resultSchema.run, PATH, fixture("run.md"));
  document.fields.levels = ["unit", "component"];
  document.fields.occasion = "pull-request";
  document.sections = [{ heading: "## Outcomes", line: 1, text: "", rows: outcomes.map((outcome) => ({ line: 1, cells: {
    Test: cell(outcome.test), Level: outcome.level, Outcome: outcome.outcome, Runs: outcome.runs,
  } })) }];
  const failures = outcomes.filter((outcome) => outcome.failure);
  if (failures.length) document.sections.push({ heading: "## Failures", line: 1, text: "", rows: failures.map((outcome) => ({ line: 1, cells: {
    Test: cell(outcome.test), Expected: cell(outcome.failure.expected), Observed: cell(outcome.failure.observed), Log: cell(outcome.failure.log),
  } })) });
  return document;
}

// As in result-records-append.test.mjs: immutable snapshots and a Host that alone accepts one append at the read head.
function fixtureHost() {
  const files = new Map([["old.md", "immutable previous evidence\n"]]);
  const attempts = [];
  let head = HEAD;
  const host = {
    async readSnapshot(ref) {
      assert.equal(ref, "test-results");
      const frozen = new Map(files);
      return { ref, commit: head, paths: [...frozen.keys()], read: async (path) => frozen.get(path) ?? null, blob: () => null };
    },
    async commitFiles(change) {
      attempts.push(structuredClone(change));
      assert.equal(change.branch, "test-results");
      assert.equal(change.expectedHead, head);
      assert.deepEqual(Object.keys(change).sort(), ["branch", "expectedHead", "files", "message"]);
      assert.equal(change.files.length, 1);
      const [file] = change.files;
      assert.equal(file.path, PATH);
      assert.equal(files.has(file.path), false);
      files.set(file.path, file.text);
      head = MADE;
      return { commit: MADE };
    },
  };
  return { host, attempts, files };
}

function readBack(text) {
  const document = readDocument(resultSchema.run, PATH, text);
  assert.deepEqual(documentFindings(resultSchema.run, document), []);
  assert.equal(writeDocument(resultSchema.run, document), text, "canonical writer/reader round-trip");
  return document;
}

function assertUnknownRows(document, outcomes) {
  const rows = rowsOf(document);
  assert.equal(rows.length, outcomes.length, "no undeclared outcome was dropped");
  for (const outcome of outcomes.filter((entry) => entry.outcome === "undeclared")) {
    const matches = rows.filter((row) => row.cells.Test === outcome.test);
    assert.equal(matches.length, 1, `${outcome.test}: exactly one retained row`);
    assert.equal(matches[0].cells.Outcome, "undeclared");
    assert.equal(matches[0].cells.Level ?? null, null, "unknown level stays absent, never fabricated");
  }
}

async function assertNotPassed(fake) {
  const levels = await resultsAt(await fake.host.readSnapshot("test-results"), COMMIT, selected("TST-900001"));
  assert.equal(levels[0].passed, 0);
  assert.equal(levels[0].tests[0].outcome, "not run", "a non-leading identifier never passes the declared test");
}

// TST-476216
// level: component
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; TEST RESULTS ARE KEPT IN THE REPOSITORY; UC-028
// given: states.xml and all four declarations, with valid levels on every passed, failed and skipped outcome
// input: public parseOutcomes, documentFindings, writeDocument/readDocument, appendResult and resultsAt
// expect: no findings, canonical round-trip, exactly one append on the read head and the declared unit pass remains passed
test("TST-476216: declared outcomes are the positive writer and append control", async () => {
  const outcomes = declared();
  assert.deepEqual(outcomes.map((outcome) => outcome.outcome), ["passed", "failed", "failed", "not run"]);
  const document = recordOf(outcomes);
  assert.deepEqual(documentFindings(resultSchema.run, document), []);
  const text = writeDocument(resultSchema.run, document);
  assert.equal(rowsOf(readBack(text)).length, 4);
  const fake = fixtureHost();
  assert.deepEqual(await appendResult(fake.host, document), { commit: MADE, path: PATH });
  assert.equal(fake.attempts.length, 1);
  assert.equal(fake.attempts[0].expectedHead, HEAD);
  assert.equal(fake.files.get(PATH), text);
  assert.equal(fake.files.get("old.md"), "immutable previous evidence\n");
  const levels = await resultsAt(await fake.host.readSnapshot("test-results"), COMMIT, selected("TST-900001"));
  assert.equal(levels[0].passed, 1);
  assert.equal(levels[0].tests[0].outcome, "passed");
});

// TST-476217
// level: component
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: unknown, missing and non-leading identifiers from unmatched.xml; the parser returns undeclared with level null
// input: map the public Outcomes unchanged into the result Document and write/read it with the public schema
// expect: no Level rejection or finding, all undeclared rows retained exactly once with absent levels and canonical round-trip
test("TST-476217: nullable undeclared levels survive the public writer round-trip", () => {
  const outcomes = unknown();
  assert.equal(outcomes.filter((outcome) => outcome.outcome === "undeclared").length, 3);
  assert.ok(outcomes.filter((outcome) => outcome.outcome === "undeclared").every((outcome) => outcome.level === null));
  const document = recordOf(outcomes);
  let text;
  assert.doesNotThrow(() => { text = writeDocument(resultSchema.run, document); }, "undeclared Level=null must be writable");
  assert.deepEqual(documentFindings(resultSchema.run, document), []);
  assertUnknownRows(readBack(text), outcomes);
});

// TST-476218
// level: component
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; TEST RESULTS ARE KEPT IN THE REPOSITORY; UC-028
// given: the same public parser outcomes with three undeclared cases and a declared test that did not run
// input: public appendResult on an existing result branch, then public document and result readers
// expect: exactly one append, every unknown row retained as undeclared with absent Level, no invented pass and old evidence unchanged
test("TST-476218: append persists undeclared rows without counting them as passes", async () => {
  const outcomes = unknown(), fake = fixtureHost();
  let made;
  await assert.doesNotReject(async () => { made = await appendResult(fake.host, recordOf(outcomes)); }, "append must retain undeclared Level=null");
  assert.deepEqual(made, { commit: MADE, path: PATH });
  assert.equal(fake.attempts.length, 1);
  assertUnknownRows(readBack(fake.files.get(PATH)), outcomes);
  assert.equal(fake.files.get("old.md"), "immutable previous evidence\n");
  await assertNotPassed(fake);
});

// TST-476219
// level: component
// module: MOD-result-records
// guards: EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: undeclared-failures.xml contains unnamed-by-ID assertion failure and execution error cases with original excerpts
// input: public parseOutcomes -> unchanged Outcome-to-Document mapping -> appendResult -> public readDocument
// expect: both cases remain undeclared with null/absent Level; decoded observed messages and both failure/error log excerpts survive persistence
test("TST-476219: undeclared failures retain their excerpts through append and read", async () => {
  const outcomes = parseOutcomes(fixture("undeclared-failures.xml"), selected("TST-900001"));
  const failures = outcomes.filter((outcome) => outcome.failure);
  assert.equal(failures.length, 2);
  for (const outcome of failures) {
    assert.equal(outcome.outcome, "undeclared");
    assert.equal(outcome.level, null);
    assert.equal(outcome.failure.expected, null);
  }
  assert.equal(failures[0].failure.observed, "observed <waiting> & unstable");
  assert.equal(failures[0].failure.log, "expected ready, got waiting");
  assert.equal(failures[1].failure.observed, "connection unavailable");
  assert.equal(failures[1].failure.log, "operation raised an error");
  const fake = fixtureHost();
  await assert.doesNotReject(() => appendResult(fake.host, recordOf(outcomes)), "unknown failure evidence must not be rejected for Level=null");
  assert.equal(fake.attempts.length, 1);
  const document = readBack(fake.files.get(PATH));
  assertUnknownRows(document, outcomes);
  const retained = rowsOf(document, "## Failures");
  assert.equal(retained.length, 2);
  for (const outcome of failures) {
    const row = retained.find((entry) => entry.cells.Test === outcome.test);
    assert.ok(row, `${outcome.test}: failure excerpt retained`);
    assert.equal(row.cells.Expected ?? null, null);
    assert.equal(row.cells.Observed, outcome.failure.observed);
    assert.equal(row.cells.Log, outcome.failure.log);
  }
  await assertNotPassed(fake);
});

async function rejectsMissingLevel(outcome) {
  const document = recordOf(declared());
  const row = rowsOf(document)[0];
  row.cells.Outcome = outcome;
  delete row.cells.Level;
  assert.ok(documentFindings(resultSchema.run, document).some((finding) => finding.what.includes("Level") && finding.what.includes("required")));
  assert.throws(() => writeDocument(resultSchema.run, document), { name: "DocumentError", column: "Level" });
  const fake = fixtureHost();
  await assert.rejects(() => appendResult(fake.host, document), { name: "DocumentError", column: "Level" });
  assert.equal(fake.attempts.length, 0);
  assert.equal(fake.files.has(PATH), false);
}

// TST-476220
// level: component
// module: MOD-result-records
// guards: EVERY TEST HAS ONE LEVEL; EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: the declared positive-control Document with the passed row's Level removed
// input: documentFindings, writeDocument and appendResult through their public interfaces
// expect: Level remains required; a Level finding and DocumentError, no append attempt or fabricated evidence
test("TST-476220: a passed declared outcome still requires Level", () => rejectsMissingLevel("passed"));

// TST-476221
// level: component
// module: MOD-result-records
// guards: EVERY TEST HAS ONE LEVEL; EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: the declared positive-control Document with a failed row's Level removed
// input: documentFindings, writeDocument and appendResult through their public interfaces
// expect: Level remains required; a Level finding and DocumentError, no append attempt or fabricated evidence
test("TST-476221: a failed declared outcome still requires Level", () => rejectsMissingLevel("failed"));

// TST-476222
// level: component
// module: MOD-result-records
// guards: EVERY TEST HAS ONE LEVEL; EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: the declared positive-control Document with a not-run row's Level removed
// input: documentFindings, writeDocument and appendResult through their public interfaces
// expect: Level remains required; a Level finding and DocumentError, no append attempt or fabricated evidence
test("TST-476222: a not-run declared outcome still requires Level", () => rejectsMissingLevel("not run"));

// TST-476223
// level: component
// module: MOD-result-records
// guards: EVERY TEST HAS ONE LEVEL; EVERY TEST RUN LEAVES A RESULT RECORD; UC-028
// given: an actual undeclared parser outcome whose null Level is replaced with an invalid present value
// input: documentFindings, writeDocument and appendResult through their public interfaces
// expect: the enum still rejects the present invalid Level with a finding and DocumentError, and no append attempt
test("TST-476223: a present undeclared Level still obeys the enum", async () => {
  const outcome = unknown().find((entry) => entry.outcome === "undeclared");
  const document = recordOf([outcome]);
  rowsOf(document)[0].cells.Level = "invented-level";
  assert.ok(documentFindings(resultSchema.run, document).some((finding) => finding.what.includes("Level") && finding.what.includes("invented-level")));
  assert.throws(() => writeDocument(resultSchema.run, document), { name: "DocumentError", column: "Level" });
  const fake = fixtureHost();
  await assert.rejects(() => appendResult(fake.host, document), { name: "DocumentError", column: "Level" });
  assert.equal(fake.attempts.length, 0);
  assert.equal(fake.files.has(PATH), false);
});
