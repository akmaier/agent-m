---
id: ITM-084
title: The process dashboard — progress in the model's measure, gates, blocked, who works on what
kind: implementation
level: 1
realises:
  - UC-035
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-035
  - ITM-037
origin: backlog refinement 2026-10-01
---
# ITM-084 The process dashboard — progress in the model's measure, gates, blocked, who works on what

**REGISTER**

## Outcome

UC-035: the chart of the model's measure, the gates in order (passed, pending, not reached), *Blocked*, *Who works on what*, and the trace behind a cell; nothing written.

## Realises

- UC-035 — Follow progress on the process dashboard

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/progress-view.mjs` (new)
- `tests/dashboard-progress.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-035 (Follow progress on the process dashboard), for the part this item builds:

> - The reader has seen the product's progress in its model's own measure, the state of every gate,
>   what is blocked, and who works on what.
> - Nothing was written. Everything shown was derived at the moment it was shown.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-035 — progress
- ITM-037 — job records
- ITM-162 — the bar on the main page, whose reads and slot the view shares (sprint 03)

## Needs a person

No.

## From the sprint 03 planning

The first slice of UC-035 step 2 — the product's completion as items per state, on the main page — was cut out as
ITM-162 (akmaier's direction of 2026-10-02), the way ITM-147 was cut out of ITM-083. This item keeps the Progress view:
the chart in the model's measure over time, the gates, *Blocked*, *Who works on what* and the trace behind a cell; it
links the bar to Progress once the view exists and takes the bar's counting over from `progress` (ITM-035). It depends on
ITM-162 for the bar's reads and slot, which the view shares.
