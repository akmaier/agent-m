---
id: ITM-329
title: The job runner's built-in check requirement-form
level: module
realises:
  - UC-005
  - UC-019
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - AN ERROR MUST BE FIXED, A WARNING FIXED OR JUSTIFIED
  - A REQUIREMENT HAS FOUR FIELDS
  - ONE STATEMENT PER REQUIREMENT
modules:
  - MOD-job-runner
builds_on:
  - ITM-301
tests:
  - unit
origin:
  - UC-005 step 6
---
# ITM-329 The job runner's built-in check requirement-form

**REGISTER**

## Outcome

The check `requirement-form` in `builtins.mjs`, as MOD-job-runner's file states it: `requirementFindings` (ITM-301) on
every drafted requirement — each candidate read as the requirement it proposes, its source the one the job derives from.
`derive-requirements` and `change-requirements` run it.

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists: a candidate without a check is sent back as an
  error; a rule with "and" as a warning, ended by a one-line justification; a corrected draft ends the loop.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
