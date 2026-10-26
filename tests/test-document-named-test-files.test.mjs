// Which files a test runner runs (ITM-1211) — MOD-test-document's isNamedTestFile, as docs/architecture/MOD-test-document.md
// states it under Data and Interfaces: a path is a named test file when it is named as tests are named in its language — such
// as `*.test.mjs`, `test_*.py` or `*_test.go` —, wherever it lies; a helper, a fixture or a Markdown file of manual tests is a
// test file by its folder alone (isTestFile), and no named test file.
// Run: node --test tests/test-document-named-test-files.test.mjs
//
// Module: MOD-test-document
// Guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// Level: unit
//
// Every path read here is a repository path written out below; isNamedTestFile reads no file. Each expected value is read from
// the module file's definition, not from the code. A test lists its paths with the verdict each call gives, so that a failure
// shows every path it got wrong at once; where a test expects a path not to be a named test file, the same call is first shown
// to say yes on a known positive.

import test from "node:test";
import assert from "node:assert/strict";
import { isNamedTestFile, isTestFile } from "../src/test-document/index.mjs";

// The paths, each with the verdict `check` gives it; and each with the verdict it should have.
const verdicts = (check, paths) => paths.map((path) => [path, check(path)]);
const all = (paths, verdict) => paths.map((path) => [path, verdict]);

// Files named as tests are named in JavaScript, Python and Go, under the folder tests and outside every test folder.
const IN_TESTS = ["tests/reader.test.mjs", "tests/reader.spec.ts", "tests/test_reader.py", "tests/reader_test.go"];
const OUTSIDE = ["src/reader.test.mjs", "src/reader.spec.js", "src/test_reader.py", "src/reader_test.py", "pkg/reader_test.go"];

// TST-1211001 · level: unit · module: MOD-test-document
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: files named as tests are named in their language — reader.test.mjs, reader.spec.ts, test_reader.py, reader_test.go under tests/; reader.test.mjs, reader.spec.js, test_reader.py, reader_test.py under src/ and reader_test.go under pkg/
// input: isNamedTestFile of each path
// expect: true for each — the name makes it a file a test runner runs, inside the folder tests and outside it alike
test("isNamedTestFile — a file named as tests are named in its language is one, in tests/ and outside it", () => {
  assert.deepEqual(verdicts(isNamedTestFile, IN_TESTS), all(IN_TESTS, true));
  assert.deepEqual(verdicts(isNamedTestFile, OUTSIDE), all(OUTSIDE, true));
});

// Files under test folders that are tests by their folder alone: helpers, fixtures, and Markdown files of manual tests — one
// of them named test_…, as a data file beside a Python test is.
const HELPERS = ["tests/app-harness.mjs", "tests/jsrun.py", "test/helpers.go", "__tests__/helpers.mjs"];
const FIXTURES = ["tests/fixtures/sample/reader.mjs", "tests/fixtures/graph.json", "tests/fixtures/product/SPEC.md"];
const MANUAL = ["tests/manual-tests.md", "tests/manual/walkthrough.md", "tests/test_test_battery.md"];

// TST-1211002 · level: unit · module: MOD-test-document
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: helpers under test folders — tests/app-harness.mjs, tests/jsrun.py, test/helpers.go, __tests__/helpers.mjs —; fixtures under tests/fixtures — a JavaScript file, a JSON file and a SPEC.md —; and Markdown files of manual tests under tests/, one of them named test_test_battery.md
// input: isNamedTestFile of each path, after the known positive tests/reader.test.mjs; and isTestFile of each path
// expect: isNamedTestFile true for the known positive and false for each of the others; isTestFile true for each of them — they are test files by their folder alone
test("isNamedTestFile — a helper, a fixture and a Markdown file of manual tests are none, though isTestFile holds for each", () => {
  // Known positive: the same call says yes of a named test file.
  assert.equal(isNamedTestFile("tests/reader.test.mjs"), true);
  const others = [...HELPERS, ...FIXTURES, ...MANUAL];
  assert.deepEqual(verdicts(isNamedTestFile, others), all(others, false));
  // Counter-proof: each is a test file by its folder.
  assert.deepEqual(verdicts(isTestFile, others), all(others, true));
});

// Code files and names that only hold the word test, outside every test folder.
const NEAR = ["src/reader.mjs", "src/contest.js", "src/testing/reader.mjs", "src/test.mjs", "pkg/test.go", "README.md"];

// TST-1211003 · level: unit · module: MOD-test-document
// guards: THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE; UC-027
// given: a code file not named as a test — src/reader.mjs —; names that only hold the word test — src/contest.js, a file under the folder src/testing, src/test.mjs, pkg/test.go —; and README.md
// input: isNamedTestFile of each path, after the known positive src/reader.test.mjs
// expect: true for the known positive; false for each of the others
test("isNamedTestFile — a code file not named as a test, and a name that only holds the word test, are none", () => {
  assert.equal(isNamedTestFile("src/reader.test.mjs"), true);
  assert.deepEqual(verdicts(isNamedTestFile, NEAR), all(NEAR, false));
});
