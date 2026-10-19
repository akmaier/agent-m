---
id: ITM-1010
title: A closed sprint holds no item that its change already brought to the default branch
level: unit
realises:
  - A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
modules:
  - MOD-work-plans
builds_on:
tests:
  - unit
origin:
  - the false hold of ITM-269 found at sprint team1/93 (93.md), measured by po-opus
---
# ITM-1010 A closed sprint holds no item that its change already brought to the default branch

**REGISTER**

## Outcome

Since ITM-269's pull request #949 was merged into `sprint/team1/93`, `heldItems` counts ITM-269 as held by team 2's closed
sprints 16 and 24, which selected it in October and whose change reached `main` on 2026-10-09 (team2/16.md:41, :182). No
pull request title of theirs named ITM-269. SPEC.md:1672-1674 holds an item "until its change is merged into the default
branch or the item returns to the backlog". `conflicts` then held every MOD-settings-pages and MOD-product-process item of
team 1 back against "ITM-269".

**First task:** read how `heldItems` tells that a sprint's change reached the default branch, and name the record that
would show it for a sprint whose pull requests do not name the item.

## Acceptance

- A closed sprint whose increment reached the default branch holds none of its items, whichever later pull request names
  them. A test with a fixture of two sprints shows it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
