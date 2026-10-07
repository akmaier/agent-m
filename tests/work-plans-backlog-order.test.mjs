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
// given: this repository's own docs/backlog/order.md, as it stands on disk
// input: readRegister(planSchemas.backlogOrder, "docs/backlog/order.md", its text).rows, each row's cell Item
// expect: the backlog's items, in the order the table gives them
test("planSchemas.backlogOrder — the order of this repository's own backlog is read as the items of its table, in their order", () => {
  const { rows } = readRegister(planSchemas.backlogOrder, ORDER_PATH, readFileSync(REAL_ORDER, "utf8"));
  assert.deepEqual(rows.map((row) => row.cells.Item), [
    "ITM-203", "ITM-204", "ITM-205", "ITM-206", "ITM-211", "ITM-212", "ITM-213", "ITM-214", "ITM-224", "ITM-220",
    "ITM-227", "ITM-215", "ITM-216", "ITM-217", "ITM-219", "ITM-221", "ITM-218", "ITM-229", "ITM-226", "ITM-228",
    "ITM-230", "ITM-231", "ITM-222", "ITM-223", "ITM-240", "ITM-241", "ITM-242", "ITM-232", "ITM-233", "ITM-234",
    "ITM-235", "ITM-236", "ITM-237", "ITM-238", "ITM-225", "ITM-207", "ITM-210", "ITM-209", "ITM-208", "ITM-239",
  ]);
});
