---
id: ITM-332
title: The recipes of use cases, and what a draft rests on
level: module
realises:
  - UC-007
  - UC-019
  - A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS
  - NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
modules:
  - MOD-approvals
builds_on:
  - ITM-233
  - ITM-387
tests:
  - unit
origin:
  - UC-007 step 3
  - UC-019 step 4
---
# ITM-332 The recipes of use cases, and what a draft rests on

**REGISTER**

## Outcome

MOD-approvals' `approvalStrategies`, as its file states them, with the recipe `use-cases` — every use case of the
product, each with its status, one part per file, which carries its use case as an artifact keyed by the key of its
format (`artifactSchemas`), against which `candidate-classes` classifies a draft (ITM-387) —, the recipe
`use-case-with-neighbours` — the use case the job's parameters name, every requirement it realises with its text from
the SPEC, and every other use case —, and the precondition `rests-on-accepted` for requirements and use cases: an error
finding naming every requirement or use case the selection names that is not accepted. The kinds `derive-use-cases` and
`change-use-case` name them. The recipes `accepted-use-cases` and `whole-architecture`, the precondition
`architecture-ready` and the architecture's part of `rests-on-accepted` (UC-022, UC-023) are not part of this item.

## Acceptance

- Unit tests that name MOD-approvals state, before the code exists, with a fixture snapshot: one part per use case with
  its status and the use case carried as an artifact with its key; a use case's neighbours with the text of each
  requirement it realises; an open requirement or use case in the selection named by `rests-on-accepted`; an accepted
  selection passing.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/approvals/` and the tests that name MOD-approvals change.
