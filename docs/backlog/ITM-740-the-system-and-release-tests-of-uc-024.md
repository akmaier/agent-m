---
id: ITM-740
title: The system and release tests of UC-024
level: system
realises:
  - UC-024
modules:
  - MOD-implementation-pages
  - MOD-runtimes
  - MOD-repository-hosts
  - MOD-product-process
builds_on:
  - ITM-734
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-740 The system and release tests of UC-024

**REGISTER**

## Outcome

UC-024 checked as a whole through the dashboard, once ITM-748 and ITM-732 to ITM-734 are merged: a system test that walks the main flow and the
alternative flows 1b, 1c, 2a, 2b, 3a, 5a, 5b, 7a, 7b, 8a, 9b, 11a and 12a, with fixture participants and a fixture repository host; and release tests, one or more for each
requirement UC-024 realises whose check is a test. The tests are written by a Developer who implemented none of ITM-748 and ITM-732 to ITM-734
(`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-024 realises whose check is a test has a release test, and the system test walks the main flow and
  each alternative flow named; each test states its input, precondition and expected result where they can be read
  without running it, and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the pages and UC-024 disagree, the test follows UC-024 and the disagreement is named as a finding.
- Only new test files change.
