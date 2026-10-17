---
id: ITM-751
title: A test's history across commits and releases
level: module
realises:
  - UC-029
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - EVERY TEST RUN LEAVES A RESULT RECORD
modules:
  - MOD-result-records
builds_on:
  - ITM-251
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-751 A test's history across commits and releases

**REGISTER**

## Outcome

MOD-result-records' `testHistory(results, test, tags)`, in `read.mjs`, as its file states it:
- one mark per commit on which the test ran, a flaky commit marked as such;
- one row per release tag with its outcome, and a model-dependent test's rate with its runs.

UC-029 step 5 draws it. `src/result-records/index.mjs` names it as not built, and ITM-635 leaves it out.

## Acceptance

- On a fixture branch `test-results`:
  - a test with records on three commits gives three marks;
  - a commit with a passing and a failing record is marked flaky;
  - a release tag with no record of the test reads `not run`;
  - a model-dependent test gives `17 of 20` on its release row;
  - a record marked `uncommitted` is left out.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/result-records/` and the tests that name MOD-result-records change.
