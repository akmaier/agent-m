---
id: ITM-608
title: MOD-work-plans offers workStrategies
level: module
realises:
  - UC-045
  - UC-032
  - UC-041
modules:
  - MOD-work-plans
builds_on:
  - ITM-572
tests:
  - unit
origin:
  - ITM-572's gate (docs/gates/20261016-2243-development-release-testing-163f.md): `draft-plan` meets UnknownStrategy for its recipe `architecture-and-model`, which MOD-work-plans' `workStrategies` gives and which is not built
---
# ITM-608 MOD-work-plans offers workStrategies

**REGISTER**

## Outcome

MOD-work-plans' `workStrategies`, as its file states it (Interfaces, `workStrategies`):
- **recipes:** `architecture-and-model`, `backlog-inputs`, `sprint-facts`;
- **checks:** `plan-checks`, `backlog-checks`, `sprint-record-checks`;
- **writers:** `plan-steps`, `backlog-items`, `sprint-record`.

Once it is built, it is registered where the other sets are: CI, the Bridge, and MOD-prompt-bar's
`handOverStrategies`.

**Not ready for a sprint yet.** It is cut before it is selected: one item per recipe, check or writer, or per kind that
needs them (`draft-plan`, `propose-items`, `close-sprint`). For each part, the functions it calls are read against
MOD-work-plans' Uses, together with the tests of each input and output form it changes.

## Acceptance

- Each kind that names these strategies prepares without `UnknownStrategy`.
- The first commit of each cut holds only its tests, and CI is red on it. No stub is committed.
