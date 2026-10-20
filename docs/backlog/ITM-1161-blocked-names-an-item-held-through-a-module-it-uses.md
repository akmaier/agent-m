---
id: ITM-1161
title: blocked names an item held through a module it uses
level: module
realises:
  - SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES
  - UC-035
modules:
  - MOD-progress-measures
builds_on:
  - ITM-798
tests:
  - unit
origin:
  - the gate of #1245 (ITM-798, sprint team2/99), developer-sonnet-g's reading
---
# ITM-1161 blocked names an item held through a module it uses

**REGISTER**

## Outcome

`blocked` (ITM-798, `src/progress-measures/overviews.mjs:78-96`) gives "held by another team's sprint" when a held item of
another team changes or uses a module that the item changes.

SPEC.md:1678-1680 holds an item in one more case: another team's held item changes a module that this item uses. That case
is missing, because `Facts` carries no module an item uses. The module files are read by `productFacts` (MOD-progress-measures.md:113),
but `Facts` does not hold them.

So this item begins with a draft of MOD-progress-measures for akmaier. Either `Facts` names the modules each item uses,
from the module files `productFacts` already reads, or `blocked` takes them as MOD-work-plans' `conflicts` does. The draft
names which, by principle 2.

## Acceptance

- An item held only because another team's held item changes a module it uses is listed as "held by another team's sprint",
  with the sprint and the module. A test checks it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
