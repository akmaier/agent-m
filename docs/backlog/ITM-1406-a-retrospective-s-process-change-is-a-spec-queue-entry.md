---
id: ITM-1406
title: A retrospective's process change is a SPEC queue entry
level: module
realises:
  - UC-041
  - AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF
modules:
  - MOD-work-plans
builds_on:
  - ITM-991
  - ITM-1397
tests:
  - unit
origin:
  - UC041-F4, TST-991306 of ITM-991's release tests of UC-041 (#1698), ruled at its gate in team1's sprint 142 (docs/gates/20261101-1949-development-release-testing-0991.md)
---
# ITM-1406 A retrospective's process change is a SPEC queue entry

**REGISTER**

## Outcome

`AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF`: a rule of the development process changes only through a change of
the SPEC that a person accepts. Its check asks that every change a retrospective recommends is an open entry of a SPEC
change queue. The close writes such a change only as a line of the sprint record (`src/work-plans/saves.mjs:266`).

## The reading taken

MOD-work-plans says "the proposals of the retrospective stay proposals". A proposal of a change of the SPEC is an entry of
a change queue (`A SPEC EDIT IS SAVED AS A PROPOSAL`). So each recommended change to the process model, the Definition of
Done or a participant's instructions is written as an open queue entry, and the record names it.

MOD-work-plans' Uses name MOD-spec-changes' `Queue` and `queues`, but no function that writes an entry. The probe names the
function the item needs. Where that function would be a new use, it is the module text's gap, which is noted for akmaier at
the gate.

## Acceptance

- Each change a retrospective recommends to the process model, the Definition of Done or a participant's instructions is
  an open entry of a SPEC change queue. The model, the Definition of Done, the participants and the job definitions stay
  byte-identical.
- TST-991306 loses its `todo` in a commit by a participant other than the implementer, written after the code is pushed.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
