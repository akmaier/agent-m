---
id: ITM-366
title: The kinds of Specification and design in a product's job workflow
level: module
realises:
  - UC-019
  - UC-007
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - ONE DEFINITION, THREE DRIVERS
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-365
  - ITM-332
  - ITM-336
  - ITM-337
  - ITM-338
tests:
  - unit
origin:
  - UC-019 6b
---
# ITM-366 The kinds of Specification and design in a product's job workflow

**REGISTER**

## Outcome

MOD-workflow-entries' `compose.mjs` registers, in a product's job workflow, MOD-approvals' `approvalStrategies`
(ITM-332), MOD-spec-changes' `specStrategies` (ITM-337, ITM-338) and MOD-artifact-edits' `editStrategies` (ITM-336), so
that a job of `derive-use-cases`, `change-use-case` or `change-requirements` taken by `onRecordsChanged` runs its
correction loop from the same definition and its writer writes at once: a use case as an open file, requirements as an
entry of a new queue, `SPEC.md` untouched, the commit naming the instruction, the participant, the model, the version
and the rounds.

## Acceptance

- Unit tests that name MOD-workflow-entries state, before the code exists, with a fixture checkout and a fixture
  participant: a queued `change-use-case` job ending in one commit of an open file; a `change-requirements` job, with
  a fixture check `candidate-classes` registered, ending in a new queue with `SPEC.md` byte-identical; the provenance
  lines of each commit.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change.
