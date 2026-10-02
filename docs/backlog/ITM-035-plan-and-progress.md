---
id: ITM-035
title: The plan of a planned model, and progress in the model's own measure
kind: implementation
level: 1
realises:
  - A PLAN COVERS THE WHOLE SPECIFICATION
  - PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
  - UC-035
modules:
  - MOD-work-items
depends_on:
  - ITM-030
  - ITM-033
origin: backlog refinement 2026-10-01
---
# ITM-035 The plan of a planned model, and progress in the model's own measure

**REGISTER**

## Outcome

`derivePlan` (N × P entries for N accepted requirements and P phases) and `progress(workflow, snapshot)` in the measure the model names, with gates passed, pending, not reached.

## Realises

- `A PLAN COVERS THE WHOLE SPECIFICATION`
- `PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE`
- UC-035 — Follow progress on the process dashboard

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-work-items `derivePlan`, `progress`.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-019.

## Modules

- MOD-work-items (kernel) — uses MOD-process-model, MOD-review-core

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/work-items/plan.mjs` (new)
- `tests/test_plan_coverage.py`
- `tests/test_progress_view.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_plan_coverage.py` — `A PLAN COVERS THE WHOLE SPECIFICATION`
- `tests/test_progress_view.py` — `PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE`

## Acceptance criteria

From the SPEC's checks:

- `A PLAN COVERS THE WHOLE SPECIFICATION` — `tests/test_plan_coverage.py`. For a fixture product with N accepted requirements and a V-model definition of P phases, the derived plan has exactly N × P entries. Accepting one more requirement adds P entries.
- `PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE` — `tests/test_progress_view.py`. A V-model, a Scrum and a Kanban fixture each render their declared measure. A definition naming an unknown measure fails validation.

From the postcondition of UC-035 (Follow progress on the process dashboard), for the part this item builds:

> - The reader has seen the product's progress in its model's own measure, the state of every gate,
>   what is blocked, and who works on what.
> - Nothing was written. Everything shown was derived at the moment it was shown.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-030 — workflow
- ITM-033 — items

## Needs a person

No.

## From the sprint 03 planning

The progress bar on the main page (ITM-162, akmaier's direction of 2026-10-02) counts items per state with `itemState`
over the order and the pull requests in the shell until `progress` exists; when this item builds `progress`, the bar reads
its numbers from it and nothing else changes (ITM-147's precedent with `parseDeclaration`). This item keeps `derivePlan`,
`progress` for the three measures with gates passed, pending and not reached, and the two checks the SPEC names; it still
depends on ITM-030 for the workflow the gates need.
