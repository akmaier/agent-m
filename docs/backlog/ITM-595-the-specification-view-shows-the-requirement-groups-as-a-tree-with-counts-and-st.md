---
id: ITM-595
title: The specification view shows the requirement groups as a tree with counts and statuses
level: module
realises:
  - UC-020
  - AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
modules:
  - MOD-trace-pages
builds_on:
  - ITM-594
tests:
  - unit
  - component
  - system
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-595 The specification view shows the requirement groups as a tree with counts and statuses

**REGISTER**

## Outcome

UC-020 steps 2, 3 and 3a: "the groups of `docs/groups/requirements.md` … a status". Today the tree is the SPEC's sections (ITM-277).

## Acceptance

- Every requirement appears once, with its status.
- Each group shows how many it holds and how many no use case realises.
- An unknown member is shown as such.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
