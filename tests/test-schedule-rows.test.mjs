// The test files of a row (ITM-1213) — MOD-test-schedule's testsOfRow(row, files), as docs/architecture/MOD-test-schedule.md
// states it under Data and Interfaces: the files that run are the committed files named as tests are named in their language
// (MOD-test-document's isNamedTestFile), a helper, a fixture or a manual test in Markdown none of them; a file's level is its
// header's `Level:`, or else the one level all its declarations share; the row of a level runs the files of that level none of
// whose declarations names a paid service, the row `paid` every file one of whose declarations does; a named test file whose
// level cannot be read is in no row, and is named in `unreadable`. Pure, in the order of the paths; `UnknownRow` for a row the
// schema does not name.
// Run: node --test tests/test-schedule-rows.test.mjs
//
// Module: MOD-test-schedule
// Guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; COMMIT TESTS CALL NO PAID SERVICE; UC-027
// Level: unit
//
// Every file is a path and a text written out below; testsOfRow reads no file. Each test states its input and its expected
// result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { testsOfRow } from "../src/test-schedule/index.mjs";

// The comment lines of one declaration of a test case, in the marker given, and the test case's first line.
const declaration = (marker, id, level, extra = []) => [
  `${marker} TST-${id} · level: ${level} · module: MOD-reader`,
  `${marker} guards: A RULE OF THE READER`, `${marker} given: a text`, `${marker} input: read(text)`, `${marker} expect: its words`,
  ...extra.map((line) => `${marker} ${line}`),
  marker === "#" ? `def test_${id}():` : `test("case ${id}", () => {});`,
].join("\n");
const header = (marker, level) => [`${marker} Module: MOD-reader`, `${marker} Guards: A RULE OF THE READER`, `${marker} Level: ${level}`].join("\n");

// The committed files of a fixture product, given out of the order of their paths.
const FILES = [
  // A unit file: no Level: line, every declaration of level unit.
  { path: "tests/reader-unit.test.mjs", text: `${declaration("//", 1, "unit")}\n\n${declaration("//", 2, "unit")}\n` },
  // A file whose header says Level: component, whose one declaration says unit — the header holds.
  { path: "tests/reader-flow.test.mjs", text: `${header("//", "component")}\n\n${declaration("//", 3, "unit")}\n` },
  // A file of level system, one of whose declarations calls a paid service.
  { path: "tests/test_oracle.py", text: `${header("#", "system")}\n\n${declaration("#", 4, "system")}\n\n`
      + `${declaration("#", 5, "system", ["paid: oracle-endpoint"])}\n` },
  // A file of level system that calls none.
  { path: "tests/test_end_to_end.py", text: `${header("#", "system")}\n\n${declaration("#", 6, "system")}\n` },
  // A file of level release, outside the folder tests.
  { path: "src/reader/release_test.go", text: `${header("//", "release")}\n\n${declaration("//", 7, "release")}\n` },
  // A helper whose header names the level unit, and a fixture: test files by their folder alone.
  { path: "tests/reader-harness.mjs", text: `${header("//", "unit")}\nexport const harness = {};\n` },
  { path: "tests/fixtures/reader/sample.mjs", text: `${declaration("//", 8, "unit")}\n` },
  // A manual test in Markdown, of level user.
  { path: "tests/manual-tests.md", text: "### TST-9 Read a page\nlevel: user\nmodule: system\nguards: A RULE OF THE READER\n" },
  // Named test files whose level cannot be read: declarations of two levels, and neither a header nor a declaration.
  { path: "tests/reader-mixed.test.mjs", text: `${declaration("//", 10, "unit")}\n\n${declaration("//", 11, "system")}\n` },
  { path: "tests/reader-bare.test.mjs", text: `test("reads", () => {});\n` },
];

// TST-1213004 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; COMMIT TESTS CALL NO PAID SERVICE; UC-027
// given: FILES — a unit file without a Level: line; a file whose header says Level: component while its declaration says unit; tests/test_oracle.py of level system, one of whose declarations names the paid service oracle-endpoint; tests/test_end_to_end.py of level system naming none; src/reader/release_test.go of level release; a helper whose header says Level: unit; a fixture under tests/fixtures with a unit declaration; a Markdown file of a manual test of level user; a file with declarations of the levels unit and system; and a file with neither a header nor a declaration — given out of the order of their paths
// input: testsOfRow(row, FILES) for each of the six rows unit, component, system, paid, release and user
// expect: unit runs tests/reader-unit.test.mjs; component tests/reader-flow.test.mjs; system tests/test_end_to_end.py only; paid tests/test_oracle.py; release src/reader/release_test.go; user none; and for every row unreadable is tests/reader-bare.test.mjs and tests/reader-mixed.test.mjs, in that order
test("testsOfRow — the named test files of each row, by their level, the paid ones in the row paid", () => {
  const unreadable = ["tests/reader-bare.test.mjs", "tests/reader-mixed.test.mjs"];
  const expected = {
    unit: ["tests/reader-unit.test.mjs"],
    component: ["tests/reader-flow.test.mjs"],
    system: ["tests/test_end_to_end.py"],
    paid: ["tests/test_oracle.py"],
    release: ["src/reader/release_test.go"],
    user: [],
  };
  for (const [row, files] of Object.entries(expected)) assert.deepEqual(testsOfRow(row, FILES), { files, unreadable }, row);
});

// TST-1213005 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: three unit files given in the order tests/c.test.mjs, src/a/b_test.go, tests/a.test.mjs
// input: testsOfRow("unit", files)
// expect: the files in the order of their paths — src/a/b_test.go, tests/a.test.mjs, tests/c.test.mjs —, none unreadable; the list given is unchanged
test("testsOfRow — the files in the order of their paths, the input unchanged", () => {
  const unit = (path) => ({ path, text: `${header("//", "unit")}\n` });
  const files = [unit("tests/c.test.mjs"), unit("src/a/b_test.go"), unit("tests/a.test.mjs")];
  const before = JSON.stringify(files);
  assert.deepEqual(testsOfRow("unit", files), { files: ["src/a/b_test.go", "tests/a.test.mjs", "tests/c.test.mjs"], unreadable: [] });
  assert.equal(JSON.stringify(files), before);
});

// TST-1213006 · level: unit · module: MOD-test-schedule
// guards: THE TEST SCHEDULE IS DECLARED PER PRODUCT; UC-027
// given: FILES, and the rows integration and Unit, which the schema's column Row does not name
// input: testsOfRow("integration", FILES) and testsOfRow("Unit", FILES), after the known positive testsOfRow("unit", FILES)
// expect: the known positive returns; each of the other two throws an error named UnknownRow
test("testsOfRow — a row the schema does not name is UnknownRow", () => {
  assert.doesNotThrow(() => testsOfRow("unit", FILES));
  for (const row of ["integration", "Unit"]) assert.throws(() => testsOfRow(row, FILES), { name: "UnknownRow" }, row);
});
