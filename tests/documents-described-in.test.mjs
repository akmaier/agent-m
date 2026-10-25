// The values a section must describe — MOD-documents' documentFindings, as the accepted text of
// docs/architecture/MOD-documents.md states it: "every finding the schema can decide: … values that `describedIn` requires and
// the section does not describe", where `describedIn` means "each value must stand in the named section as a bullet that begins
// with the value in backticks", and such a finding names "the variant that holds for it, then its value specification" (Data,
// The requirement a finding names).
// Run: node --test tests/documents-described-in.test.mjs
//
// Module: MOD-documents
// Guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
// Level: unit
//
// The documents are the module schema's own (artifactSchemas), written in this file. Where the module file leaves a choice open,
// these tests settle it: the finding on an undescribed value stands on the line of the key that names it; a bullet describes a
// value when the backtick is followed by the value and then by no letter, digit or underscore, so that `statusOf(…)` describes
// statusOf and not status. Each test states its input and its expected result before it runs, and shows first, as its known
// positive, that the document that fits has none.

import test from "node:test";
import assert from "node:assert/strict";
import { artifactSchemas, readDocument, documentFindings } from "../src/documents/index.mjs";

const text = (...lines) => `${lines.join("\n")}\n`;
const moduleText = ({ id = "MOD-lending", provides = ["lend"], interfaces = ["- `lend(book) -> Loan` — lends a book."] } = {}) => text(
  "---", `id: ${id}`, "title: Lending", "folder: src/lending/", "realises:", "follows:", "  - ARC-001", "uses:", "provides:",
  ...provides.map((name) => `  - ${name}`), "---", `# ${id} Lending`, "", "## Responsibility", "", "It lends books.", "", "## Parts", "",
  "- `index.mjs` — the interface.", "", "## Data", "", "It keeps nothing.", "", "## Interfaces", "", ...interfaces, "", "## Files", "",
  "It reads no file.", "", "## Uses", "", "Nothing.");
const findingsOf = (schema, path, body) => documentFindings(schema, readDocument(schema, path, body))
  .map((f) => [f.line, f.rule, f.artifact]);
const MODULE = "docs/architecture/MOD-lending.md";

// TST-320322012 · level: unit · module: MOD-documents
// guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
// given: the module file MOD-lending, whose `provides` names lend, described in ## Interfaces by the bullet "- `lend(book) -> Loan` — …"; the same file providing also `history`, which no bullet describes; and the same file providing `status`, described only by a bullet that begins with `statusOf`
// input: documentFindings of each, read by the module schema
// expect: none for the first; for each of the others one error, on the line of the key `provides` (line 9), under A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES, the rule of the schema's `provides`, whose `what` names the value
test("documentFindings — a provided interface that ## Interfaces does not describe is an error on the line of `provides`", () => {
  const { module } = artifactSchemas();
  const RULE = "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES";
  assert.deepEqual(findingsOf(module, MODULE, moduleText()), [], "known positive: every provided interface described");

  const history = documentFindings(module, readDocument(module, MODULE, moduleText({ provides: ["lend", "history"] })));
  assert.deepEqual(history.map((f) => [f.line, f.rule]), [[9, RULE]]);
  assert.match(history[0].what, /\bhistory\b/);

  const status = documentFindings(module, readDocument(module, MODULE,
    moduleText({ provides: ["lend", "status"], interfaces: ["- `lend(book) -> Loan` — lends a book.", "- `statusOf(book) -> string` — its status."] })));
  assert.deepEqual(status.map((f) => [f.line, f.rule]), [[9, RULE]], "a bullet of a longer name describes another value");
  assert.match(status[0].what, /\bstatus\b/);
});
