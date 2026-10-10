// MOD-personal-data — canonical product settings schemas and the pseudonymisation reader.
//
// TST-290101
// level: unit
// module: MOD-personal-data
// guards: PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
// given: the accepted MOD-personal-data settings schema and canonical docs/settings.md texts
// input: settingsSchemas(), readDocument() for no key, on and off, then pseudonymisationOf()
// expect: the schemas own docs/settings.md and docs/collaborators.md, and only an explicit off disables rewriting

import assert from "node:assert/strict";
import test from "node:test";
import { readDocument, readRegister, writeDocument } from "../src/documents/index.mjs";

const personalData = () => import("../src/personal-data/index.mjs");

test("TST-290101 settings schemas own the canonical product files and pseudonymisation defaults to on", async () => {
  const { settingsSchemas, pseudonymisationOf } = await personalData();
  const schemas = await settingsSchemas();

  assert.equal(schemas.settings.path, "docs/settings.md");
  assert.deepEqual(schemas.settings.frontMatter, {
    pseudonymisation: { type: "enum", values: ["on", "off"] },
  });
  assert.equal(schemas.collaborators.path, "docs/collaborators.md");
  assert.deepEqual(schemas.collaborators.sections[0].table.columns.map((column) => column.name), [
    "Name", "Account", "Agreed",
  ]);
  const read = (text) => readDocument(schemas.settings, "docs/settings.md", text);
  assert.equal(pseudonymisationOf(null), "on");
  assert.equal(pseudonymisationOf(read("# Settings of this product\n")), "on");
  assert.equal(pseudonymisationOf(read("---\npseudonymisation: on\n---\n# Settings of this product\n")), "on");
  assert.equal(pseudonymisationOf(read("---\npseudonymisation: off\n---\n# Settings of this product\n")), "off");
});

// TST-290102
// level: unit
// module: MOD-personal-data
// guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// given: the accepted MOD-personal-data collaborators schema and a canonical product-title register
// input: readRegister() and writeDocument() through that schema
// expect: a table row requires Name, Account and Agreed yes, is read under the product title, and round-trips unchanged

test("TST-290102 collaborators schema requires name, account and affirmative agreement", async () => {
  const { settingsSchemas } = await personalData();
  const { collaborators } = await settingsSchemas();
  const columns = collaborators.sections[0].table.columns;

  assert.deepEqual(columns, [
    { name: "Name", value: { type: "text", required: true } },
    { name: "Account", value: { type: "text", required: true } },
    { name: "Agreed", value: { type: "enum", values: ["yes"], required: true } },
  ]);
  const text = "# Collaborators of this product\n\n| Name | Account | Agreed |\n|---|---|---|\n| Ada Example | ada-example | yes |\n";
  const { document, rows } = readRegister(collaborators, "docs/collaborators.md", text);
  assert.deepEqual(rows, [{ line: 5, cells: { Name: "Ada Example", Account: "ada-example", Agreed: "yes" } }]);
  assert.equal(writeDocument(collaborators, document), text);
});
