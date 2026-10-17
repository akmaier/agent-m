---
id: ITM-788
title: The release test of the Definition of Done
level: system
realises:
  - UC-034
  - A PRODUCT DECLARES ITS DEFINITION OF DONE
  - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
modules:
  - MOD-product-process
builds_on:
tests:
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-788 The release test of the Definition of Done

**REGISTER**

## Outcome

`tests/test_definition_of_done.py`, the check SPEC.md names for these three requirements, does not exist. MOD-product-process'
`doneCheck` is built (ITM-409, `src/product-process/done.mjs`). The test runs it on fixture pull-request facts, with a
declared Definition of Done and without one. ITM-413's `tests/test_implementation_job.py` checks the job rules one by
one; this test checks the declaration and the merge decision.

## Acceptance

- Without a declaration the job rules apply; a declared condition is added to them; a pull request missing one condition
  is not mergeable, and with all met it is.
- Each test names the requirement it guards, the module it exercises and its level `release`; its cases stand in a
  Markdown data file beside it, and the Python file only loads them (AGENTS.md §7).
- It is written by a participant who implemented none of the behaviour it tests; each test's counter-proof is recorded
  in the pull request.
- Only the new test file and its data file change.
