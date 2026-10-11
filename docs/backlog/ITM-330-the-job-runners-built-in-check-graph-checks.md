---
id: ITM-330
title: The job runner's built-in check graph-checks
level: module
realises:
  - UC-007
  - UC-019
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - A USE CASE REALISES NAMED REQUIREMENTS
  - THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
modules:
  - MOD-job-runner
builds_on:
  - ITM-305
  - ITM-306
tests:
  - unit
origin:
  - UC-007 step 5
  - UC-019 step 7
---
# ITM-330 The job runner's built-in check graph-checks

**REGISTER**

## Outcome

The check `graph-checks` in `builtins.mjs`, as MOD-job-runner's file states it: `graphFindings` on the product's
snapshot with the drafted files put in place of their paths (ITM-305, ITM-306), and `selfSufficiencyFindings` there
against the context's instance, `owner/name`.

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists: a drafted use case that realises a name the SPEC
  lacks is sent back; one that links the instance's dashboard is sent back; a corrected draft ends the loop.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
