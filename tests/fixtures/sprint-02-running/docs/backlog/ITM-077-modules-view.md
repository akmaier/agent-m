---
id: ITM-077
title: The modules view — what each module realises, its code and tests, every gap, the component diagram
kind: implementation
level: 1
realises:
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
  - UC-025
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-018
origin: backlog refinement 2026-10-01
---
# ITM-077 The modules view — what each module realises, its code and tests, every gap, the component diagram

**REGISTER**

## Outcome

UC-025: one row per module, the gaps with their next step (*Derive architecture*, *Implement*), the component diagram with gaps marked.

## Realises

- `MODULE GAPS ARE REPORTED, NOT FORBIDDEN`
- UC-025 — Validate modules against specification and tests

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/modules-view.mjs` (new)
- `tests/dashboard-modules.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_coverage_report.py` — `MODULE GAPS ARE REPORTED, NOT FORBIDDEN`

## Acceptance criteria

From the SPEC's checks:

- `MODULE GAPS ARE REPORTED, NOT FORBIDDEN` — `tests/test_coverage_report.py`

From the postcondition of UC-025 (Validate modules against specification and tests), for the part this item builds:

> - Nothing is written; the module view and its diagram are computed each time, never stored.
> - Every gap is shown, and none of them blocks a job.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-018 — module rows and gaps

## Needs a person

No.
