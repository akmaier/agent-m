// Which files are test files (ITM-380) — MOD-test-document's isTestFile, as docs/architecture/MOD-test-document.md states it
// under Data and Interfaces: a test file is a file under a folder named `test`, `tests` or `__tests__`, or a file named as
// tests are named in its language — such as `*.test.mjs`, `test_*.py` or `*_test.go` —; a Markdown file under such a folder
// holds manual tests. isTestFile(path) tells whether a path is one. Reading the declarations of a test file is
// testDeclarations', and is not tested here.
// Run: node --test tests/test-document-test-files.test.mjs
//
// Module: MOD-test-document
// Guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; DON'T REPEAT YOURSELF; UC-026
// Level: unit
//
// Every path read here is a repository path written out below; isTestFile reads no file. Each expected value is read from the
// module file's definition of a test file, not from the code. A test lists its paths with the verdict isTestFile gives each, so
// that a failure shows every path it got wrong at once. Each test names the requirements it guards and states its input and
// its expected result before it runs (given / input / expect); where a test expects a path not to be a test file, the same
// call is first shown to say yes on a known positive. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { isTestFile } from "../src/test-document/index.mjs";

// The paths, each with the verdict isTestFile gives it; and each with the verdict it should have.
const verdicts = (paths) => paths.map((path) => [path, isTestFile(path)]);
const all = (paths, verdict) => paths.map((path) => [path, verdict]);

// ---------------------------------------------------------------- a file under a folder named test, tests or __tests__

// Files called helpers — a name that is no test's in any language — in JavaScript, Python and Go, under each of the three folders.
const IN_A_FOLDER = ["tests", "test", "__tests__"].flatMap((folder) =>
  ["helpers.mjs", "helpers.py", "helpers.go"].map((file) => `${folder}/${file}`));
// And a test folder below another folder, a file deep under one, and one folder inside another.
const NESTED = [
  "src/spec-document/tests/helpers.mjs",
  "tests/fixtures/sample/deep/helpers.py",
  "pkg/reader/test/helpers.go",
  "app/__tests__/unit/helpers.mjs",
];

// TST-473087 · level: unit · module: MOD-test-document
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; DON'T REPEAT YOURSELF; UC-026
// given: files called helpers — a name that is no test's — in JavaScript (.mjs), Python (.py) and Go (.go), each under each of the folders tests, test and __tests__; and a JavaScript file under a folder named tests inside src/spec-document, a Python file four folders deep under tests, a Go file under a folder named test inside pkg/reader, and a JavaScript file under __tests__/unit inside app
// input: isTestFile of each path
// expect: true for each — the folder alone makes it a test file, whatever its language and however deep the folder or the file lies
test("isTestFile — a file under a folder named test, tests or __tests__ is a test file, in JavaScript, Python and Go", () => {
  assert.deepEqual(verdicts(IN_A_FOLDER), all(IN_A_FOLDER, true));
  assert.deepEqual(verdicts(NESTED), all(NESTED, true));
});

// ---------------------------------------------------------------- a file named as tests are named in its language

const BY_NAME = [
  "src/reader.test.mjs", "src/reader.test.js", "src/reader.spec.ts", // JavaScript
  "src/test_reader.py", "src/reader_test.py",                          // Python
  "pkg/reader_test.go",                                                // Go
];

// TST-473088 · level: unit · module: MOD-test-document
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; DON'T REPEAT YOURSELF; UC-026
// given: files outside every test folder, named as tests are named in their language: in JavaScript reader.test.mjs, reader.test.js and reader.spec.ts; in Python test_reader.py and reader_test.py; in Go reader_test.go
// input: isTestFile of each path
// expect: true for each — the name alone makes it a test file
test("isTestFile — a file named as tests are named in its language is a test file, in JavaScript, Python and Go", () => {
  assert.deepEqual(verdicts(BY_NAME), all(BY_NAME, true));
});

// ---------------------------------------------------------------- a Markdown file under a test folder

const MANUAL = ["tests/manual-tests.md", "tests/manual/walkthrough.md", "test/manual.md", "__tests__/manual.md"];

// TST-473089 · level: unit · module: MOD-test-document
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; DON'T REPEAT YOURSELF; UC-026
// given: Markdown files under the folder tests — one directly under it, one in a folder inside it — and one each under test and __tests__
// input: isTestFile of each path
// expect: true for each — a Markdown file under such a folder holds manual tests
test("isTestFile — a Markdown file under a test folder is a test file: it holds manual tests", () => {
  assert.deepEqual(verdicts(MANUAL), all(MANUAL, true));
});

// ---------------------------------------------------------------- what is no test file

// Code files that no folder and no name makes a test, in JavaScript, Python and Go.
const CODE = ["src/reader.mjs", "src/reader.py", "pkg/reader.go"];
// Documents outside every test folder.
const DOCUMENTS = ["README.md", "SPEC.md", "docs/use-cases/UC-026-generate-a-multi-level-test-battery.md", "docs/manual-tests.md"];
// Names that only hold the word test: a file whose name ends in it, a folder whose name begins with it, a folder whose name ends
// in it, a file called tests rather than a folder, and files called test, which lack the `.test.` and the `_test` of the names of
// their language.
const NEAR = ["src/contest.js", "src/testing/reader.mjs", "src/latest/reader.py", "pkg/tests", "src/test.mjs", "pkg/test.go"];

// TST-473090 · level: unit · module: MOD-test-document
// guards: A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS; DON'T REPEAT YOURSELF; UC-026
// given: code files outside such folders and not named as tests — reader.mjs, reader.py, reader.go —; documents outside such folders — README.md, SPEC.md, a use case and docs/manual-tests.md —; and names that only hold the word test: the file src/contest.js, the folder src/testing, the folder src/latest, pkg/tests, a file called tests and not a folder, and the files src/test.mjs and pkg/test.go
// input: isTestFile of each path; and, to show that the same call says yes where it should, of tests/reader.test.mjs
// expect: true for the known positive; false for each of the others
test("isTestFile — a code file and a document outside such folders, and a name that only holds the word test, are no test files", () => {
  // Known positive: the same call says yes of a test file.
  assert.equal(isTestFile("tests/reader.test.mjs"), true);
  assert.deepEqual(verdicts(CODE), all(CODE, false));
  assert.deepEqual(verdicts(DOCUMENTS), all(DOCUMENTS, false));
  assert.deepEqual(verdicts(NEAR), all(NEAR, false));
});
