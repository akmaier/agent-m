// The identifier against the path, the values describedIn asks for, and a list's `unique` — MOD-documents' documentFindings as
// docs/architecture/MOD-documents.md states it: "the identifier against the path; … values that `describedIn` requires and the
// section does not describe", and of the schema language: "a specification of type `list` may add `"unique": true`: no item
// stands in the list twice".
// Run: node --test tests/documents-identifier-described-unique.test.mjs
//
// Module: MOD-documents
// Guards: EVERY ARTIFACT HAS AN IDENTIFIER; A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES; ONE MODULE, ONE FILE
// Level: unit
//
// The documents are the module and the decision of the fixture tests/fixtures/architecture/, read by the schemas the module owns
// (artifactSchemas); each broken text is a copy with one change, and each expected finding is written here.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as documents from "../src/documents/index.mjs";

const { module: moduleSchema, decision } = documents.artifactSchemas();
const fixture = (name) => readFileSync(new URL(`./fixtures/architecture/docs/architecture/${name}`, import.meta.url), "utf8");
const REVIEW = fixture("MOD-review.md"), ARC = fixture("ARC-001-static-client.md");
const findingsOf = (schema, path, text) => documents.documentFindings(schema, documents.readDocument(schema, path, text))
  .map((f) => [f.line, f.rule, f.what]);

// A copy of a text with one change: `from` must occur exactly once.
function changed(text, from, to) {
  assert.equal(text.split(from).length - 1, 1, `the changed text occurs once: ${JSON.stringify(from)}`);
  return text.replace(from, () => to);
}

// TST-1800001 · level: unit · module: MOD-documents
// guards: EVERY ARTIFACT HAS AN IDENTIFIER
// given: the fixture's module MOD-review and decision ARC-001, each complete; known positive: each at its own path has no finding
// input: documentFindings of the module at docs/architecture/MOD-other.md and of the decision at docs/architecture/ARC-002-static-client.md; and of the decision whose id is ARC-1, at its own path
// expect: one finding each, on line 2 under EVERY ARTIFACT HAS AN IDENTIFIER, naming the identifier written and the one its path gives; for ARC-1 only the finding that it is no identifier ARC, not a second one against the path
test("the identifier in the front matter is the one its path gives", () => {
  assert.deepEqual(findingsOf(moduleSchema, "docs/architecture/MOD-review.md", REVIEW), []);
  assert.deepEqual(findingsOf(decision, "docs/architecture/ARC-001-static-client.md", ARC), []);
  assert.deepEqual(findingsOf(moduleSchema, "docs/architecture/MOD-other.md", REVIEW),
    [[2, "EVERY ARTIFACT HAS AN IDENTIFIER", "the key id is MOD-review, and the identifier its path gives is MOD-other"]]);
  assert.deepEqual(findingsOf(decision, "docs/architecture/ARC-002-static-client.md", ARC),
    [[2, "EVERY ARTIFACT HAS AN IDENTIFIER", "the key id is ARC-001, and the identifier its path gives is ARC-002"]]);
  const noKind = findingsOf(decision, "docs/architecture/ARC-001-static-client.md", changed(ARC, "id: ARC-001", "id: ARC-1"));
  assert.equal(noKind.length, 1);
  assert.match(noKind[0][2], /"ARC-1" is not an identifier ARC/);
});

// TST-1800002 · level: unit · module: MOD-documents
// guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
// given: the fixture's module MOD-review, which provides status and describes it in ## Interfaces by the bullet "- `status(path) -> …`"
// input: documentFindings of a copy that provides history besides, which no bullet describes; and of a copy whose bullet is "- `statuses(path)`"
// expect: one finding for history and one for status, each at the line of provides (14) under A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES; a name that only begins the bullet's name is not described
test("each interface a module provides is described by a bullet of ## Interfaces", () => {
  assert.deepEqual(findingsOf(moduleSchema, "docs/architecture/MOD-review.md", changed(REVIEW, "provides:\n  - status\n", "provides:\n  - status\n  - history\n")),
    [[14, "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES", "the key provides names history, which ## Interfaces does not describe"]]);
  assert.deepEqual(findingsOf(moduleSchema, "docs/architecture/MOD-review.md", changed(REVIEW, "- `status(path)", "- `statuses(path)")),
    [[14, "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES", "the key provides names status, which ## Interfaces does not describe"]]);
});

// TST-1800003 · level: unit · module: MOD-documents
// guards: A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES; ONE MODULE, ONE FILE
// given: the module schema, whose provides is a list with unique; and a schema written here whose key of type text says unique
// input: documentFindings of the fixture's MOD-review providing status twice; loadSchema of the schema with unique on a text
// expect: one finding at the line of provides under A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES, saying the list names "status" twice; loadSchema throws SchemaError naming unique
test("a list whose specification says unique names each item once", () => {
  assert.deepEqual(findingsOf(moduleSchema, "docs/architecture/MOD-review.md", changed(REVIEW, "provides:\n  - status\n", "provides:\n  - status\n  - status\n")),
    [[14, "A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES", 'the key provides does not fit: the list names "status" twice, and it names each item once']]);
  const schema = { schema: "note", shape: "document", rule: "ONE MODULE, ONE FILE", path: "docs/notes/{slug}.md",
    frontMatter: { title: { type: "text", required: true, unique: true } } };
  assert.throws(() => documents.loadSchema("```json\n" + JSON.stringify(schema) + "\n```\n", "MOD-documents"), (error) => error.name === "SchemaError" && /unique/.test(error.message));
});
