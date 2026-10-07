// The test schedule and its default (ITM-250) — MOD-test-schedule's scheduleSchema and defaultSchedule, as the accepted
// text of docs/architecture/MOD-test-schedule.md and docs/backlog/ITM-250-the-test-schedule-and-its-default.md state
// them: the schema of a product's docs/tests/schedule.md, in schedule.schema.md, and the book's default, in
// default-schedule.md, marked as the default. scheduleFindings, ciConfiguration, configurationDrift, secretsNeeded,
// occasionsOf, proposeSchedule, applyPipelineSchedule and scheduleStrategies are UC-027's, not part of this item, and
// are not tested here.
// Run: node --test tests/test-schedule.test.mjs
//
// Module: MOD-test-schedule
// Guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL; THE DEFAULT SCHEDULE FOLLOWS THE BOOK
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). Nothing here sleeps,
// waits or reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { scheduleSchema, defaultSchedule } from "../src/test-schedule/index.mjs";
import { readDocument, documentFindings } from "../src/documents/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";

// The cells of the "## Levels" section's rows, in order, by Row — only the keys each row's cells actually hold: a
// blank cell of the schema's own "✓ or left out" columns is absent, not empty (MOD-documents, Data: a cell that is
// empty or — is a value left out).
function levelsOf(document) {
  const section = document.sections.find((s) => s.heading === "## Levels");
  assert.ok(section, "the document has no ## Levels section");
  return section.rows.map((row) => row.cells);
}

// ---------------------------------------------------------------- defaultSchedule

// guards: THE DEFAULT SCHEDULE FOLLOWS THE BOOK; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// given: this module's own default-schedule.md, the book's default
// input: defaultSchedule()
// expect: a Document read with scheduleSchema (kind "schedule", path docs/tests/schedule.md) and marked as the
//         default; its "## Levels" rows and columns exactly as docs/architecture/MOD-test-schedule.md's Data table
//         gives them — unit, component and system ticked for every occasion; paid only for nightly, release
//         candidate and on demand; release and user only for release candidate and on demand —, and every row
//         ticked for release candidate
test("defaultSchedule — the book's default, read with the schema, marked as the default", () => {
  const document = defaultSchedule();
  assert.equal(document.kind, "schedule");
  assert.equal(document.path, "docs/tests/schedule.md");
  assert.equal(document.default, true);
  assert.deepEqual(levelsOf(document), [
    { Row: "unit", "every commit": "✓", "pull request": "✓", nightly: "✓", "release candidate": "✓", "on demand": "✓" },
    { Row: "component", "every commit": "✓", "pull request": "✓", nightly: "✓", "release candidate": "✓", "on demand": "✓" },
    { Row: "system", "every commit": "✓", "pull request": "✓", nightly: "✓", "release candidate": "✓", "on demand": "✓" },
    { Row: "paid", nightly: "✓", "release candidate": "✓", "on demand": "✓" },
    { Row: "release", "release candidate": "✓", "on demand": "✓" },
    { Row: "user", "release candidate": "✓", "on demand": "✓" },
  ]);
  for (const cells of levelsOf(document)) assert.equal(cells["release candidate"], "✓");
});

// ---------------------------------------------------------------- a product's own schedule, read with the schema

const PRODUCT_SCHEDULE = `---
nightly: 03:30
command: pytest -q
report: build/junit.xml
---
## Levels

| Row | every commit | pull request | nightly | release candidate | on demand | runs on |
|---|---|---|---|---|---|---|
| unit | ✓ | ✓ | | ✓ | ✓ | |
| component | ✓ | | | ✓ | ✓ | |
| system | | | ✓ | ✓ | ✓ | lab-runner |
| paid | | | ✓ | ✓ | ✓ | |
| release | | | | ✓ | ✓ | |
| user | | | | ✓ | ✓ | |
`;

// guards: THE DEFAULT SCHEDULE FOLLOWS THE BOOK (its absence: a product's own schedule carries no such mark)
// given: PRODUCT_SCHEDULE, a product's own docs/tests/schedule.md — a declared nightly time, a command and a report
//        path (so it runs its tests with neither node's own test runner nor its JUnit reporter), a tick pattern that
//        differs from the book's default in every one of the five occasion columns, and one row naming a
//        self-hosted runner
// input: readDocument(scheduleSchema, "docs/tests/schedule.md", PRODUCT_SCHEDULE)
// expect: the front matter and the "## Levels" table read back exactly as given, with no finding; document.default
//         is left unset — only defaultSchedule()'s own document carries it
test("scheduleSchema — a product's own schedule, read with the schema", () => {
  const document = readDocument(scheduleSchema, "docs/tests/schedule.md", PRODUCT_SCHEDULE);
  assert.equal(document.fields.nightly, "03:30");
  assert.equal(document.fields.command, "pytest -q");
  assert.equal(document.fields.report, "build/junit.xml");
  assert.deepEqual(levelsOf(document), [
    { Row: "unit", "every commit": "✓", "pull request": "✓", "release candidate": "✓", "on demand": "✓" },
    { Row: "component", "every commit": "✓", "release candidate": "✓", "on demand": "✓" },
    { Row: "system", nightly: "✓", "release candidate": "✓", "on demand": "✓", "runs on": "lab-runner" },
    { Row: "paid", nightly: "✓", "release candidate": "✓", "on demand": "✓" },
    { Row: "release", "release candidate": "✓", "on demand": "✓" },
    { Row: "user", "release candidate": "✓", "on demand": "✓" },
  ]);
  assert.equal(document.default, undefined);
  assert.equal(documentFindings(scheduleSchema, document).length, 0, "a schedule that fits the schema has no finding");
});

// ---------------------------------------------------------------- a schedule of another shape, named by MOD-documents' findings

const MALFORMED_SCHEDULE = `---
command: run-tests
---
## Levels

| Row | every commit | pull request | nightly | release candidate | on demand | runs on |
|---|---|---|---|---|---|---|
| integration | ✓ | | | ✓ | ✓ | |

## Notes

Not part of the format.
`;

// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT (through scheduleSchema's own rule, which every finding here
//         names, since no closer part of the schema names one)
// given: MALFORMED_SCHEDULE — no declared nightly time, a Row this format names none of its six for, and a section
//        the format does not allow
// input: documentFindings(scheduleSchema, readDocument(scheduleSchema, "docs/tests/schedule.md", MALFORMED_SCHEDULE))
// expect: three findings, each in MOD-text-tools' one line form: the missing nightly (line 1, where a missing key
//         always stands), the Row integration (line 8, the row it stands on), and the forbidden section ## Notes
//         (line 10) — each naming THE TEST SCHEDULE IS DECLARED PER PRODUCT, the schema's own rule
test("scheduleSchema — a schedule of another shape, named by MOD-documents' findings", () => {
  const document = readDocument(scheduleSchema, "docs/tests/schedule.md", MALFORMED_SCHEDULE);
  const findings = documentFindings(scheduleSchema, document).map(formatFinding);
  assert.deepEqual(findings, [
    "docs/tests/schedule.md:1: error: the key nightly is required, and left out "
      + "[THE TEST SCHEDULE IS DECLARED PER PRODUCT] — give the key nightly a value.",
    "docs/tests/schedule.md:8: error: the column Row does not fit: \"integration\" is not one of unit, component, "
      + "system, paid, release, user [THE TEST SCHEDULE IS DECLARED PER PRODUCT] — correct the column Row of this row.",
    "docs/tests/schedule.md:10: error: the section ## Notes is not a section of the format schedule, which allows no "
      + "other [THE TEST SCHEDULE IS DECLARED PER PRODUCT] — remove the section ## Notes, or move its text into a "
      + "section the format names: ## Levels.",
  ]);
});
