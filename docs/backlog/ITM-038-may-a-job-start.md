---
id: ITM-038
title: May a job start — acceptance, holder of its role, WIP, selection, a route to its resources
kind: implementation
level: 1
realises:
  - NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
modules:
  - MOD-run-engine
depends_on:
  - ITM-037
  - ITM-029
  - ITM-034
origin: backlog refinement 2026-10-01
---
# ITM-038 May a job start — acceptance, holder of its role, WIP, selection, a route to its resources

**REGISTER**

## Outcome

`startable(item, snapshot)` — everything the item names accepted, the WIP limit, the selection, a holder of its role who may receive its content, a route to its resources; the hosted CI route offered for every job kind whose definition names no local resource.

## Realises

- `NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED`
- `A JOB GOES ONLY TO A HOLDER OF ITS ROLE`
- `AGENT M WORKS WITHOUT A LOCAL INSTALLATION`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-run-engine `startable`.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007, ARC-010.

## Modules

- MOD-run-engine (kernel) — uses MOD-job-harness, MOD-process-model, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/run-engine/startable.mjs` (new)
- `tests/test_job_preconditions.py`
- `tests/test_job_assignment.py`
- `tests/test_runtime_levels.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_job_assignment.py` — `A JOB GOES ONLY TO A HOLDER OF ITS ROLE`
- `tests/test_job_preconditions.py` — `NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED`
- `tests/test_runtime_levels.py` — `AGENT M WORKS WITHOUT A LOCAL INSTALLATION`

## Acceptance criteria

From the SPEC's checks:

- `NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED` — `tests/test_job_preconditions.py`. An item that names one open proposal cannot be started. The same item can be started after an approval record names the proposal's text.
- `A JOB GOES ONLY TO A HOLDER OF ITS ROLE` — `tests/test_job_assignment.py`
- `AGENT M WORKS WITHOUT A LOCAL INSTALLATION` — `tests/test_runtime_levels.py` — every job kind whose definition names no local resource is runnable on the hosted-CI route; counter-proof: a job needing a compute resource is not offered there.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-037 — records
- ITM-029 — role holders
- ITM-034 — item states and the WIP limit

## Needs a person

No.
