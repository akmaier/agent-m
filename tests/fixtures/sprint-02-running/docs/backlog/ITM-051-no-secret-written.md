---
id: ITM-051
title: No secret in the repository — a generated artifact holding a configured secret fails the run
kind: implementation
level: 1
realises:
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-run-engine
depends_on:
  - ITM-040
  - ITM-047
origin: backlog refinement 2026-10-01
---
# ITM-051 No secret in the repository — a generated artifact holding a configured secret fails the run

**REGISTER**

## Outcome

`runJob` compares every file it would commit with the secret values its runtime holds (passed in as a port, never logged) and fails the run, writing nothing, when one appears.

## Realises

- `NO SECRET IN THE REPOSITORY`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — SPEC §0 `NO SECRET IN THE REPOSITORY`; ARC-010 decision 8.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007, ARC-010.

## Modules

- MOD-run-engine (kernel) — uses MOD-job-harness, MOD-process-model, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/run-engine/run-job.mjs`
- `tests/test_no_secret_written.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_no_secret_written.py` — `NO SECRET IN THE REPOSITORY`

## Acceptance criteria

From the SPEC's checks:

- `NO SECRET IN THE REPOSITORY` — `tests/test_no_secret_written.py` — a generated artifact containing a configured secret value fails the run.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-040 — the executor that refuses the write
- ITM-047 — extends tests/test_no_secret_written.py

## Needs a person

No.
