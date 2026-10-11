---
id: ITM-373
title: The system and release tests of UC-010
level: system
realises:
  - UC-010
modules:
  - MOD-workflow-entries
  - MOD-runtimes
  - MOD-job-ledger
  - MOD-settings-pages
  - MOD-repository-hosts
  - MOD-endpoint-calls
builds_on:
  - ITM-312
  - ITM-311
  - ITM-316
  - ITM-317
  - ITM-322
  - ITM-365
  - ITM-351
  - ITM-366
  - ITM-363
tests:
  - system
  - release
origin:
  - UC-010
---
# ITM-373 The system and release tests of UC-010

**REGISTER**

## Outcome

UC-010 checked as a whole, once the items it builds on and the change between jobs by which the dashboard reaches the
use case's prompt page (ITM-363) are merged: the job workflow installed and its secrets named on the settings page
(ITM-351); a `change-use-case` job started from the dashboard on the CI route, and one from the server's own page; the
entry run in Node in a checkout of a fixture product with a fixture endpoint; its artifacts committed open with its end
record; 3a, a missing secret. Release tests, one or more for each requirement UC-010 realises. The result that equals
the current artifacts (4a) and the release test of `A JOB RECORD STARTS NO CI RUN`, which needs MOD-test-schedule's
`ciConfiguration` (UC-027), are not part of this item. The tests are written by a Developer who implemented none of the
items they build on (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-010 realises but the one named above has a release test, and the system test walks the main
  flow and each alternative flow named; each test states its input, precondition and expected result where they can be
  read without running it, and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in
  the pull request, which names the author.
- Where the system and UC-010 disagree, the test follows UC-010 and the disagreement is named as a finding.
- Only new test files change.
