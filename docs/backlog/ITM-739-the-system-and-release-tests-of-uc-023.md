---
id: ITM-739
title: The system and release tests of UC-023
level: system
realises:
  - UC-023
modules:
  - MOD-review-pages
  - MOD-approvals
  - MOD-trace-graph
  - MOD-job-runner
builds_on:
  - ITM-724
  - ITM-729
  - ITM-730
  - ITM-731
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-739 The system and release tests of UC-023

**REGISTER**

## Outcome

UC-023 checked as a whole through the dashboard, once ITM-724 and ITM-728 to ITM-731 are merged: a system test that walks the main flow and the
alternative flows 1b, 2a, 4a, 4b, 4c and 5a, with fixture participants and a fixture repository host; and release tests, one or more for each
requirement UC-023 realises whose check is a test. The tests are written by a Developer who implemented none of ITM-724 and ITM-728 to ITM-731
(`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-023 realises whose check is a test has a release test, and the system test walks the main flow and
  each alternative flow named; each test states its input, precondition and expected result where they can be read
  without running it, and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the pages and UC-023 disagree, the test follows UC-023 and the disagreement is named as a finding.
- Only new test files change.
