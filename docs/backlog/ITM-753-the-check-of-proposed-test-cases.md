---
id: ITM-753
title: The check of proposed test cases against the existing tests
level: module
realises:
  - UC-026
  - TEST GENERATION SEES THE EXISTING TESTS
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - A FINDING READS LIKE A COMPILER MESSAGE
modules:
  - MOD-result-records
builds_on:
  - ITM-752
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-753 The check of proposed test cases against the existing tests

**REGISTER**

## Outcome

The check `test-proposals` of `resultStrategies`, for the kind `propose-tests`, as MOD-result-records' file states
its first use (UC-026 step 6). It runs without a model:
- **errors** for a case without an expected result, a model-dependent case judged on a single run, and a case that
  guards nothing;
- **duplicates**: a case with the same guarded identifier, input and expected result as an existing test is classed a
  duplicate, whatever the participant said.

Its use for `write-tests` is ITM-754. The error for a case of a level that runs on a commit or pull request and reaches
a service `paidServices` marks paid is ITM-851: the answer of `propose-tests` names no service a case reaches, and
MOD-result-records reads no schedule that says which levels run on a commit or pull request.

## Acceptance

- On fixture proposals and the parts of ITM-752, the tests state each error with its requirement's name, and the
  reclassification of a case its participant called *new*.
- A clean proposal gives no finding.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/result-records/` and the tests that name MOD-result-records change.
