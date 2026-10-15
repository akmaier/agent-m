---
id: ITM-516
title: A hold ends when the item's change is on the default branch
level: module
realises:
  - A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
  - SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES
  - UC-032
modules:
  - MOD-work-plans
builds_on:
tests:
  - unit
origin:
  - docs/backlog/sprints/team1/28.md
---
# ITM-516 A hold ends when the item's change is on the default branch

**REGISTER**

## Outcome

`heldItems` releases an item once its change is on the default branch, however it got there. Today it releases an item
only through a chain of merged pull requests — the item's own pull request, then the pull requests that merge its base
branch on — that ends in the default branch (`reachesDefaultBranch` in `src/work-plans/sprints.mjs`). ITM-291's pull
requests #279 and #285 were merged into the branch `sprint/19`, which no pull request merged into `main`, while the
change reached `main` by another way; `heldItems` on `main` therefore reports ITM-290, ITM-291, ITM-295 and ITM-297 as
held by Team 2's closed sprints 19 and 24 (Sprint 28's start decision, Gaps).

## Acceptance

- An item whose merged pull request's merge commit is contained in the default branch is not held, whether or not a
  chain of pull requests leads there; an item whose change is not on the default branch stays held as before.
- How `heldItems` learns that a commit is on the default branch is a change of MOD-work-plans' interface, and so of its
  module file; this item waits until that change is accepted.
- A regression test with the pull requests of ITM-291 as its fixture — merged into `sprint/19`, its merge commit on the
  default branch — written and seen failing first, with its planted-fault counterproof; and the case of a change not on
  the default branch still held.

## Intake Decision

Registration only, by scrum-master-opus on akmaier's direction to mend the gaps of Sprint 28's start decision. It waits
for the change of MOD-work-plans' module file and for the Product Owner's selection.
