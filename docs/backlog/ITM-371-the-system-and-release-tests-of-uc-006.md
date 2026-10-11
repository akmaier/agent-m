---
id: ITM-371
title: The system and release tests of UC-006
level: system
realises:
  - UC-006
modules:
  - MOD-review-pages
  - MOD-spec-changes
  - MOD-workflow-entries
builds_on:
  - ITM-357
  - ITM-364
  - ITM-368
  - ITM-397
tests:
  - system
  - release
origin:
  - UC-006
---
# ITM-371 The system and release tests of UC-006

**REGISTER**

## Outcome

UC-006 checked as a whole through the review pages and the instance's workflow entry, once ITM-357, ITM-364 and ITM-397
and the changes between jobs after them are merged: a system test that walks the main flow and the alternative flows 3a,
3b, 4a, 4b, 4c, 4d and 5a, with GitHub replaced by a fixture server and 4c run on a temporary git repository; and
release tests, one or more for each requirement UC-006 realises. The tests are written by a Developer who implemented
none of ITM-302, ITM-312, ITM-315, ITM-339, ITM-340, ITM-364, ITM-342, ITM-357, ITM-394 and ITM-397 (`RELEASE TESTS ARE
NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-006 realises has a release test, and the system test walks the main flow and each alternative
  flow named; each test states its input, precondition and expected result where they can be read without running it,
  and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the review pages and UC-006 disagree, the test follows UC-006 and the disagreement is named as a finding.
- Only new test files change.
