---
id: ITM-514
title: UC-019's flows through the prompt bar are covered
level: system
realises:
  - UC-019
modules:
  - MOD-review-pages
builds_on:
  - ITM-480
  - ITM-498
  - ITM-507
  - ITM-508
tests:
  - system
  - release
origin:
  - the pending findings ITM-480 leaves in UC-019's system and release tests
---
# ITM-514 UC-019's flows through the prompt bar are covered

**REGISTER**

## Outcome

Each pending finding ITM-480 left in UC-019's system and release tests is replaced by executable evidence through the
prompt bar and the review pages' route `draft` — or stays a finding, naming what the code does instead.

## Acceptance

- The tests pass on `main` but for findings named in the pull request; each new piece of evidence has a counter-proof.
- Only test files change; their author implemented none of UC-019's behaviour (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`).
