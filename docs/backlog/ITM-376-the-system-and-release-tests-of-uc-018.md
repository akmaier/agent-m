---
id: ITM-376
title: The system and release tests of UC-018
level: system
realises:
  - UC-018
modules:
  - MOD-review-pages
  - MOD-artifact-edits
  - MOD-spec-changes
  - MOD-trace-pages
builds_on:
  - ITM-358
  - ITM-359
  - ITM-360
  - ITM-368
tests:
  - system
  - release
origin:
  - UC-018
---
# ITM-376 The system and release tests of UC-018

**REGISTER**

## Outcome

UC-018 checked as a whole, once ITM-358, ITM-359 and ITM-360 and the change between jobs after them are merged: a system
test that walks the main flow, for a use case and for a requirement, and the alternative flows 3a, 3b, 3c, 3e, 4a, 4b,
5a, 6a, 6b and 7a, with GitHub and the GitLab server replaced by fixture servers; and release tests, one or more for
each requirement UC-018 realises. Editing an open proposal in place (1a) and *+ Requirement* in a section of the
specification browser (3d) are not part of this item. The tests are written by a Developer who implemented none of
ITM-302, ITM-307, ITM-309, ITM-335, ITM-341, ITM-343, ITM-358, ITM-359 and ITM-360 (`RELEASE TESTS ARE NOT WRITTEN BY
THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-018 realises has a release test, and the system test walks the main flow and each alternative
  flow named; each test states its input, precondition and expected result where they can be read without running it,
  and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in
  the pull request, which names the author.
- Where the dashboard and UC-018 disagree, the test follows UC-018 and the disagreement is named as a finding.
- Only new test files change.
