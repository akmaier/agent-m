---
id: ITM-021
title: The order in which a run implements modules, and the validation that ends it
kind: implementation
level: 1
realises:
  - A RUN FOLLOWS THE MODULES' INTERFACES
  - A RUN ENDS WITH THE VALIDATION OF ITS MODULES
modules:
  - MOD-traceability
depends_on:
  - ITM-018
origin: backlog refinement 2026-10-01
---
# ITM-021 The order in which a run implements modules, and the validation that ends it

**REGISTER**

## Outcome

`moduleOrder(graph, selection)` orders the selected modules by their `uses` in layers, refusing a cycle and naming its modules; `moduleRows(graph, selection)` gives the validation that ends a run.

## Realises

- `A RUN FOLLOWS THE MODULES' INTERFACES`
- `A RUN ENDS WITH THE VALIDATION OF ITS MODULES`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-traceability `moduleOrder`, `moduleRows`; ARC-010 decision 6.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-traceability (kernel) — uses MOD-artifacts, MOD-review-core

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/traceability/run-order.mjs` (new)
- `tests/test_process_run.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_process_run.py` — `A RUN FOLLOWS THE MODULES' INTERFACES`; `A RUN ENDS WITH THE VALIDATION OF ITS MODULES`

## Acceptance criteria

From the SPEC's checks:

- `A RUN FOLLOWS THE MODULES' INTERFACES` — `tests/test_process_run.py` — for modules A → B → C and D, C starts after B and B after A, while D runs alongside; counter-proof: a cycle in the interfaces is refused before the run starts, and named.
- `A RUN ENDS WITH THE VALIDATION OF ITS MODULES` — `tests/test_process_run.py`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-018 — the link graph and module rows

## Needs a person

No.
