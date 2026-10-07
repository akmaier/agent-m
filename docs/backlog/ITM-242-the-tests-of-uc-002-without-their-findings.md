---
id: ITM-242
title: The tests of UC-002 without their findings
level: system
realises:
  - UC-002
  - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES
modules:
  - MOD-implementation-pages
  - MOD-product-process
  - MOD-model-catalogue
  - MOD-participant-list
builds_on:
  - ITM-223
  - ITM-240
  - ITM-241
tests:
  - system
  - release
origin:
  - UC-002
---
# ITM-242 The tests of UC-002 without their findings

**REGISTER**

## Outcome

ITM-223's system and release tests of UC-002 without the findings that ITM-240, ITM-241 and the SPEC settle, written by
the release tester, who implements none of the items it tests (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`):
- once ITM-240 and ITM-241 are merged, the todo marks of the tests of F1 to F7 are removed;
- the test of F8 states the five conditions of `THE DEFAULT DEFINITION OF DONE IS THE JOB RULES` as accepted in
  `617988d` — CI is green; the job's first commit held only failing tests, or, for a refactoring job, CI was green on every
  commit and no expected result changed; it changes only the job's modules; every new test names the requirement it guards
  and the module it exercises; every gate the workflow places before the merge is recorded.

## Acceptance

- The tests of F1 to F8 pass on `sprint/07` with no todo mark.
- Each of them has its counter-proof recorded in the pull request: a fault planted in the code it guards, and the test
  failing on it.
- Only ITM-223's two test files change: `tests/system-uc-002-choose-a-process-model.test.mjs` and
  `tests/release-sprint-06-uc-002-implementation-pages.test.mjs`.
