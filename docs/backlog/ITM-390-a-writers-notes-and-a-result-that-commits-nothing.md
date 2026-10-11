---
id: ITM-390
title: A writer's notes, and a result that commits nothing
level: module
realises:
  - UC-007
  - UC-010
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
modules:
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - UC-007 4a, 4b
  - UC-010 4a
---
# ITM-390 A writer's notes, and a result that commits nothing

**REGISTER**

## Outcome

MOD-job-runner, as its file now states it: `WriteOutcome` carries `notes`, what a writer changed of the draft while
writing, one line each; a writer whose every file already stands on the head byte for byte commits nothing and returns
an outcome without a commit; `writeResult` hands both on, so that the route's end record lists the notes and says `no
change` for an outcome without a commit (ITM-319, ITM-327, ITM-365). The writers that fill them are their modules'
(ITM-336, ITM-338).

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists, with fixture writers: the notes handed on from the
  writer; an outcome without a commit handed on as such; a writer's failure thrown by name as before.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
