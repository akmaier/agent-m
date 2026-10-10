// The supported path patterns a Documents schema already validates and compiles decide one finding when a document is
// read from another path (ITM-297) — MOD-documents' public loadSchema, readDocument and documentFindings.
// Run: node --test tests/documents-path-patterns.test.mjs
//
// Module: MOD-documents
// Guards: UC-002; A FINDING READS LIKE A COMPILER MESSAGE; A DATA FORMAT IS DEFINED ONCE
// Level: unit
//
// Each case uses the public interface. A fitting path is the known positive before its wrong folder or extension. The
// mismatch names the document path, line 1 and the schema rule; no path in a schema adds no constraint.

import test from "node:test";
import assert from "node:assert/strict";
import { formatFinding } from "../src/text-tools/index.mjs";
import { loadSchema, readDocument, documentFindings } from "../src/documents/index.mjs";

const RULE = "A DATA FORMAT IS DEFINED ONCE";
const schemaFile = (schema) => `# ${schema.schema}\n\n\`\`\`json\n${JSON.stringify(schema)}\n\`\`\`\n`;
const load = (schema) => loadSchema(schemaFile(schema), "MOD-example");
const findingsOf = (schema, path, text = "") => documentFindings(schema, readDocument(schema, path, text));
const shape = (findings) => findings.map(({ artifact, line, kind, rule }) => ({ artifact, line, kind, rule }));

const singlePath = load({ schema: "example", shape: "document", rule: RULE, path: "docs/examples/{slug}.md" });
const alternatives = load({ schema: "example", shape: "document", rule: RULE,
  path: ["docs/examples/{slug}.md", "docs/archive/{slug}.md"] });
const unconstrained = load({ schema: "example", shape: "document", rule: RULE });
const withField = load({ schema: "example", shape: "document", rule: RULE, path: "docs/examples/{slug}.md",
  frontMatter: { title: { type: "text", required: true } } });

const mismatch = (path) => ({ artifact: path, line: 1, kind: "error", rule: RULE });

// TST-297001
// given: one supported string pattern and a document at its matching path
// input: public readDocument then documentFindings
// expect: no finding
test("a string path pattern accepts its matching path", () => {
  assert.deepEqual(findingsOf(singlePath, "docs/examples/alpha.md"), []);
});

// TST-297002
// given: that same known-valid string pattern and a document in a wrong folder
// input: public readDocument then documentFindings
// expect: one compiler-form finding at line 1, naming its path and the schema rule
test("a string path pattern rejects a wrong folder", () => {
  const path = "docs/other/alpha.md";
  const found = findingsOf(singlePath, path);
  assert.deepEqual(shape(found), [mismatch(path)]);
  assert.match(formatFinding(found[0]), new RegExp(`^${path}:1: error: .+ \\[${RULE}\\] — .+$`));
});

// TST-297003
// given: that same known-valid string pattern and a document with a wrong extension
// input: public readDocument then documentFindings
// expect: one compiler-form finding at line 1, naming its path and the schema rule
test("a string path pattern rejects a wrong extension", () => {
  const path = "docs/examples/alpha.txt";
  const found = findingsOf(singlePath, path);
  assert.deepEqual(shape(found), [mismatch(path)]);
  assert.match(formatFinding(found[0]), new RegExp(`^${path}:1: error: .+ \\[${RULE}\\] — .+$`));
});

// TST-297004
// given: two supported list alternatives and a path fitting each alternative in turn
// input: public readDocument then documentFindings
// expect: neither valid alternative yields a finding
test("a list of path patterns accepts either matching alternative", () => {
  assert.deepEqual(findingsOf(alternatives, "docs/examples/alpha.md"), []);
  assert.deepEqual(findingsOf(alternatives, "docs/archive/alpha.md"), []);
});

// TST-297005
// given: the list alternatives and a path fitting neither
// input: public readDocument then documentFindings
// expect: one compiler-form finding at line 1, naming its path and the schema rule
test("a list of path patterns rejects a path fitting neither alternative", () => {
  const path = "docs/other/alpha.md";
  const found = findingsOf(alternatives, path);
  assert.deepEqual(shape(found), [mismatch(path)]);
  assert.match(formatFinding(found[0]), new RegExp(`^${path}:1: error: .+ \\[${RULE}\\] — .+$`));
});

// TST-297006
// given: a schema that names no path pattern and a repository-relative path
// input: public readDocument then documentFindings
// expect: no path finding
test("an absent path pattern adds no path constraint", () => {
  assert.deepEqual(findingsOf(unconstrained, "any/folder/alpha.txt"), []);
});

// TST-297007
// given: a matching path and a required front-matter value left out
// input: public readDocument then documentFindings
// expect: the existing value finding remains, at line 1 under its own schema rule
test("a path check preserves existing value findings", () => {
  const found = findingsOf(withField, "docs/examples/alpha.md", "");
  assert.deepEqual(shape(found), [{ artifact: "docs/examples/alpha.md", line: 1, kind: "error", rule: RULE }]);
  assert.equal(found[0].what, "the key title is required, and left out");
});
