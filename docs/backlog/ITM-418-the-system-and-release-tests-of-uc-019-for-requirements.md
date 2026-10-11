---
id: ITM-418
title: The system and release tests of UC-019 for requirements
level: system
realises:
  - UC-019
modules:
  - MOD-review-pages
  - MOD-trace-pages
  - MOD-spec-changes
  - MOD-source-register
builds_on:
  - ITM-398
  - ITM-399
tests:
  - system
  - release
origin:
  - UC-019
---
# ITM-418 The system and release tests of UC-019 for requirements

**REGISTER**

## Outcome

UC-019 checked for requirements, once ITM-398 and ITM-399 and the change between jobs by which the dashboard reaches
their routes are merged: a system test that walks the main flow for one requirement and for a group of requirements, and
the alternative flows 4b, 8a and 9a, with GitHub replaced by a fixture server and the participant by a fixture endpoint;
and release tests for each requirement UC-019 realises that a change of requirements reaches, `THE PERSON WHO PROMPTS IS
A SOURCE` among them. The tests are written by a Developer who implemented none of the items they build on (`RELEASE
TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-019 realises for requirements has a release test, and the system test walks the main flow and
  each alternative flow named; each test states its input, precondition and expected result where they can be read
  without running it, and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the pages and UC-019 disagree, the test follows UC-019 and the disagreement is named as a finding.
- Only new test files change.
