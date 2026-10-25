// The four schemas MOD-documents owns (docs/architecture/MOD-documents.md, Interfaces: artifactSchemas): the use case, the
// architecture decision, the module and the item — a step of the plan and an item of the backlog alike —, loaded from the
// module's own files under src/documents/schemas/.
// Run: node --test tests/documents-artifact-schemas.test.mjs
//
// Module: MOD-documents
// Guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY; A BACKLOG ITEM NAMES WHAT IT REALISES; A BACKLOG ITEM NAMES THE MODULES IT CHANGES; A PLAN STEP NAMES THE TESTS OF ITS LEVEL; A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
// Level: unit
//
// This repository's own module files and backlog items are read as they stand, never changed; a fixture item is written
// here. Each test states its input and its expected result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { artifactSchemas, documentFindings, readDocument } from "../src/documents/index.mjs";

const ROOT = new URL("../", import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), "utf8");
const filesIn = (folder, pattern) => readdirSync(new URL(folder, ROOT)).filter((name) => pattern.test(name)).sort()
  .map((name) => `${folder}${name}`);

// TST-472153 · level: unit · module: MOD-documents
// guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
// given: the module
// input: artifactSchemas()
// expect: four loaded schemas, named use-case, decision, module and item
test("artifactSchemas — the use case, the decision, the module and the item, loaded", () => {
  const schemas = artifactSchemas();
  assert.deepEqual(Object.keys(schemas).sort(), ["decision", "item", "module", "useCase"]);
  assert.deepEqual([schemas.useCase, schemas.decision, schemas.module, schemas.item].map((s) => s.schema),
    ["use-case", "decision", "module", "item"]);
});

// TST-472154 · level: unit · module: MOD-documents
// guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
// given: known positive first — docs/architecture/MOD-work-plans.md, which uses MOD-product-process.holdsRole and provides heldItems —; then every module file of this repository
// input: readDocument(artifactSchemas().module, each path, its text)
// expect: MOD-work-plans read with its identifier, its uses and what it provides; every module file read with its identifier and a list of the interfaces it uses
test("artifactSchemas().module — this repository's module files are read with their identifier and the interfaces they use", () => {
  const { module } = artifactSchemas();
  const plans = readDocument(module, "docs/architecture/MOD-work-plans.md", read("docs/architecture/MOD-work-plans.md"));
  assert.equal(plans.id, "MOD-work-plans");
  assert.ok(plans.fields.uses.includes("MOD-product-process.holdsRole"));
  assert.ok(plans.fields.provides.includes("heldItems"));
  for (const path of filesIn("docs/architecture/", /^MOD-.+\.md$/)) {
    const file = readDocument(module, path, read(path));
    assert.match(String(file.id), /^MOD-/, path);
    assert.ok(Array.isArray(file.fields.uses), path);
  }
});

// The fixture item, at `path`, with its modules and tests as given.
const itemText = ({ modules = ["MOD-store"], tests = ["unit"] } = {}) => [
  "---", "id: ITM-007", "title: Store the drafts", "level: module", "realises:", "  - UC-032",
  "modules:", ...modules.map((m) => `  - ${m}`), "builds_on: []", "tests:", ...tests.map((t) => `  - ${t}`),
  "origin:", "  - UC-032", "---", "# ITM-007 Store the drafts", "", "## Outcome", "", "Drafts are stored.", "",
  "## Acceptance", "", "- a unit test stores one.", "",
].join("\n");
const rulesAt = (path, text) => documentFindings(artifactSchemas().item, readDocument(artifactSchemas().item, path, text))
  .map((f) => f.rule);

// TST-472155 · level: unit · module: MOD-documents
// guards: A BACKLOG ITEM NAMES THE MODULES IT CHANGES; A PLAN STEP NAMES THE TESTS OF ITS LEVEL; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY
// given: known positive first — the fixture item, complete —; then without modules, and without tests
// input: documentFindings(artifactSchemas().item, the item read at docs/backlog/ITM-007-store-the-drafts.md, and at docs/plan/ITM-007-store-the-drafts.md)
// expect: no finding for the complete item at either path; without modules, A BACKLOG ITEM NAMES THE MODULES IT CHANGES under docs/backlog/ and THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY under docs/plan/; without tests, THE BACKLOG LIVES IN THE PRODUCT REPOSITORY under docs/backlog/ and A PLAN STEP NAMES THE TESTS OF ITS LEVEL under docs/plan/
test("artifactSchemas().item — a backlog item and a plan step each name the rule of their own kind", () => {
  const backlog = "docs/backlog/ITM-007-store-the-drafts.md", plan = "docs/plan/ITM-007-store-the-drafts.md";
  assert.deepEqual(rulesAt(backlog, itemText()), []);
  assert.deepEqual(rulesAt(plan, itemText()), []);
  assert.deepEqual(rulesAt(backlog, itemText({ modules: [] }).replace("modules:\n", "modules: []\n")),
    ["A BACKLOG ITEM NAMES THE MODULES IT CHANGES"]);
  assert.deepEqual(rulesAt(plan, itemText({ modules: [] }).replace("modules:\n", "modules: []\n")),
    ["THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY"]);
  assert.deepEqual(rulesAt(backlog, itemText({ tests: [] }).replace("tests:\n", "")), ["THE BACKLOG LIVES IN THE PRODUCT REPOSITORY"]);
  assert.deepEqual(rulesAt(plan, itemText({ tests: [] }).replace("tests:\n", "")), ["A PLAN STEP NAMES THE TESTS OF ITS LEVEL"]);
});

// TST-472156 · level: unit · module: MOD-documents
// guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; A BACKLOG ITEM NAMES THE MODULES IT CHANGES
// given: known positive first — docs/backlog/ITM-292's file, which builds on items of its own —; then every backlog item of this repository
// input: readDocument(artifactSchemas().item, each path, its text)
// expect: each read with its identifier, the modules it changes — at least one — and the items it builds on as a list
test("artifactSchemas().item — this repository's backlog items are read with their modules and what they build on", () => {
  const { item } = artifactSchemas();
  const paths = filesIn("docs/backlog/", /^ITM-\d{3}-.+\.md$/);
  const known = paths.find((path) => path.includes("ITM-292-"));
  assert.ok(known, "known positive: ITM-292 is in the backlog");
  assert.ok(readDocument(item, known, read(known)).fields.builds_on.length > 0);
  for (const path of paths) {
    const doc = readDocument(item, path, read(path));
    assert.match(String(doc.id), /^ITM-\d{3}$/, path);
    assert.ok(doc.fields.modules.length > 0, path);
    assert.ok(Array.isArray(doc.fields.builds_on), path);
  }
});

// TST-8108 · level: unit · module: MOD-documents
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
// given: known positive first — the fixture item, complete, without built_by —; then with `built_by` naming one commit of 40 lowercase hexadecimal digits, after `origin`; then naming a short form `43347a8a`, and the word `main`
// input: documentFindings(artifactSchemas().item, the item read at docs/backlog/ITM-007-store-the-drafts.md), and the item's fields.built_by as read
// expect: no finding without built_by and none with the full commit, which is read as a list of that one commit; for the short form and for the word, one finding each, under PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
test("artifactSchemas().item — built_by names commits of 40 hexadecimal digits, and nothing else", () => {
  const backlog = "docs/backlog/ITM-007-store-the-drafts.md";
  const sha = "0123456789abcdef0123456789abcdef01234567";
  const withBuiltBy = (values) => itemText().replace("---\n# ITM-007", `built_by:\n${values.map((v) => `  - ${v}`).join("\n")}\n---\n# ITM-007`);
  assert.deepEqual(rulesAt(backlog, itemText()), []);
  assert.deepEqual(rulesAt(backlog, withBuiltBy([sha])), []);
  assert.deepEqual(readDocument(artifactSchemas().item, backlog, withBuiltBy([sha])).fields.built_by, [sha]);
  assert.deepEqual(rulesAt(backlog, withBuiltBy(["43347a8a"])), ["PROGRESS AND JOB STATE ARE DERIVED, NOT STORED"]);
  assert.deepEqual(rulesAt(backlog, withBuiltBy(["main"])), ["PROGRESS AND JOB STATE ARE DERIVED, NOT STORED"]);
});
