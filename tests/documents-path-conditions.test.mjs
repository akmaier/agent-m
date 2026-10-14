// A schema whose paths name rules of their own, and values that depend on the path of the document they stand in —
// MOD-documents' schema language as the accepted text of docs/architecture/MOD-documents.md states it under Data: "a pattern
// may be written { "pattern": "…", "rule": "…" }, and a document at that path then names its rule in place of the schema's
// own"; and a condition may name "patterns of the schema's own path, and holds for a document whose path matches one of them".
// Run: node --test tests/documents-path-conditions.test.mjs
//
// Module: MOD-documents
// Guards: A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED; THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY; A BACKLOG ITEM NAMES THE MODULES IT CHANGES; A PLAN STEP NAMES THE TESTS OF ITS LEVEL
// Level: unit
//
// The fixture schema is a step of a plan and an item of a backlog alike, as the item schema of the architecture is: its two
// paths each name their rule; `modules` names A BACKLOG ITEM NAMES THE MODULES IT CHANGES only for a file under
// docs/backlog/, and `level` is required, under A PLAN STEP NAMES THE TESTS OF ITS LEVEL, only for a file under docs/plan/.
// Each test states its input and its expected result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { documentFindings, loadSchema, readDocument } from "../src/documents/index.mjs";

const PLAN_RULE = "THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY";
const BACKLOG_RULE = "THE BACKLOG LIVES IN THE PRODUCT REPOSITORY";
const MODULES_RULE = "A BACKLOG ITEM NAMES THE MODULES IT CHANGES";
const LEVEL_RULE = "A PLAN STEP NAMES THE TESTS OF ITS LEVEL";
const PLAN = "docs/plan/ITM-{nnn}-{slug}.md";
const BACKLOG = "docs/backlog/ITM-{nnn}-{slug}.md";

const schemaText = (json) => `# A fixture schema\n\n\`\`\`json\n${JSON.stringify(json, null, 2)}\n\`\`\`\n`;
const STEP = {
  schema: "step", shape: "document", rule: BACKLOG_RULE,
  path: [{ pattern: PLAN, rule: PLAN_RULE }, { pattern: BACKLOG, rule: BACKLOG_RULE }],
  identifier: { field: "id", kind: "ITM" },
  frontMatter: {
    id: { type: "identifier", of: ["ITM"], required: true, rule: "EVERY ARTIFACT HAS AN IDENTIFIER" },
    modules: { type: "list", item: { type: "identifier", of: ["MOD"] }, required: true, nonEmpty: true,
      variants: [{ when: { path: [BACKLOG] }, rule: MODULES_RULE }] },
    level: { type: "text", required: false, requiredWhen: { path: [PLAN], rule: LEVEL_RULE } },
  },
  otherSections: "allowed",
};
const schema = loadSchema(schemaText(STEP), "the test");

const text = (lines) => ["---", ...lines, "---", "# ITM-007 A step", ""].join("\n");
const findingsAt = (path, lines) => documentFindings(schema, readDocument(schema, path, text(lines)))
  .map((f) => [f.line, f.rule]);

// TST-472176 · level: unit · module: MOD-documents
// guards: A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
// given: the fixture schema — two paths written { pattern, rule }, a variant and a requiredWhen whose condition names a path —; then the same schema with a condition naming docs/other/{slug}.md, a pattern its own path does not hold; and one with a path written with a key besides pattern and rule
// input: loadSchema of each
// expect: the first loads; each other is refused with a SchemaError naming the condition or the path it concerns
test("loadSchema — a path may name its rule, and a condition may name a pattern of the schema's own path, and nothing else", () => {
  assert.equal(schema.schema, "step");
  const foreign = structuredClone(STEP);
  foreign.frontMatter.modules.variants[0].when = { path: ["docs/other/{slug}.md"] };
  assert.throws(() => loadSchema(schemaText(foreign), "the test"),
    (error) => error.name === "SchemaError" && /frontMatter\.modules\.variants\[0\]\.when/.test(error.key), "a foreign pattern");
  const extra = structuredClone(STEP);
  extra.path[0].weight = 2;
  assert.throws(() => loadSchema(schemaText(extra), "the test"),
    (error) => error.name === "SchemaError" && /^path\[0\]/.test(error.key), "a key besides pattern and rule");
});

// TST-472177 · level: unit · module: MOD-documents
// guards: A BACKLOG ITEM NAMES THE MODULES IT CHANGES; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY
// given: a step and an item, each with `modules` empty
// input: documentFindings of docs/backlog/ITM-007-a-step.md and of docs/plan/ITM-007-a-step.md
// expect: one error each, on the line of modules (3): under docs/backlog/ naming A BACKLOG ITEM NAMES THE MODULES IT CHANGES, the variant's rule; under docs/plan/ naming THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY, the rule of the plan's path, in place of the schema's own
test("documentFindings — a variant whose condition is a path holds only for a document at that path; elsewhere the path's own rule is named", () => {
  const lines = ["id: ITM-007", "modules: []", "level: module"];
  assert.deepEqual(findingsAt("docs/backlog/ITM-007-a-step.md", lines), [[3, MODULES_RULE]]);
  assert.deepEqual(findingsAt("docs/plan/ITM-007-a-step.md", lines), [[3, PLAN_RULE]]);
});

// TST-472178 · level: unit · module: MOD-documents
// guards: A PLAN STEP NAMES THE TESTS OF ITS LEVEL
// given: known positive first — a step with its level —; then a step and an item without one
// input: documentFindings at docs/plan/… and at docs/backlog/…
// expect: no finding for the step with its level; for the step without, one error naming A PLAN STEP NAMES THE TESTS OF ITS LEVEL, the condition's rule; none for the item, where the path's condition does not hold
test("documentFindings — a value required where a path condition holds is required only at that path", () => {
  assert.deepEqual(findingsAt("docs/plan/ITM-007-a-step.md", ["id: ITM-007", "modules:", "  - MOD-store", "level: module"]), []);
  assert.deepEqual(findingsAt("docs/plan/ITM-007-a-step.md", ["id: ITM-007", "modules:", "  - MOD-store"]).map(([, rule]) => rule),
    [LEVEL_RULE]);
  assert.deepEqual(findingsAt("docs/backlog/ITM-007-a-step.md", ["id: ITM-007", "modules:", "  - MOD-store"]), []);
});

// TST-472179 · level: unit · module: MOD-documents
// guards: THE BACKLOG LIVES IN THE PRODUCT REPOSITORY; THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY
// given: a document with a key the schema does not list — a finding that names no rule closer than the schema's own
// input: documentFindings at docs/plan/…, at docs/backlog/…, and at a path neither pattern holds
// expect: at a matching path one unknown-key error names that path's rule; at a path no pattern holds, the path error and the unknown-key error both name the schema's own rule
test("documentFindings — a finding that names the schema's own rule names the rule of the document's path instead", () => {
  const lines = ["id: ITM-007", "modules:", "  - MOD-store", "level: module", "colour: blue"];
  assert.deepEqual(findingsAt("docs/plan/ITM-007-a-step.md", lines).map(([, rule]) => rule), [PLAN_RULE]);
  assert.deepEqual(findingsAt("docs/backlog/ITM-007-a-step.md", lines).map(([, rule]) => rule), [BACKLOG_RULE]);
  const path = "notes/ITM-007-a-step.md";
  const found = documentFindings(schema, readDocument(schema, path, text(lines)));
  assert.deepEqual(found.map(({ line, rule, what }) => [line, rule, what]), [
    [1, BACKLOG_RULE, `the path ${path} does not match a path of the format step`],
    [6, BACKLOG_RULE, "the key colour is not a key of the format step"],
  ]);
});
