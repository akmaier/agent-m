// ITM-1169 — MOD-test-document's Data, as docs/architecture/MOD-test-document.md states it: a declaration's "first line names the identifier; each following line is `key: value`", and "a declaration
// ends at the first line that is not a comment line of this form". A header that wraps a field over a further comment line is therefore read as ending there, and the fields after it are lost; the
// headers are what changes, so that each field of a declaration stands on one line.
// Run: node --test tests/test-document-one-line.test.mjs
//
// Module: MOD-test-document
// Guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// Level: unit
//
// The first test shows the reading on a fixture: a field wrapped over a second comment line leaves the fields after it missing, and the same fields on one line each are read. The second reads every test file under
// tests/ with testDeclarations and lists each declaration read without its given, input or expect. It runs against the files of this repository, so a header that wraps a field fails it, and a header that is
// missing a field fails it too: the item says such a field is written.

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { isTestFile, testDeclarations } from "../src/test-document/index.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const FIELDS = ["given", "input", "expect"];

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  if (name === "node_modules" || name === ".git") return [];
  return statSync(path).isDirectory() ? walk(path) : [path];
});

// A fixture test file of one declaration, with `lines` as the comment lines after the first.
const fixture = (lines) => [`// TST-1169901 · level: unit · module: MOD-test-document`, ...lines.map((line) => `// ${line}`), 'test("a case", () => {});', ""].join("\n");

// TST-1169001 · level: unit · module: MOD-test-document
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// given: a fixture header whose `input` is wrapped over a second comment line, and the same header with each field on one line
// input: testDeclarations reads both
// expect: the wrapped header is read with its input cut at the first line and its expect missing (null); the one-line header is read with given, input and expect, each whole
test("TST-1169001: a field wrapped over a second line leaves the fields after it missing; one line each reads them all", () => {
  const wrapped = testDeclarations("tests/sample.test.mjs", fixture(["guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS", "given: a header", "input: it is read,", "and then it is judged", "expect: it is judged"]));
  assert.equal(wrapped.length, 1);
  assert.equal(wrapped[0].given, "a header");
  assert.equal(wrapped[0].input, "it is read,");
  assert.equal(wrapped[0].expect, null);

  const oneLine = testDeclarations("tests/sample.test.mjs", fixture(["guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS", "given: a header", "input: it is read, and then it is judged", "expect: it is judged"]));
  assert.equal(oneLine.length, 1);
  assert.equal(oneLine[0].given, "a header");
  assert.equal(oneLine[0].input, "it is read, and then it is judged");
  assert.equal(oneLine[0].expect, "it is judged");
});

// TST-1169002 · level: unit · module: MOD-test-document
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
// given: every test file under tests/ of this repository
// input: testDeclarations reads each, and the declarations read are checked for given, input and expect
// expect: at least 1000 declarations are read (a known positive), and none is read with a given, input or expect missing
test("TST-1169002: every declaration under tests/ is read with its given, input and expect", () => {
  const found = [];
  let read = 0;
  for (const full of walk(join(ROOT, "tests"))) {
    const path = relative(ROOT, full);
    if (!isTestFile(path) && !/\.(mjs|py|md|js)$/.test(path)) continue;
    let text;
    try { text = readFileSync(full, "utf8"); } catch { continue; }
    for (const declaration of testDeclarations(path, text)) {
      read += 1;
      const missing = FIELDS.filter((field) => !declaration[field]);
      if (missing.length > 0) found.push(`${path}:${declaration.line} ${declaration.id} lacks ${missing.join(", ")}`);
    }
  }
  assert.ok(read >= 1000, `known positive: the declarations of tests/ are found (${read})`);
  assert.deepEqual(found, [], `${found.length} declarations are read without a field`);
});
