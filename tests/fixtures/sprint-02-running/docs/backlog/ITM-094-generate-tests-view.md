---
id: ITM-094
title: Tests → Generate a multi-level battery
kind: implementation
level: 1
realises:
  - UC-026
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-044
  - ITM-057
  - ITM-040
origin: backlog refinement 2026-10-01
---
# ITM-094 Tests → Generate a multi-level battery

**REGISTER**

## Outcome

UC-026: uncovered combinations preselected, levels explained, the implementer left out for release tests, cases beside existing tests, *Write tests* as a job that runs each test, plants a fault and opens a pull request with the counter-proofs.

## Realises

- UC-026 — Generate a multi-level test battery

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/tests-generate-view.mjs` (new)
- `tests/dashboard-tests-generate.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-026 (Generate a multi-level test battery), for the part this item builds:

> - Every new test has a `TST-` identifier, one level, the identifiers it guards and an expected
>   result readable without running it.
> - Every new automated test has a recorded counter-proof, or is marked as awaiting implementation.
> - No new test duplicates an existing one; extensions name the test they extend.
> - The tests reach the default branch only through a pull request with green CI.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-044 — test-generation input
- ITM-057 — battery checks
- ITM-040 — runJob

## Needs a person

No.
