---
id: ITM-448
title: The system and release tests of UC-022
level: system
realises:
  - UC-022
modules:
  - MOD-review-pages
  - MOD-job-runner
  - MOD-reuse-facts
  - MOD-approvals
  - MOD-artifact-edits
builds_on:
  - ITM-441
  - ITM-443
  - ITM-444
tests:
  - system
  - release
origin:
  - UC-022
---
# ITM-448 The system and release tests of UC-022

**REGISTER**

## Outcome

UC-022 checked as a whole through the architecture's review pages, once ITM-440 to ITM-443 and the change between jobs
by which the dashboard reaches MOD-review-pages' routes `decision`, `decision/all` and `decision/draft` are merged: a
system test that walks the main flow and the alternative flows 1a, 1b, 1c, 2a, 3a, 4a, 5a, 6a, 6b, 6c, 7a, 7b, 7c, 7d
and 10a, with a fixture drafter and a fixture reviewer of another model, fixture registries and a fixture repository
host; and release tests, one or more for each requirement UC-022 realises whose check is a test, each requirement the
SPEC leaves to review named as such (`AN ARCHITECTURE IS CHECKED BY REVIEW, NOT BY TESTS`). Alternative flow 8a waits
for a text. The tests are written by a Developer who implemented none of ITM-434 to ITM-444, nor that change (`RELEASE
TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-022 realises whose check is a test has a release test, every one left to review is named, and the
  system test walks the main flow and each alternative flow named; each test states its input, precondition and expected
  result where they can be read without running it, and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the architecture's pages and UC-022 disagree, the test follows UC-022 and the disagreement is named as a
  finding.
- Only new test files change.
