---
id: ITM-085
title: The job dashboard — every job of every product, gates decided, cancel and retry
kind: implementation
level: 1
realises:
  - ONE DASHBOARD SHOWS EVERY JOB
  - UC-036
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-037
  - ITM-039
  - ITM-055
origin: backlog refinement 2026-10-01
---
# ITM-085 The job dashboard — every job of every product, gates decided, cancel and retry

**REGISTER**

## Outcome

UC-036: one list across products and runtimes (records, Actions runs and GitLab pipelines, this tab), *waiting at a gate* first, filters, a job's inputs, commits, CI runs, log and cost as reported, *Pass gate*/*Reject* for a person, *Cancel*, *Retry* as a new job naming the old. Bridge sources arrive with ITM-108.

## Realises

- `ONE DASHBOARD SHOWS EVERY JOB`
- UC-036 — Inspect running jobs

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/jobs-view.mjs` (new)
- `tests/test_job_dashboard.py`
- `tests/dashboard-jobs.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_job_dashboard.py` — `ONE DASHBOARD SHOWS EVERY JOB`

## Acceptance criteria

From the SPEC's checks:

- `ONE DASHBOARD SHOWS EVERY JOB` — `tests/test_job_dashboard.py`. Fixture jobs in two products and three runtimes appear in one list. A job state outside the seven is rejected.

From the postcondition of UC-036 (Inspect running jobs), for the part this item builds:

> - The author has seen every reachable job of every product in one place, with state, participant,
>   runtime, elapsed time, cost where known, and log.
> - Every gate passed from this page is recorded with who, when and on which text.
> - A cancelled job wrote nothing after its cancel. A retry is a new job that names the one it retries.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-037 — records; extends tests/test_job_dashboard.py
- ITM-039 — job states from the runtimes
- ITM-055 — workflow runs, cancel, logs

## Needs a person

No.
