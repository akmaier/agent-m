---
id: ITM-741
title: The system and release tests of UC-025
level: system
realises:
  - UC-025
modules:
  - MOD-trace-pages
  - MOD-trace-graph
builds_on:
  - ITM-210
  - ITM-721
  - ITM-735
  - ITM-736
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-741 The system and release tests of UC-025

**REGISTER**

## Outcome

UC-025 checked as a whole through the dashboard, once ITM-692, ITM-720, ITM-721, ITM-210, ITM-735 and ITM-736 are merged: a system test that walks the main flow and the
alternative flows 2a, 2b, 3a, 4a, 4b and 5a, with fixture participants and a fixture repository host; and release tests, one or more for each
requirement UC-025 realises whose check is a test. The tests are written by a Developer who implemented none of ITM-692, ITM-720, ITM-721, ITM-210, ITM-735 and ITM-736
(`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-025 realises whose check is a test has a release test, and the system test walks the main flow and
  each alternative flow named; each test states its input, precondition and expected result where they can be read
  without running it, and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the pages and UC-025 disagree, the test follows UC-025 and the disagreement is named as a finding.
- Only new test files change.
