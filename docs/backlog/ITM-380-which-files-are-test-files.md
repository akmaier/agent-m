---
id: ITM-380
title: Which files are test files
level: module
realises:
  - UC-026
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - DON'T REPEAT YOURSELF
modules:
  - MOD-test-document
builds_on:
  - ITM-304
tests:
  - unit
origin:
  - UC-026
  - MOD-test-document, Data: a test file
---
# ITM-380 Which files are test files

**REGISTER**

## Outcome

MOD-test-document's `isTestFile(path)`, as its file states it: a file under a folder named `test`, `tests` or
`__tests__`, or named as tests are named in its language — `*.test.mjs`, `test_*.py`, `*_test.go` and the like —; a
Markdown file under such a folder holds manual tests. MOD-trace-graph (ITM-382) and the check `test-declarations`
(ITM-386) call it, so that neither keeps its own rule.

## Acceptance

- Unit tests that name MOD-test-document state, before the code exists: test files by folder and by name in JavaScript,
  Python and Go; a Markdown file under `tests/` as a test file; a code file and a document outside such folders not.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/test-document/` and the tests that name MOD-test-document change.
