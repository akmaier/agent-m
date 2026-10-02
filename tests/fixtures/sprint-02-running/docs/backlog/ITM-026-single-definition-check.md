---
id: ITM-026
title: One definition, three drivers — no prompt or schema text outside docs/assets/jobs/
kind: implementation
level: 1
realises:
  - ONE DEFINITION, THREE DRIVERS
modules: []
depends_on:
  - ITM-023
origin: backlog refinement 2026-10-01
---
# ITM-026 One definition, three drivers — no prompt or schema text outside docs/assets/jobs/

**REGISTER**

## Outcome

A repository check that no prompt or output-schema text of a job appears outside `docs/assets/jobs/` (ARC-007 consequences), with a counter-proof that a prompt copied into a module file is found.

## Realises

- `ONE DEFINITION, THREE DRIVERS`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-007 consequences.

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `tests/test_single_definition.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_single_definition.py` — `ONE DEFINITION, THREE DRIVERS`

## Acceptance criteria

From the SPEC's checks:

- `ONE DEFINITION, THREE DRIVERS` — `tests/test_single_definition.py` — no prompt or schema text appears in more than one place.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-023 — the definitions exist

## Needs a person

No.

## Notes

A rule whose check runs no single module (ARC-020 decision 5): the test carries `Guards:` and `Level:`, no `Module:`.
