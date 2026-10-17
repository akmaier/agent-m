---
id: ITM-851
title: A proposed commit test that reaches a paid service is an error
level: module
realises:
  - UC-026
  - COMMIT TESTS CALL NO PAID SERVICE
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - A FINDING READS LIKE A COMPILER MESSAGE
modules:
  - MOD-result-records
builds_on:
  - ITM-753
tests:
  - unit
origin:
  - developer-sonnet-g's stop of ITM-753 in team 2's sprint 80, 2026-10-18
---
# ITM-851 A proposed commit test that reaches a paid service is an error

**REGISTER**

## Outcome

The check `test-proposals` of `resultStrategies`, for the kind `propose-tests`, as MOD-result-records' file states it
(UC-026 step 6): an error finding for a case of a level that runs on a commit or pull request and reaches a service
`paidServices` marks paid.

The item waits for akmaier's decision on two inputs: a field of the `propose-tests` answer that names the services a
case reaches, and a source from which MOD-result-records reads which levels run on a commit or pull request. It cannot
be settled from the accepted texts: the answer schema (`src/job-catalogue/kinds/propose-tests/answer.schema.json`) has
no such field — its `response` marks a case that does not call the service but uses a recorded or constructed answer
instead —, and the schedule is MOD-test-schedule's, which MOD-result-records' Uses do not name and `JobContext` does not
carry.

## Acceptance

- On fixture proposals, the tests state the error with its requirement's name for a commit-level case reaching a paid
  service, and no finding for the same case at a level that runs only nightly or on a release.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/result-records/` and the tests that name MOD-result-records change.
