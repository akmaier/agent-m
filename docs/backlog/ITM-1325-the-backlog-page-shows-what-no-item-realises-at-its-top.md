---
id: ITM-1325
title: The backlog page shows what no item realises at its top
level: module
realises:
  - UC-032
  - UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
modules:
  - MOD-implementation-pages
builds_on:
tests:
  - unit
origin:
  - finding UC032-S2 of ITM-803's battery, ruled at its gate (docs/gates/20261030-2035-development-release-testing-d803.md, Noted), and team1's sprint 129 Review (docs/backlog/sprints/team1/129.md)
---
# ITM-1325 The backlog page shows what no item realises at its top

**REGISTER**

## Outcome

UC-032 step 1 says: "The top of the page shows accepted requirements and use cases that no item realises yet". The route
`backlog` draws that part last. `paint` (`src/implementation-pages/backlog.mjs`) draws `uncoveredPanel` after
`backlogPanel`. TST-803004 follows UC-032 and stands `todo` with the finding.

With this item, the part of what no item realises is drawn before the teams and the backlog, under the page's head. The
page's own *What is this?* names the parts in that order.

## Readiness

It is ready. No module text fixes the order of the route's parts, and the change stays in `paint`. The gate's planted
fix, `uncoveredPanel` drawn before `backlogPanel`, turns TST-803004 green. Its build and planning run are made at the
planning that selects it.

## Acceptance

- A unit case of the route: the part `uncovered` stands before the parts `teams` and `backlog`.
  - Known positive: on the base it stands after them.
- TST-803004's `todo` is taken away on the item's branch, in a commit of its own, by a participant who implemented none of
  the item.
- The first commit holds only the tests, and CI is red on it for the item's reason.
- It shares `src/implementation-pages/backlog.mjs` (`paint`) with ITM-1326, ITM-1327 and ITM-1328. The planning that
  selects more than one of them names their order.
