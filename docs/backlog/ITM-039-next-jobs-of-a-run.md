---
id: ITM-039
title: The next jobs of a run — CI first, interface order, gates, limits, a sprint closed by an agent
kind: implementation
level: 1
realises:
  - A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION
  - A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS
  - A RUN SETS UP CI BEFORE IT IMPLEMENTS
  - A RUN HAS LIMITS FIXED AT ITS START
  - A JOB STOPS AT EVERY GATE
  - A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - UC-043
modules:
  - MOD-run-engine
depends_on:
  - ITM-038
  - ITM-021
  - ITM-031
  - ITM-036
  - ITM-035
origin: backlog refinement 2026-10-01
---
# ITM-039 The next jobs of a run — CI first, interface order, gates, limits, a sprint closed by an agent

**REGISTER**

## Outcome

`nextJobs(snapshot)` (pure; slot keys so that two engines never start one job twice) and `runPlan({ selection, workflow, modules, limits })` of ARC-010.

## Realises

- `A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION`
- `A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS`
- `A RUN SETS UP CI BEFORE IT IMPLEMENTS`
- `A RUN HAS LIMITS FIXED AT ITS START`
- `A JOB STOPS AT EVERY GATE`
- `A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF`
- `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`
- UC-043 — Run the process over a selection

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-run-engine `nextJobs`, `runPlan`; ARC-010 decisions 1–7.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007, ARC-010.

## Modules

- MOD-run-engine (kernel) — uses MOD-job-harness, MOD-process-model, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/run-engine/next-jobs.mjs` (new)
- `tests/test_process_run.py`
- `tests/test_job_gate.py`
- `tests/test_progress_derived.py`
- `tests/test_time_box_close.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_job_gate.py` — `A JOB STOPS AT EVERY GATE`
- `tests/test_process_run.py` — `A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION`; `A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS`; `A RUN SETS UP CI BEFORE IT IMPLEMENTS`; `A RUN HAS LIMITS FIXED AT ITS START`
- `tests/test_progress_derived.py` — `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED`
- `tests/test_time_box_close.py` — `A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF`

## Acceptance criteria

From the SPEC's checks:

- `A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION` — `tests/test_process_run.py` — a V-model fixture with three accepted modules yields, from one start, the jobs of every phase for all three in the model's order.
- `A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS` — `tests/test_process_run.py` — a fixture run of five jobs without a person's gate needs one start and no further click; counter-proof: with a gate decided by a person, it waits there and nowhere else.
- `A RUN SETS UP CI BEFORE IT IMPLEMENTS` — `tests/test_process_run.py`
- `A RUN HAS LIMITS FIXED AT ITS START` — `tests/test_process_run.py` — a run whose reported cost reaches its limit starts no further job and says why; counter-proof: below the limit it continues.
- `A JOB STOPS AT EVERY GATE` — `tests/test_job_gate.py`. A fixture job reaching a gate does not proceed while no decision of the gate's decider is recorded, nor on a record by anyone else. It proceeds on the decider's record — a person's, an agent's or a CI check's, as the gate names.
- `A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF` — `tests/test_time_box_close.py`
- `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` — `tests/test_progress_derived.py`. Deleting all local storage and reloading shows the same progress and the same job states.

From the postcondition of UC-043 (Run the process over a selection), for the part this item builds:

> - Every selected module has code and tests merged through pull requests whose Definition of Done held, or
>   is listed with the job that failed or the gate that waits.
> - The run's record names the selection, the limits, every job it started and the end state; each job's
>   record names the run.
> - The author clicked to start, and wherever the model gave a gate to a person — nowhere else.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-038 — startable
- ITM-021 — module order; extends tests/test_process_run.py
- ITM-031 — gate decisions; extends tests/test_job_gate.py
- ITM-036 — sprint close; extends tests/test_time_box_close.py
- ITM-035 — plan entries of a planned model

## Needs a person

No.

## Notes

`A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF` speaks of the time box's end; Agent M's own model has none — see the change requests.
