---
id: ITM-040
title: The executor — one job from its start record to its end record in any runtime
kind: implementation
level: 1
realises:
  - A CANCELLED JOB WRITES NOTHING MORE
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - UC-010
  - UC-024
modules:
  - MOD-run-engine
depends_on:
  - ITM-037
  - ITM-024
  - ITM-008
  - ITM-023
origin: backlog refinement 2026-10-01
---
# ITM-040 The executor — one job from its start record to its end record in any runtime

**REGISTER**

## Outcome

`runJob(job, ports)` of ARC-010 decision 8: definition, inputs through ports, driver or correction loop, a cancel check before each commit, the result on the route the definition names (a drafting job's result only as an open artifact or a queue entry), the end record with rounds, versions, model and a cost only as reported. The job definitions of the implementation and refactoring jobs (test-first cycle, module marker, the files a job may change).

## Realises

- `A CANCELLED JOB WRITES NOTHING MORE`
- `A CI AGENT'S DRAFT ENTERS AS OPEN`
- UC-010 — Run a job in GitHub Actions
- UC-024 — Implement modules from the architecture

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-run-engine `runJob`; ARC-010 decision 8.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007, ARC-010.

## Modules

- MOD-run-engine (kernel) — uses MOD-job-harness, MOD-process-model, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/run-engine/run-job.mjs` (new)
- `docs/assets/jobs/implement/` (implementation and refactoring job kinds, new)
- `tests/test_job_cancel.py`
- `tests/test_prompted_change_context.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_job_cancel.py` — `A CANCELLED JOB WRITES NOTHING MORE`
- `tests/test_prompted_change_context.py` — `A CI AGENT'S DRAFT ENTERS AS OPEN`

## Acceptance criteria

From the SPEC's checks:

- `A CANCELLED JOB WRITES NOTHING MORE` — `tests/test_job_cancel.py`. A fixture job cancelled between its test commit and its implementation commit leaves the branch at the test commit.
- `A CI AGENT'S DRAFT ENTERS AS OPEN` — `tests/test_prompted_change_context.py` — a CI-agent fixture's prompted change yields an open use case or a queue entry and leaves `SPEC.md` byte-identical; counter-proof: neither is shown as accepted.

From the postcondition of UC-010 (Run a job in GitHub Actions), for the part this item builds:

> - The artifacts are of the same kind the browser runtime would produce.
> - Nothing counts as accepted before a person accepts it on the dashboard.

From the postcondition of UC-024 (Implement modules from the architecture), for the part this item builds:

> - The code reached the default branch only through a pull request whose CI run was green.
> - The job's first commit was a failing test; the module's tests guard named requirements from now on.
> - Every file the job created or changed names the module it belongs to; no file outside the job's
>   modules was changed.
> - The pull request records who implemented it, with which model and Agent M version, and when.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-037 — records
- ITM-024 — the correction loop
- ITM-008 — writes through the authority write path
- ITM-023 — extends tests/test_prompted_change_context.py

## Needs a person

No.
