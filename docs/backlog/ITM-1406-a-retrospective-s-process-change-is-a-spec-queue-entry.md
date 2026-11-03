---
id: ITM-1406
title: A retrospective's process change is a SPEC queue entry
level: module
realises:
  - UC-041
  - AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF
modules:
  - MOD-work-plans
  - MOD-workflow-entries
  - MOD-implementation-pages
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

## Waiting for akmaier

A change is added as a new requirement, appended to the section that holds the requirement governing what it changes
(143.md, *Ruled* for ITM-1406). Neither of MOD-spec-changes' two writing routes can write it from the close job:
- **`proposeSection`** (`src/spec-changes/propose.mjs:405`) → `impactOf` (`accept.mjs:83-84`) needs the trace graph stored
  for the head it reads, and `storedGraph` (`src/trace-graph/build.mjs:201-206`) throws `GraphNotStored`. Right after the
  record's commit, no graph is stored for that head. That is certain for a product that is its own instance, and a matter
  of luck for another. The accepted text also gives `proposeSection` "Considers: called only on a person's click".
- **The writer `queue-entries`** builds its graph, but it writes candidates "as the person left them", and only those that
  point to a source the product links. A retrospective's change has neither.

The general change is one sentence of MOD-spec-changes: `proposeSection` may be called by a job whose SPEC rule asks for
an open entry (`AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF`), and it builds the trace graph of the head it reads
where none is stored. It goes to akmaier as a module-text draft with the sprint's other drafts. #1760 keeps the
tests-only commits `dba664a6f` and `631a7a789`, and TST-991306 keeps its `todo`.

## Acceptance

- Each change a retrospective recommends to the process model, the Definition of Done or a participant's instructions is
  an open entry of a SPEC change queue. The model, the Definition of Done, the participants and the job definitions stay
  byte-identical.
- TST-991306 loses its `todo` in a commit by a participant other than the implementer, written after the code is pushed.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
