---
id: ITM-1337
title: The burn-down has a point for each day of the sprint
level: module
realises:
  - UC-035
  - PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-800
  - ITM-806
tests:
  - unit
origin:
  - finding UC035-S1 of ITM-806's system test TST-806002 (#1590), ruled at its gate in team1's sprint 138 (docs/backlog/sprints/team1/138.md)
---
# ITM-1337 The burn-down has a point for each day of the sprint

**REGISTER**

## Outcome

UC-035's table, for a model with time boxes: "a burn-down of remaining items per day of the sprint". The route draws a point at the sprint's start, one at each merge of its items and one for now (`remainingOverTime`, `src/implementation-pages/progress.mjs:48`, drawn at `:186`).

## Acceptance

- Each running sprint's burn-down has one point per day of the sprint, from its start to today, each the items left at that day's end.
- TST-806002 loses its `todo`, in a commit of a participant who implements none of this item.
- Before selection, the planning reads whether the accepted module files state this; if they do not, the item is a gap of
  the architecture, for akmaier.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
