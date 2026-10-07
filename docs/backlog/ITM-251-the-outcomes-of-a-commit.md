---
id: ITM-251
title: The outcomes of a commit
level: module
realises:
  - UC-013
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
modules:
  - MOD-result-records
builds_on:
tests:
  - unit
origin:
  - UC-013
---
# ITM-251 The outcomes of a commit

**REGISTER**

## Outcome

MOD-result-records' `Outcome`, `resultSchema`, `resultsAt`, `flakyTests` and `rateComparison`, as its file states them,
in `src/result-records/`: the schemas of the result record and of the counter-proof record, and what the records of the
branch `test-results` say about one commit — its outcomes per level, a level without a record of the commit `not run`,
never `passed`, and a record marked `uncommitted` left out —, the deterministic tests that both passed and failed on it,
and each model-dependent test's rate beside the last release's. The release panel and the release test report read a
candidate's run by them (MOD-release-evidence). Reading a JUnit report, appending a record, a test's history and the
strategies of the job kinds are UC-026's and UC-028's and not part of this item. Nothing else of the module is part of
this item.

## Acceptance

- Unit tests that name MOD-result-records state, before the code exists, on a fixture branch `test-results`: a commit's
  outcomes per level with their counts; a level without a record `not run`; a record marked `uncommitted` left out; a
  flaky test with both its records; a rate lower than the last release's marked worse, and no comparison without a last
  release.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/result-records/` and the tests that name MOD-result-records change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS
  MODULES`).
