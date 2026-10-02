---
id: ITM-012
title: Group files — parse, format, the hierarchy with every item once, moves
kind: implementation
level: 1
realises:
  - ARTIFACTS ARE ARRANGED IN NESTED GROUPS
  - A GROUP CARRIES NO IDENTIFIER
  - A GROUP HOLDS ONE KIND OF ARTIFACT
  - AN ITEM HAS ONE PLACE IN ITS HIERARCHY
  - EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN
  - REGROUPING LEAVES THE GROUPED FILE UNCHANGED
  - AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
modules:
  - MOD-artifacts
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-012 Group files — parse, format, the hierarchy with every item once, moves

**REGISTER**

## Outcome

`parseGroupFile`, `formatGroupFile` (canonical: format of parse equals the text), `hierarchy(tree, items)` with every known item placed once and the problems of ARC-020 decision 3, and `applyMoves(tree, moves)` that refuses a move across kinds or deleting a non-empty group. The repository's own `docs/groups/architecture.md` and `docs/groups/modules.md` parse without a problem.

## Realises

- `ARTIFACTS ARE ARRANGED IN NESTED GROUPS`
- `A GROUP CARRIES NO IDENTIFIER`
- `A GROUP HOLDS ONE KIND OF ARTIFACT`
- `AN ITEM HAS ONE PLACE IN ITS HIERARCHY`
- `EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN`
- `REGROUPING LEAVES THE GROUPED FILE UNCHANGED`
- `AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-artifacts `parseGroupFile`, `formatGroupFile`, `hierarchy`, `applyMoves`; ARC-020 decision 3.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/artifacts/groups.mjs` (new)
- `tests/test_groups.py`
- `tests/fixtures/groups/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_groups.py` — `ARTIFACTS ARE ARRANGED IN NESTED GROUPS`; `A GROUP CARRIES NO IDENTIFIER`; `A GROUP HOLDS ONE KIND OF ARTIFACT`; `AN ITEM HAS ONE PLACE IN ITS HIERARCHY`; `EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN`; `REGROUPING LEAVES THE GROUPED FILE UNCHANGED`; `AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL`

## Acceptance criteria

From the SPEC's checks:

- `ARTIFACTS ARE ARRANGED IN NESTED GROUPS` — `tests/test_groups.py`
- `A GROUP CARRIES NO IDENTIFIER` — `tests/test_groups.py` — no artifact names a group title where an identifier is expected.
- `A GROUP HOLDS ONE KIND OF ARTIFACT` — `tests/test_groups.py`
- `AN ITEM HAS ONE PLACE IN ITS HIERARCHY` — `tests/test_groups.py`
- `EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN` — `tests/test_groups.py`
- `REGROUPING LEAVES THE GROUPED FILE UNCHANGED` — `tests/test_groups.py` — blob SHAs of `SPEC.md` and of all artifact files are equal before and after a regrouping.
- `AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL` — `tests/test_groups.py`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.
