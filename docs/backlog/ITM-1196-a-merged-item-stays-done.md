---
id: ITM-1196
title: An item whose pull request is merged stays done; a changed text or an open prerequisite marks it and never reopens it
level: module
realises:
  - UC-032
  - A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
modules:
  - MOD-work-plans
builds_on:
tests:
  - unit
origin:
  - akmaier, 2026-10-23: "It does not make sense that backlog items can change from done to open. … make sure this does never happen again."
---
# ITM-1196 An item whose pull request is merged stays done; a changed text or an open prerequisite marks it and never reopens it

**REGISTER**

## Outcome

**The defect, as a data-flow path** (read on `main` at `068c4db6`). `src/work-plans/states.mjs:161-206`, `derivedState`,
decides an item's state in this order:
1. `acceptanceReasons` (:165-166). A use case or requirement the item realises that is not accepted at its current blob
   (`src/approvals/status.mjs:72-79`) gives `waiting for acceptance`.
2. `unfinishedPrerequisites` (:168-170). An item it builds on that is not done gives `waiting for an item it builds on`,
   and that cascades.
3. Only then, a merged pull request naming the item (:202-203) gives `done`.

So a merged item stops being `done` when a text it realises changes, or when an item it builds on is reopened or added.
- **The text** says `done` is "its pull request is merged" (MOD-work-plans.md:125-128). A changed requirement "marks the
  item" (:152-153). Nothing in it puts acceptance or prerequisites before a merge, and UC-032 1a says "Nothing changes
  until the Product Owner decides".
- **No test pins the order.** TST-295001 covers items without a pull request only.

**A second path, in another module:** the backlog page's base filter, which is ITM-1197 (MOD-implementation-pages).

**This week:** the draft `668a3ce1` changed UC-017 on `main` before acceptance. That reopened items directly and by
cascade. A builds_on added to the done ITM-210 (`fc8c2f58`) reopened it.

## Acceptance

- A merged pull request naming the item gives `done`, checked before acceptance, prerequisites, gates and jobs.
- A realised text that is not accepted, or an item it builds on that is not done, gives the done item a **mark**, named
  as MOD-work-plans.md:152-153 has it. It never changes the item's state.
- **Tests:**
  - a done item whose realised use case becomes changed stays `done` and carries the mark;
  - a done item one of whose builds_on is not done stays `done`;
  - Counter-proof: today's order fails the first two.
- **The items it turns to done are listed before the build** (sprint 105's record, "ITM-1196"), and the developer checks
  the list after it.
- The first commit holds only the tests, and CI is red on it.
