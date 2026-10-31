---
id: ITM-1338
title: A passed gate on the progress page links its gate record
level: module
realises:
  - UC-035
  - THE GATE IS RECORDED
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-800
  - ITM-806
tests:
  - unit
origin:
  - finding UC035-S2 of ITM-806's system test TST-806006 (#1590), ruled at its gate in team1's sprint 138 (docs/backlog/sprints/team1/138.md)
---
# ITM-1338 A passed gate on the progress page links its gate record

**REGISTER**

## Outcome

UC-035 step 3: a passed gate shows "who decided, when, and on which text, linked to the gate record". The row of the panel *Gates* draws `decided.by`, `decided.date` and `decided.on`, and not `decided.record` (`src/implementation-pages/progress.mjs:202`).

## Acceptance

- The row of each passed gate links its gate record under `docs/gates/`; a pending gate and one not reached have no such link.
- TST-806006 loses its `todo`, in a commit of a participant who implements none of this item.
- Before selection, the planning reads whether the accepted module files state this; if they do not, the item is a gap of
  the architecture, for akmaier.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
