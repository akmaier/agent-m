---
id: ITM-037
title: Job, gate, cancel and run records, and the seven job states
kind: implementation
level: 1
realises:
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A JOB IDENTIFIER IS NEVER REUSED
  - THE GATE IS RECORDED
  - NO COST IS GUESSED
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
  - A RUN IS A JOB THAT NAMES ITS JOBS
  - ONE DASHBOARD SHOWS EVERY JOB
modules:
  - MOD-run-engine
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-037 Job, gate, cancel and run records, and the seven job states

**REGISTER**

## Outcome

`newJobId`, `startRecord`, `endRecord`, `gateRecord`, `cancelRecord`, `parseJobRecord` and `jobState` of MOD-run-engine. `jobState` gives one of the seven states, *ended without record* for a start record without end record that no runtime knows, and rejects any other.

## Realises

- `A JOB IS RECORDED IN ITS PRODUCT REPOSITORY`
- `A JOB IDENTIFIER IS NEVER REUSED`
- `THE GATE IS RECORDED`
- `NO COST IS GUESSED`
- `AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT`
- `A RUN IS A JOB THAT NAMES ITS JOBS`
- `ONE DASHBOARD SHOWS EVERY JOB`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-run-engine; ARC-010 decisions 2, 4, 7.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007, ARC-010.

## Modules

- MOD-run-engine (kernel) — uses MOD-job-harness, MOD-process-model, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/run-engine.mjs` (new)
- `tests/test_job_record.py`
- `tests/test_gate_record.py`
- `tests/test_job_cost.py`
- `tests/test_artifact_provenance.py`
- `tests/test_job_dashboard.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_artifact_provenance.py` — `AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT`
- `tests/test_gate_record.py` — `THE GATE IS RECORDED`
- `tests/test_job_cost.py` — `NO COST IS GUESSED`
- `tests/test_job_dashboard.py` — `ONE DASHBOARD SHOWS EVERY JOB`
- `tests/test_job_record.py` — `A JOB IS RECORDED IN ITS PRODUCT REPOSITORY`; `A JOB IDENTIFIER IS NEVER REUSED`; `A RUN IS A JOB THAT NAMES ITS JOBS`

## Acceptance criteria

From the SPEC's checks:

- `A JOB IS RECORDED IN ITS PRODUCT REPOSITORY` — `tests/test_job_record.py`
- `A JOB IDENTIFIER IS NEVER REUSED` — `tests/test_job_record.py`
- `THE GATE IS RECORDED` — `tests/test_gate_record.py`
- `NO COST IS GUESSED` — `tests/test_job_cost.py`. A job whose runtime reports neither cost nor usage shows "unknown", never zero.
- `AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT` — `tests/test_artifact_provenance.py`
- `A RUN IS A JOB THAT NAMES ITS JOBS` — `tests/test_job_record.py`
- `ONE DASHBOARD SHOWS EVERY JOB` — `tests/test_job_dashboard.py`. Fixture jobs in two products and three runtimes appear in one list. A job state outside the seven is rejected.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.
