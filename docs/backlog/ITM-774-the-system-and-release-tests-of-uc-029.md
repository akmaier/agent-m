---
id: ITM-774
title: The system and release tests of UC-029
level: system
realises:
  - UC-029
modules:
  - MOD-trace-pages
  - MOD-result-records
builds_on:
  - ITM-767
  - ITM-769
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-774 The system and release tests of UC-029

**REGISTER**

## Outcome

UC-029 checked as a whole through `trace/tests` on a fixture product with a fixture `test-results` branch: the tree,
each grouping and filter, an opened test with its history, two releases compared, and the alternative flows 1a, 1b, 2a,
5a, 5b. Release tests, one or more for each requirement UC-029 realises.

## Acceptance

- Every requirement UC-029 realises has a release test, and the system test walks the main flow and each alternative flow
  named; each test states its input, precondition and expected result where they can be read without running it, and
  names what it guards.
- It is written by a Developer who implemented none of the items it builds on (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`); each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is
  recorded in the pull request, which names the author.
- Where the page or a module and UC-029 disagree, the test follows UC-029 and the disagreement is named as a finding.
- Only new test files change.
