// MOD-site-frame's schemaForm shows a finding on a key the document lacks beside the field of that key (ITM-1290), as docs/architecture/MOD-site-frame.md states it (Interfaces, schemaForm): "a form with one field per key and
// section of a schema of MOD-documents [...]; the findings of `documentFindings` and of `extraChecks` shown beside their fields while typing". Run: node --test tests/site-frame-schema-form-missing-key.test.mjs
//
// Module: MOD-site-frame
// Guards: A FINDING READS LIKE A COMPILER MESSAGE
// Level: unit
//
// The form is built over the real item schema of MOD-documents and an item of the backlog, read as MOD-documents reads the file. The small DOM of tests/site-frame-dom.mjs stands for the browser. documentFindings names a
// required key the document lacks on line 1, the line of no field, with the correction "give the key <key> a value"; the reading, named in the pull request: such a finding stands beside the field of the key its correction
// names, where the schema has that key; a finding naming a key the schema does not know has no field and stays at the end of the form. Each test states its input and its expected result before it runs. Nothing reaches the
// network.

import test from "node:test";
import assert from "node:assert/strict";
import { document } from "./site-frame-dom.mjs";

const { schemaForm } = await import("../src/site-frame/index.mjs");
const { artifactSchemas, readDocument } = await import("../src/documents/index.mjs");

function elements(root, match) {
  const found = [];
  (function walk(n) { for (const k of n.childNodes) if (k.nodeType === 1) { if (match(k)) found.push(k); walk(k); } })(root);
  return found;
}
const byTag = (root, name) => elements(root, (e) => e.localName === name);
const turn = () => new Promise((resolve) => setImmediate(resolve));
const fieldOf = (form, key) => elements(form, (e) => e.getAttribute("data-key") === key)[0];
const inputOf = (form, key) => byTag(fieldOf(form, key), "input")[0];
const besideOf = (form, key) => byTag(fieldOf(form, key), "li").map((each) => each.textContent);
// The findings at the end of the form: the list that is a child of the form itself, not of a field.
const endOf = (form) => byTag([...form.childNodes].find((n) => n.nodeType === 1 && n.localName === "ul"), "li").map((each) => each.textContent);
const typeInto = async (input, text) => { input.value = text; input.dispatchEvent(new Event("input")); await turn(); };

const PATH = "docs/backlog/ITM-001-export-keeps-every-page.md";
const ITEM = ["---", "id: ITM-001", "title: Export keeps every page", "level: module", "realises:", "  - FIRST RULE", "modules:", "  - MOD-store", "tests:", "  - unit", "origin:",
  "  - https://github.com/alice/product/issues/7", "---", "# ITM-001 Export keeps every page", "", "## Outcome", "", "Every page is exported.", "", "## Acceptance", "", "- A unit test.", ""].join("\n");
const formOver = (extraChecks) => {
  const schema = artifactSchemas().item;
  return schemaForm(schema, readDocument(schema, PATH, ITEM), { onSave: async () => {}, extraChecks });
};

// TST-1290001 · level: unit · module: MOD-site-frame
// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: known positive first — a form over the valid item ITM-001 of the backlog shows no finding beside the fields modules and title, and none at its end
// input: the person empties the field of the required list key modules, then the field of the required text key title
// expect: the finding "the key modules is required, and left out" stands beside the field modules and the finding "the key title is required, and left out" beside the field title, neither at the end of the form. Counter-proof: before the change both stand at the end of the form and nothing beside either field
test("schemaForm — a finding on a required key the document lacks stands beside that key's field", async () => {
  const form = formOver();
  assert.deepEqual([...besideOf(form, "modules"), ...besideOf(form, "title"), ...endOf(form)], [], "known positive: no finding anywhere");
  await typeInto(inputOf(form, "modules"), "");
  await typeInto(inputOf(form, "title"), "  ");
  const modules = besideOf(form, "modules"), title = besideOf(form, "title"), end = endOf(form);
  assert.ok(modules.some((text) => text.includes("the key modules is required, and left out")), `beside modules: ${modules.join("\n")}; at the end: ${end.join("\n")}`);
  assert.ok(title.some((text) => text.includes("the key title is required, and left out")), `beside title: ${title.join("\n")}; at the end: ${end.join("\n")}`);
  assert.ok(!end.some((text) => text.includes("is required, and left out")), end.join("\n"));
});

// TST-1290002 · level: unit · module: MOD-site-frame
// guards: A FINDING READS LIKE A COMPILER MESSAGE
// given: a form over the valid item ITM-001 whose extraChecks gives, on line 1, one finding whose correction is "give the key colour a value", a key the item schema does not know, and one whose correction is "give the key title a value"
// input: the form is built, nothing typed
// expect: the finding on colour stands at the end of the form and beside no field; the finding on title stands beside the field title (the known positive of the same placing)
test("schemaForm — a finding on a key the schema does not know stays at the end of the form", () => {
  const extra = (key) => ({ artifact: "ITM-001", line: 1, kind: "warning", rule: "A FINDING READS LIKE A COMPILER MESSAGE", what: `the key ${key} is asked for by the caller`, fix: `give the key ${key} a value` });
  const form = formOver(() => [extra("colour"), extra("title")]);
  const end = endOf(form);
  assert.ok(end.some((text) => text.includes("the key colour is asked for")), end.join("\n"));
  assert.ok(!byTag(form, "li").some((text) => text.textContent.includes("the key colour") && !end.includes(text.textContent)), "colour stands beside no field");
  assert.ok(besideOf(form, "title").some((text) => text.includes("the key title is asked for")), besideOf(form, "title").join("\n"));
  assert.ok(!end.some((text) => text.includes("the key title")), end.join("\n"));
});
