---
id: ITM-377
title: The system and release tests of UC-019 for a use case
level: system
realises:
  - UC-019
modules:
  - MOD-review-pages
  - MOD-artifact-edits
  - MOD-workflow-entries
  - MOD-runtimes
builds_on:
  - ITM-363
  - ITM-369
  - ITM-366
  - ITM-325
  - ITM-367
tests:
  - system
  - release
origin:
  - UC-019
---
# ITM-377 The system and release tests of UC-019 for a use case

**REGISTER**

## Outcome

UC-019 checked as a whole for a use case, once ITM-363 and the change between jobs by which the dashboard reaches its
route and registers its view's strategies are merged: a system test that walks the main flow for a use case and the
alternative flows 3a, 4a, 5a, 6a — through a fixture Bridge whose agent returns the draft —, 6b — through the product's
job workflow entry over a fixture checkout, whose commit writes the use case open —, 6c, 7a, 7b, 8b and 8c, with GitHub
replaced by a fixture server and the participant by a fixture endpoint; and release tests, one or more for each
requirement UC-019 realises. Changing requirements by prompt, *Refine*, restoring a changed `id` before the editor
opens, and refusing a save when the use case changed while the participant drafted (9a) are not part of this item. The
tests are written by a Developer who implemented none of the items they build on (`RELEASE TESTS ARE NOT WRITTEN BY THE
IMPLEMENTER`).

## Acceptance

- Every requirement UC-019 realises has a release test as far as a use case shows it, and the system test walks the
  main flow and each alternative flow named; each test states its input, precondition and expected result where they
  can be read without running it, and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in
  the pull request, which names the author.
- Where the dashboard and UC-019 disagree, the test follows UC-019 and the disagreement is named as a finding.
- Only new test files change.
