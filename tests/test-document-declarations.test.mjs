// The declarations of the tests (ITM-248) — MOD-test-document's interface as docs/architecture/MOD-test-document.md
// states it: TestDeclaration and testDeclarations, reading every test declaration of a test file from the comment lines
// of its language — `//`, `#`, `--`, `;` or ` *` inside a block comment — or, for a Markdown file, from a heading
// `### TST-<nnn> <title>`. testFindings is not part of ITM-248 and is not tested here.
// Run: node --test tests/test-document-declarations.test.mjs
//
// Module: MOD-test-document
// Guards: UC-013; A RELEASE RUNS EVERY TEST AT EVERY LEVEL
// Level: unit
//
// Every expected value is read from the module file's Data table and its example. Each test states its input and its
// expected result before it runs (given / input / expect); where a test asserts that nothing is found, the same call is
// first shown to find something on a known positive (ends-at-non-form-line, no-declaration). The counter-proofs are
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { testDeclarations } from "../src/test-document/index.mjs";

// ---------------------------------------------------------------- a declaration with every key, one per comment marker
//
// Given: a declaration in the comment marker named, with every key MOD-test-document's Data table lists, each on its own
// line after the identifier. Input: that file's text. Expect: one TestDeclaration with every key read, `path` the name
// given and `line` the identifier's line (from 1).

const FULL = {
  level: "unit",
  module: "MOD-sample",
  guards: ["A SAMPLE REQUIREMENT", "UC-900"],
  given: "a sample precondition",
  input: "a sample input",
  expect: "a sample expected result",
  runs: 3,
  phrasings: 2,
  paid: "a sample service",
};

function fullExpected(id, path, line) {
  return { id, path, line, ...FULL };
}

// The text of a test file, every key of FULL on its own line in `marker`'s comment, the identifier `id` on the first.
function markerText(marker, id) {
  return [
    `${marker} ${id}`,
    `${marker} level: ${FULL.level}`,
    `${marker} module: ${FULL.module}`,
    `${marker} guards: ${FULL.guards.join("; ")}`,
    `${marker} given: ${FULL.given}`,
    `${marker} input: ${FULL.input}`,
    `${marker} expect: ${FULL.expect}`,
    `${marker} runs: ${FULL.runs}`,
    `${marker} phrasings: ${FULL.phrasings}`,
    `${marker} paid: ${FULL.paid}`,
    "",
  ].join("\n");
}

const MARKER_NAMES = { "//": "slash-slash", "#": "hash", "--": "dash-dash", ";": "semicolon" };

for (const marker of ["//", "#", "--", ";"]) {
  test(`a '${marker}' declaration is read with every key — MOD-test-document`, () => {
    const path = `fixtures/marker-${MARKER_NAMES[marker]}.test.mjs`;
    const text = markerText(marker, "TST-001");
    assert.deepEqual(testDeclarations(path, text), [fullExpected("TST-001", path, 1)]);
  });
}

test("a ' *' block-comment declaration is read with every key — MOD-test-document", () => {
  const path = "fixtures/marker-block.test.mjs";
  const text = [
    "/**",
    " * TST-002",
    " * level: unit",
    " * module: MOD-sample",
    " * guards: A SAMPLE REQUIREMENT; UC-900",
    " * given: a sample precondition",
    " * input: a sample input",
    " * expect: a sample expected result",
    " * runs: 3",
    " * phrasings: 2",
    " * paid: a sample service",
    " */",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text), [fullExpected("TST-002", path, 2)]);
});

test("a Markdown heading declaration is read with every key — MOD-test-document", () => {
  const path = "fixtures/manual-tests.md";
  const text = [
    "# Manual tests",
    "",
    "### TST-003 A sample manual test",
    "level: user",
    "module: MOD-sample",
    "guards: A SAMPLE REQUIREMENT; UC-900",
    "given: a sample precondition",
    "input: a sample input",
    "expect: a sample expected result",
    "runs: 3",
    "phrasings: 2",
    "paid: a sample service",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text), [
    { id: "TST-003", path, line: 3, ...FULL, level: "user" },
  ]);
});

// ---------------------------------------------------------------- a missing key

test("a declaration missing a key is read with that key null — MOD-test-document", () => {
  const path = "fixtures/missing-key.test.mjs";
  const text = [
    "// TST-004",
    "// level: unit",
    "// module: MOD-sample",
    "// guards: A SAMPLE REQUIREMENT",
    "// input: a sample input",
    "// expect: a sample expected result",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text), [{
    id: "TST-004",
    level: "unit",
    module: "MOD-sample",
    guards: ["A SAMPLE REQUIREMENT"],
    given: null,
    input: "a sample input",
    expect: "a sample expected result",
    runs: null,
    phrasings: null,
    paid: null,
    path,
    line: 1,
  }]);
});

// ---------------------------------------------------------------- a declaration ends at the first line not of its form

test("a declaration ends at the first line not of its form, and a later one still reads — MOD-test-document", () => {
  const path = "fixtures/ends-at-non-form.test.mjs";
  const text = [
    "// TST-005",
    "// level: unit",
    "// module: MOD-sample",
    "// guards: A SAMPLE REQUIREMENT",
    "//",
    "// given: should not be read — the declaration already ended above",
    "// input: should not be read",
    "// expect: should not be read",
    "",
    "// TST-006",
    "// level: component",
    "// module: MOD-other",
    "// guards: UC-900",
    "// given: a second precondition",
    "// input: a second input",
    "// expect: a second expected result",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text), [
    {
      id: "TST-005", level: "unit", module: "MOD-sample", guards: ["A SAMPLE REQUIREMENT"],
      given: null, input: null, expect: null, runs: null, phrasings: null, paid: null, path, line: 1,
    },
    {
      id: "TST-006", level: "component", module: "MOD-other", guards: ["UC-900"],
      given: "a second precondition", input: "a second input", expect: "a second expected result",
      runs: null, phrasings: null, paid: null, path, line: 10,
    },
  ]);
});

// ---------------------------------------------------------------- a following line whose value holds ' · '
//
// The reason of this item's rejection in sprint 08 (docs/gates/20261007-1317-development-release-testing-a439.md):
// MOD-test-document's own example (its Data section), with `expect` read as UC-047's own notification text — which
// holds ' · ' — and `runs` after it. Given: that declaration. Input: its text. Expect: `expect` holds the value whole,
// ' · ' included, and `runs` is read, not lost.

test("a following line whose value holds ' · ' does not end the declaration — MOD-test-document", () => {
  const path = "fixtures/middle-dot-value.test.mjs";
  const text = [
    "// TST-014 · level: unit · module: MOD-text-tools",
    "// guards: A FINDING READS LIKE A COMPILER MESSAGE",
    "// given: a finding of kind error on line 4 of UC-007",
    "// input: the finding formatted as text",
    '// expect: the notification "UC-047 waits for your acceptance · akmaier/agent-m"',
    "// runs: 1",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations(path, text), [{
    id: "TST-014",
    level: "unit",
    module: "MOD-text-tools",
    guards: ["A FINDING READS LIKE A COMPILER MESSAGE"],
    given: "a finding of kind error on line 4 of UC-007",
    input: "the finding formatted as text",
    expect: 'the notification "UC-047 waits for your acceptance · akmaier/agent-m"',
    runs: 1,
    phrasings: null,
    paid: null,
    path,
    line: 1,
  }]);
});

// ---------------------------------------------------------------- a file without a declaration

test("a file without a declaration yields none — MOD-test-document", () => {
  const code = [
    "// a plain comment, naming no TST- identifier",
    "import test from \"node:test\";",
    "test(\"something\", () => {});",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations("fixtures/no-declaration.test.mjs", code), []);

  const markdown = [
    "# Not a test document",
    "",
    "Prose with no heading of the form TST-<nnn>.",
    "",
  ].join("\n");
  assert.deepEqual(testDeclarations("fixtures/no-declaration.md", markdown), []);
});
