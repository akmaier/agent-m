// The texts of the schemas a drafted document is judged by — MOD-documents' artifactSchemaTexts, as docs/architecture/MOD-documents.md states it:
// "artifactSchemaTexts() -> { path: string, text: string }[] — the files of these four schemas as this module read them, each with its path below
// `src/documents/schemas/` and its text byte for byte, in the order use case, decision, module, item: what `documentFindings` judges a drafted document by,
// for a drafter to read (`A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY`)".
// Run: node --test tests/documents-schema-texts.test.mjs
//
// Module: MOD-documents
// Guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// Level: unit
//
// The reading this file takes of "its path below `src/documents/schemas/`": the file's path in the repository, `src/documents/schemas/<name>.schema.md`,
// which names the folder as well. The files are read here from the disk, so that the expected bytes are the files', not the module's. Each test states its
// input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { artifactSchemaTexts } from "../src/documents/index.mjs";

const NAMES = ["use-case", "decision", "module", "item"];
const fileOf = (name) => readFileSync(new URL(`../src/documents/schemas/${name}.schema.md`, import.meta.url), "utf8");

// TST-1792020 · level: unit · module: MOD-documents
// guards: A DRAFTING JOB RECEIVES THE FORM ITS DRAFT IS CHECKED BY
// given: the four schema files of src/documents/schemas/, read from the disk
// input: artifactSchemaTexts()
// expect: four entries, in the order use case, decision, module, item, each with its path src/documents/schemas/<name>.schema.md and the file's text byte
//   for byte
test("artifactSchemaTexts — the four schema files, under their paths, byte for byte, in their order", () => {
  assert.ok(fileOf("use-case").length > 0, "known positive: the file is read");
  assert.deepEqual(artifactSchemaTexts(), NAMES.map((name) => ({ path: `src/documents/schemas/${name}.schema.md`, text: fileOf(name) })));
});
