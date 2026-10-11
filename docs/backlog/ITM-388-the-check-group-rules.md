---
id: ITM-388
title: The check group-rules
level: module
realises:
  - UC-021
  - AN ITEM HAS ONE PLACE IN ITS HIERARCHY
  - A GROUP CARRIES NO IDENTIFIER
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
modules:
  - MOD-job-runner
builds_on:
  - ITM-381
tests:
  - unit
origin:
  - UC-021 1b
---
# ITM-388 The check group-rules

**REGISTER**

## Outcome

The check `group-rules` in MOD-job-runner's `builtins.mjs`, as its file states it: the drafted `GroupMove`s applied with
`applyMoves` (ITM-381) to the group file of the kind the job's parameters name, read from the product's snapshot; each
refused move, and the findings `hierarchy` reports for the result against the kind's items, read from the snapshot too,
as findings sent back.

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists, with a fixture snapshot: valid moves passing; a
  refused move sent back with its reason; a member placed twice and a group titled by an identifier sent back; a fixed
  draft passing.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
