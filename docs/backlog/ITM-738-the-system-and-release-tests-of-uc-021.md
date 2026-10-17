---
id: ITM-738
title: The system and release tests of UC-021
level: system
realises:
  - UC-021
modules:
  - MOD-review-pages
  - MOD-artifact-edits
  - MOD-group-document
  - MOD-trace-pages
builds_on:
  - ITM-726
  - ITM-727
  - ITM-737
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-738 The system and release tests of UC-021

**REGISTER**

## Outcome

UC-021 checked as a whole through the dashboard, once ITM-722, ITM-723, ITM-726, ITM-727 and ITM-737 are merged: a system test that walks the main flow and the
alternative flows 1a, 1b, 2a, 2b, 2c, 3a, 3b, 3c, 5a, 5b and 5c, with fixture participants and a fixture repository host; and release tests, one or more for each
requirement UC-021 realises whose check is a test. The tests are written by a Developer who implemented none of ITM-722, ITM-723, ITM-726, ITM-727 and ITM-737
(`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-021 realises whose check is a test has a release test, and the system test walks the main flow and
  each alternative flow named; each test states its input, precondition and expected result where they can be read
  without running it, and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the pages and UC-021 disagree, the test follows UC-021 and the disagreement is named as a finding.
- Only new test files change.
