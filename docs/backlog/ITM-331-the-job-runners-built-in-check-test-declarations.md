---
id: ITM-331
title: The job runner's built-in check test-declarations
level: module
realises:
  - UC-026
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - EVERY TEST HAS ONE LEVEL
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
modules:
  - MOD-job-runner
builds_on:
  - ITM-304
tests:
  - unit
origin:
  - MOD-job-runner, Data: the built-in strategies
---
# ITM-331 The job runner's built-in check test-declarations

**REGISTER**

## Outcome

The check `test-declarations` in `builtins.mjs`, as MOD-job-runner's file states it: `testFindings` (ITM-304) on every
declaration in the files that the branch the coding participant reports adds or changes, read with MOD-repository-hosts'
`readSnapshot` through the product's host and MOD-test-document's `testDeclarations`. `write-tests` runs it.

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists, over a fixture host: a reported branch adding a
  test without an expected result yields that finding; a declaration in an unchanged file is not checked; a complete
  one passes.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
