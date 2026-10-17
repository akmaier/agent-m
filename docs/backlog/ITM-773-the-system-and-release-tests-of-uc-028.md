---
id: ITM-773
title: The system and release tests of UC-028
level: system
realises:
  - UC-028
modules:
  - MOD-test-pages
  - MOD-result-records
builds_on:
  - ITM-761
  - ITM-762
  - ITM-750
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-773 The system and release tests of UC-028

**REGISTER**

## Outcome

UC-028 checked as a whole through the page `runs`: a commit picked, its levels and tests read from a fixture
`test-results` branch, a failed test opened, *Run on this commit* queuing a `run-tests` job whose fixture route adds a
record, a flaky test after it, and a release candidate's user-level checklist. Release tests, one or more for each
requirement UC-028 realises, among them `tests/test_result_records.py`, which SPEC.md names for `EVERY TEST RUN LEAVES A
RESULT RECORD`, `TEST RESULTS ARE KEPT IN THE REPOSITORY` and `A RESULT RECORD IS NEVER REWRITTEN` and the repository
lacks, with its cases in a Markdown data file beside it.

## Acceptance

- Every requirement UC-028 realises has a release test, and the system test walks the main flow and each alternative flow
  named; each test states its input, precondition and expected result where they can be read without running it, and
  names what it guards.
- It is written by a Developer who implemented none of the items it builds on (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`); each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is
  recorded in the pull request, which names the author.
- Where the page or a module and UC-028 disagree, the test follows UC-028 and the disagreement is named as a finding.
- Only new test files change.
