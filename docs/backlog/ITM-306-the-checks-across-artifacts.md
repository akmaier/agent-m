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
  - ITM-382
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
part `checks.mjs`, each decided from the graph alone that ITM-382 builds: a name in `realises`, `forced_by`, an item's
`realises` or a test's `guards` that matches no requirement or use case; a `uses` edge whose interface the used module's
node does not provide; a cycle among the modules' uses; a module designed by no decision or by more than one, or that
does not follow the decision that designs it; more or fewer than one decision without `refines`; an item that names a
module the architecture does not describe, or a plan step whose `tests` are not those of its `level`; a module whose
`folder` is not named after its identifier or lies inside another module's folder; a name where an identifier is
expected that is the title of a `group` node — each an error naming the artifact and line —; and the graph's `positions`
as the warnings they are. `selfSufficiencyFindings` gives an error for each of the graph's `links` whose target is a
path of the repository that `files` does not hold, the instance's repository, or its dashboard at `pagesAddress`
(ITM-298). The check `graph-checks` (ITM-330) and the use-case editor (ITM-358) call them.

## Acceptance

- Unit tests that name MOD-trace-graph state, before the code exists, on graphs built from fixture repositories: one per
  finding the file lists, among them a used interface not provided, a plan step with another level's tests, a module
  folder misnamed and one inside another, a group's title in `realises`, a reference by position as a warning, and a
  link to a missing file, to the instance and to its dashboard; and one fixture with none.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/trace-graph/` and the tests that name MOD-trace-graph change.
