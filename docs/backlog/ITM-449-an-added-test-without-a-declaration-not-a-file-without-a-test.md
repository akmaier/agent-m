---
id: ITM-449
title: An added test without a declaration, not a file without a test
level: module
realises:
  - UC-026
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
modules:
  - MOD-job-runner
builds_on:
  - ITM-386
tests:
  - unit
origin:
  - MOD-job-runner, Data: the check test-declarations
  - UC-026
---
# ITM-449 An added test without a declaration, not a file without a test

**REGISTER**

## Outcome

The check `test-declarations` in MOD-job-runner's `builtins.mjs`, as its file states it. Today (ITM-386) it reports every
file the reported branch adds that `isTestFile` calls a test file and that declares none, so a fixture or a helper added
under `tests/` — `tests/fixtures/data.json`, `tests/helper.mjs` — is sent back, and its participant cannot fix it. The
accepted text asks for an added test without a declaration — a test, not a file: a file the branch adds that holds a test
case and declares none is reported, as today; a file that holds no test case — a fixture, data, a helper — has nothing to
declare and is not. How the check tells a test case in a file, by its language's form of one, is named in the pull
request. MOD-test-document's `isTestFile` stays as it is.

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists: a fixture file and a helper module the branch adds
  under `tests/` give no finding; an added test file that holds a test case and no declaration is still reported, as the
  case of #341 asserts; an added test case with its declaration passes.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
