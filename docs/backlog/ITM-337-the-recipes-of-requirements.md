---
id: ITM-337
title: The recipes of requirements
level: module
realises:
  - UC-005
  - UC-007
  - UC-019
  - DERIVATION SEES THE EXISTING REQUIREMENTS
  - A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES
modules:
  - MOD-spec-changes
builds_on:
  - ITM-234
  - ITM-308
  - ITM-387
tests:
  - unit
origin:
  - UC-005 step 2
  - UC-007 steps 1 and 3
  - UC-019 step 4
---
# ITM-337 The recipes of requirements

**REGISTER**

## Outcome

MOD-spec-changes' `specStrategies` in `strategies.mjs`, as its file states them, with the recipes `chosen-requirements`
— the requirements the person chose, or without a choice every requirement of the SPEC that no use case realises
(ITM-308) —, `named-requirements` — the requirements the job's parameters name, each with its whole section — and
`spec-with-queues` — every requirement of the SPEC and of every open entry of every queue, each with its section and
state, its part carrying each of them as an artifact keyed by its name and its rule, against which `candidate-classes`
classifies a draft (ITM-387). The kinds `derive-requirements`, `derive-use-cases` and `change-requirements` name them.
The recipe `whole-spec` and the writer `queue-entries` (ITM-338) are not part of this item.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists, with a fixture snapshot holding open queues: the
  chosen requirements and the default of those no use case realises; the named requirements with their sections; every
  requirement of the SPEC and of the open entries with its state, each carried as an artifact keyed by its name and
  rule.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
