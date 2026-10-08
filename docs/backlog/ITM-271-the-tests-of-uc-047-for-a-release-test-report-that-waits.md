---
id: ITM-271
title: The tests of UC-047 for a release test report that waits
level: system
realises:
  - UC-047
  - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
modules:
  - MOD-notifications
  - MOD-progress-measures
  - MOD-release-evidence
builds_on:
  - ITM-239
tests:
  - system
  - release
origin:
  - UC-047
---
# ITM-271 The tests of UC-047 for a release test report that waits

**REGISTER**

## Outcome

UC-047's steps 2 to 4 for a release test report, checked once ITM-239 is merged, through the dashboard's pages as they
reach MOD-notifications, reached the way ITM-238's tests reach them: in the instance's repository, a release candidate's
tag `v<version>-rc.<N>` and the record of its complete run, a job of kind `run-tests`. The report that waits once that run
has ended as done is notified once, as `release-v<version>` with the repository's path, and the notification carries the
address of MOD-test-pages' route `release` for that repository, as MOD-notifications' file states it; the panel at that
address is UC-013's (ITM-256) and not part of this item. The tests are written by a Developer who implemented none of
UC-047 nor ITM-239, ITM-247 and ITM-252 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- A system test walks UC-047's steps 2 to 4 for a release test report, and a release test guards `A PERSON IS TOLD WHAT
  WAITS FOR THEIR ACCEPTANCE` for it: nothing notified while the candidate's run has not ended; one notification once it
  has ended as done, naming the report and the repository and carrying the address of the route `release`; none at the
  next check while it still waits; none once the report is accepted, its report file and release tag written. Each test
  states its input, precondition and expected result where they can be read without running it, and names what it
  guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the pages and UC-047 disagree, the test follows UC-047 and the disagreement is named as a finding.
- Only new test files change.
