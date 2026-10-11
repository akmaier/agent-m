---
id: ITM-306
title: The checks across artifacts
level: module
realises:
  - UC-007
  - UC-018
  - UC-019
  - A USE CASE REALISES NAMED REQUIREMENTS
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - DEVELOP AGAINST INTERFACES
  - MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE
  - A MODULE BELONGS TO ONE SUBSYSTEM
  - A BACKLOG ITEM NAMES THE MODULES IT CHANGES
  - A PLAN STEP NAMES THE TESTS OF ITS LEVEL
  - A MODULE IS A FOLDER
  - A GROUP CARRIES NO IDENTIFIER
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
  - THE PRODUCT REPOSITORY IS SELF-SUFFICIENT
modules:
  - MOD-trace-graph
builds_on:
  - ITM-305
  - ITM-298
tests:
  - unit
origin:
  - UC-007 step 5
  - UC-018 step 3
  - UC-019 step 7
---
# ITM-306 The checks across artifacts

**REGISTER**

## Outcome

MOD-trace-graph's `graphFindings(graph)` and `selfSufficiencyFindings(graph, instance)`, as its file states them, in its
part `checks.mjs`: each finding across artifacts the file lists, as an error naming the artifact and line; and an error
under `THE PRODUCT REPOSITORY IS SELF-SUFFICIENT` for a link to a file the repository does not hold, to the instance's
repository or to its dashboard (`pagesAddress`, ITM-298). The check `graph-checks` (ITM-330) and the use-case editor
(ITM-358) call them.

## Acceptance

- Unit tests that name MOD-trace-graph state, before the code exists, one per finding the file lists, and one fixture
  with none.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/trace-graph/` and the tests that name MOD-trace-graph change.
