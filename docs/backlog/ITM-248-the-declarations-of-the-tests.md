---
id: ITM-248
title: The declarations of the tests
level: module
realises:
  - UC-013
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
modules:
  - MOD-test-document
builds_on:
tests:
  - unit
origin:
  - UC-013
---
# ITM-248 The declarations of the tests

**REGISTER**

## Outcome

MOD-test-document's `TestDeclaration` and `testDeclarations`, as its file states them, in `src/test-document/`: every
test declaration of a test file, in the comment marker of its language or, for a test of level `user`, under a heading
`### TST-<nnn>` of a Markdown file, with its identifier, level, module, what it guards, its precondition, input and
expected result, and its runs, phrasings and paid service where it has them; a missing key is read as `null`. The release
test report lists the tests of a release candidate by them (MOD-release-evidence). `testFindings` is not part of this
item. Nothing else of the module is part of this item.

## Acceptance

- Unit tests that name MOD-test-document state, before the code exists: a declaration in each comment marker the file
  names and one under a Markdown heading, each read with every key; a declaration missing a key, read with that key
  `null`; a declaration ending at the first line not of its form; and a file without a declaration, which yields none.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/test-document/` and the tests that name MOD-test-document change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS
  MODULES`).
