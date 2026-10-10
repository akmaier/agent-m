// MOD-personal-data — canonical product settings schemas and the pseudonymisation reader.
//
// TST-290101
// level: unit
// module: MOD-personal-data
// guards: PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
// given: the accepted MOD-personal-data settings schema and a Document read through it
// input: settingsSchemas(), then pseudonymisationOf() for no document, no key, on and off
// expect: the schemas own docs/settings.md and docs/collaborators.md, and only an explicit off disables rewriting

import assert from "node:assert/strict";
import test from "node:test";

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
  assert.equal(pseudonymisationOf(null), "on");
  assert.equal(pseudonymisationOf({ frontMatter: {} }), "on");
  assert.equal(pseudonymisationOf({ frontMatter: { pseudonymisation: "on" } }), "on");
  assert.equal(pseudonymisationOf({ frontMatter: { pseudonymisation: "off" } }), "off");
});

// TST-290102
// level: unit
// module: MOD-personal-data
// guards: A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
// given: the accepted MOD-personal-data collaborators schema
// input: await settingsSchemas()
// expect: a table row requires Name, Account and an Agreed value of yes

test("TST-290102 collaborators schema requires name, account and affirmative agreement", async () => {
  const { settingsSchemas } = await personalData();
  const { collaborators } = await settingsSchemas();
  const columns = collaborators.sections[0].table.columns;

  assert.deepEqual(columns, [
    { name: "Name", value: { type: "text", required: true } },
    { name: "Account", value: { type: "text", required: true } },
    { name: "Agreed", value: { type: "enum", values: ["yes"], required: true } },
  ]);
});
