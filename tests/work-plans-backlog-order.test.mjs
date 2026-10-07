// The backlog's order read as the table MOD-work-plans states (ITM-209) — MOD-work-plans' planSchemas, which gives the
// backlog-order schema: a table `Item` that names every backlog item by its identifier, in its order. MOD-documents reads
// the order by that schema with loadSchema and readDocument, and documentFindings names a row whose cell is no item's
// identifier, in MOD-text-tools' one form. Nothing else of MOD-work-plans is part of this item.
// Run: node --test tests/work-plans-backlog-order.test.mjs
//
// Module: MOD-work-plans
// Guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; UC-032
// Level: unit
//
// The order is read as every caller reads a document: through MOD-documents' interface, with the schema planSchemas
// gives — the module offers no reader of its own (MOD-work-plans, Interfaces: planSchemas) —, and its errors are those
// documentFindings names with that schema. This repository's own order, docs/backlog/order.md, is read as it stands and
// never changed.
//
// No new test for MOD-documents or MOD-text-tools: loadSchema, readDocument, documentFindings and formatFinding already
// read a frontMatter-less document schema with a table under its own heading (tests/documents.test.mjs, the declaration
// and participants fixtures), an identifier-typed table column (tests/documents-sections.test.mjs, the links fixture of
// docs/sources.md), and a cell that does not fit its column's type as one finding naming the column's rule
// (tests/documents-findings.test.mjs, the participants fixture) — the same mechanism this schema uses, only its own
// shape and rule.
//
// The third test reads this repository's own docs/backlog/order.md as it stands. Its gate in sprint 07
// (docs/gates/20261007-0820-development-release-testing-80de.md) rejected an earlier attempt whose expected result was a
// fixed list of the rows the order held that day: it broke as soon as the order gained one. Here the expected result is
// derived from the same file's table, read a second, independent way — never a list of today's rows — so that a row
// added to the order keeps this test green.
//
// Each test states its input and its expected result before it runs (given / input / expect); where a test asserts that
// something is found, the same call is first shown to find nothing on a known positive. Nothing reaches the network. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { documentFindings, readDocument, readRegister } from "../src/documents/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";
import { planSchemas } from "../src/work-plans/index.mjs";

const ORDER_PATH = "docs/backlog/order.md";
const REAL_ORDER = new URL("../docs/backlog/order.md", import.meta.url);

// An order in the form docs/backlog/order.md has: a title, "**REGISTER**", a sentence on the order, then its table under
// its own heading "## Order", with no front matter.
const orderOf = (...items) => [
  "# The order of the backlog",
  "",
  "**REGISTER**",
  "",
  "The backlog's items in their order: first the items that implement modules.",
  "",
  "## Order",
  "",
  "| Item |",
  "|---|",
  ...items.map((item) => `| ${item} |`),
  "",
].join("\n");

// The table's rows, read a second way: every line of the text that is a one-column row holding an item's identifier —
// never the header "| Item |", the separator "|---|", nor a line of the prose before the table, none of which this
// pattern matches. Independent of readRegister and of planSchemas.backlogOrder, this is how the third test below knows
// the table "as it finds it", whatever rows it holds.
const rowsOfTheRealTable = (text) => text.split("\n")
  .map((line) => /^\|\s*(ITM-\d{3,})\s*\|$/.exec(line.trim()))
  .filter(Boolean)
  .map((match) => match[1]);

// ---------------------------------------------------------------- planSchemas.backlogOrder: an order read in its order

// guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; UC-032
// given: an order naming three items, in the form the real file has: a title, a sentence, then the table under ## Order
// input: readRegister(planSchemas.backlogOrder, "docs/backlog/order.md", the text).rows
// expect: the three items, each with its line (11 to 13, after the title, the sentence and the table's header) and its
//         cell Item, in the table's order
test("planSchemas.backlogOrder — an order whose table Item names items is read as those items, in the table's order", () => {
  const { rows } = readRegister(planSchemas.backlogOrder, ORDER_PATH, orderOf("ITM-203", "ITM-204", "ITM-205"));
  assert.deepEqual(rows, [
    { line: 11, cells: { Item: "ITM-203" } },
    { line: 12, cells: { Item: "ITM-204" } },
    { line: 13, cells: { Item: "ITM-205" } },
  ]);
});

// ---------------------------------------------------------------- planSchemas.backlogOrder: a row that does not fit

// guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
// given: known positive first — an order of three items has no finding; then the same order with its second row's cell
//        FOO-204, which is no identifier of the kind ITM the identifier scheme gives backlog items
// input: documentFindings(planSchemas.backlogOrder, readDocument(planSchemas.backlogOrder, the path, the text)), each
//        finding in its one text form
// expect: none for the known positive; for the broken order, one error on line 12 — the row's own line —, naming
//         THE BACKLOG LIVES IN THE PRODUCT REPOSITORY, since no part of the schema closer to the cell names a rule of
//         its own
test("planSchemas.backlogOrder — a row whose cell is no item's identifier is named as a finding of that row", () => {
  const findingsOf = (text) => documentFindings(planSchemas.backlogOrder, readDocument(planSchemas.backlogOrder, ORDER_PATH, text))
    .map(formatFinding);
  assert.deepEqual(findingsOf(orderOf("ITM-203", "ITM-204", "ITM-205")), [], "known positive");
  assert.deepEqual(findingsOf(orderOf("ITM-203", "FOO-204", "ITM-205")), [
    "docs/backlog/order.md:12: error: the column Item does not fit: \"FOO-204\" is not an identifier ITM "
      + "[THE BACKLOG LIVES IN THE PRODUCT REPOSITORY] — correct the column Item of this row.",
  ]);
});

// ---------------------------------------------------------------- planSchemas.backlogOrder: this repository's own backlog

// guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; UC-032
// given: this repository's own docs/backlog/order.md, as it stands on disk; known positive first — the independent
//        pattern above finds this item's own row, ITM-209, so neither side of the comparison below can pass by both
//        coming back empty
// input: readRegister(planSchemas.backlogOrder, "docs/backlog/order.md", its text).rows, each row's cell Item; the same
//        text read by rowsOfTheRealTable
// expect: the same items, in the same order — whatever rows the file holds today, since both sides read the live file
test("planSchemas.backlogOrder — the order of this repository's own backlog is read as the items of its table, in their order", () => {
  const text = readFileSync(REAL_ORDER, "utf8");
  const wanted = rowsOfTheRealTable(text);
  assert.ok(wanted.includes("ITM-209"), "known positive — the independent pattern finds this item's own row");
  const { rows } = readRegister(planSchemas.backlogOrder, ORDER_PATH, text);
  assert.deepEqual(rows.map((row) => row.cells.Item), wanted);
});
