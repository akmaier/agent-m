---
id: ITM-300
title: A group file read
level: module
realises:
  - UC-007
  - UC-019
  - EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN
  - A GROUP CARRIES NO IDENTIFIER
modules:
  - MOD-group-document
builds_on:
tests:
  - unit
origin:
  - UC-007 step 5
  - UC-019 step 7
---
# ITM-300 A group file read

**REGISTER**

## Outcome

The module's folder `src/group-document/` with `GroupTree` and `parseGroupFile`, as MOD-group-document's file states
them: a group file `docs/groups/<kind>.md` read into its groups — their titles, their members and their lines —, its
kind taken from its path, and `NotAGroupFile` for any other path. MOD-trace-graph reads the group titles through it
(ITM-305). `hierarchy`, `groupFileText`, `applyMoves` and `GroupMove` — the arrangement of UC-021 and the check
`group-rules` — are not part of this item.

## Acceptance

- Unit tests that name MOD-group-document state, before the code exists: the module file's example read with its
  groups, members and lines; a path of an unknown kind refused with `NotAGroupFile`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/group-document/` and the tests that name MOD-group-document change.
