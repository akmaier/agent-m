// The product's personal-data settings (src/personal-data/, MOD-personal-data: settingsSchemas and pseudonymisationOf) — the files
// docs/settings.md and docs/collaborators.md, read and written by their schemas through MOD-documents — deterministic, no network.
// Run through tests/review-core.test.mjs: node --test tests/*.test.mjs
//
// Module: MOD-personal-data
// Guards: PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF; A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT; UC-042
// Level: unit
//
// Every expected value is written here; none is read from a document.

import test from "node:test";
import assert from "node:assert/strict";
import { settingsSchemas, pseudonymisationOf } from "../../src/personal-data/index.mjs";
import { readDocument, writeDocument } from "../../src/documents/index.mjs";

const { settings, collaborators } = await settingsSchemas();
const readSettings = (text) => readDocument(settings, "docs/settings.md", text);
const readCollaborators = (text) => readDocument(collaborators, "docs/collaborators.md", text);

// ---------------------------------------------------------------- settings in one place (UC-042)
// PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF · A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT

test("PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF — docs/settings.md, its key in the front matter", () => {
  assert.equal(settings.path, "docs/settings.md");
  assert.equal(pseudonymisationOf(null), "on", "no file: on");
  const plain = readSettings("# Settings of alice/thesis\n\nintro\n");
  assert.equal(pseudonymisationOf(plain), "on", "no setting: on");
  assert.equal(pseudonymisationOf(readSettings("---\npseudonymisation: on\n---\n# Settings of alice/thesis\n")), "on");
  // Switching it off writes the key, and everything else of the file stays as it was.
  const off = writeDocument(settings, { ...plain, fields: { ...plain.fields, pseudonymisation: "off" } });
  assert.equal(off, "---\npseudonymisation: off\n---\n# Settings of alice/thesis\n\nintro\n");
  assert.equal(pseudonymisationOf(readSettings(off)), "off", "only an explicit off switches it off");
  const on = readSettings(off);
  assert.equal(pseudonymisationOf(readSettings(writeDocument(settings, { ...on, fields: { ...on.fields, pseudonymisation: "on" } }))), "on",
    "switching back on");
  // Counter-proof: a value that is neither on nor off is not written.
  assert.throws(() => writeDocument(settings, { ...plain, fields: { pseudonymisation: "maybe" } }), /pseudonymisation/);
});

test("A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT — docs/collaborators.md reads and writes losslessly; a row records an agreement", () => {
  assert.equal(collaborators.path, "docs/collaborators.md");
  const text = "# Collaborators of alice/thesis\n\n| Name | Account | Agreed |\n|---|---|---|\n| Jane Doe | jdoe | yes |\n";
  const document = readCollaborators(text);
  assert.deepEqual(document.sections[0].rows.map((row) => row.cells), [{ Name: "Jane Doe", Account: "jdoe", Agreed: "yes" }]);
  assert.equal(writeDocument(collaborators, document), text, "read and written back unchanged");
  // + Collaborator adds a row of a person who agreed; the rows before it stay.
  const added = { ...document, sections: [{ ...document.sections[0], rows: [...document.sections[0].rows,
    { line: null, cells: { Name: "Max Müller", Account: "max-m", Agreed: "yes" } }] }] };
  assert.equal(writeDocument(collaborators, added), `${text}| Max Müller | max-m | yes |\n`);
  // Counter-proof: a person who did not agree is not written as a collaborator.
  const refused = { ...document, sections: [{ ...document.sections[0], rows: [...document.sections[0].rows,
    { line: null, cells: { Name: "Ann Lee", Account: "annlee", Agreed: "no" } }] }] };
  assert.throws(() => writeDocument(collaborators, refused), /Agreed/);
});
