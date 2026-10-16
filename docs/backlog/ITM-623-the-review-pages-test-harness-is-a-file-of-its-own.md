---
id: ITM-623
title: The review pages' test harness is a file of its own
level: module
realises:
  - UC-008
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - ITM-612's gate (docs/gates/20261016-2328-development-release-testing-f290.md)
---
# ITM-623 The review pages' test harness is a file of its own

**REGISTER**

## Outcome

`tests/review-pages-use-cases.test.mjs` holds both its own sixteen tests and the harness that ten other test files and two
helpers import, among them `tests/review-pages-edit-requirement.test.mjs` and `tests/system-uc-006-approve-spec-change.test.mjs`.
So each importer runs those sixteen tests again. The harness moves to a helper of its own under `tests/`, whose header
names MOD-review-pages. The test file and every importer import the helper.

It is a refactoring of the tests: no expected result changes. The golden master is the list of the test names and
results before and after, less the repeated runs.

## Acceptance

- No test file imports another test file for its harness.
- Every test passes with the same expected values, and each runs once per file that declares it.
