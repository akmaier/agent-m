---
id: ITM-092
title: Tests → Schedule — levels by occasion, runners, secrets by name, one pull request
kind: implementation
level: 1
realises:
  - UC-027
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-059
  - ITM-061
  - ITM-055
origin: backlog refinement 2026-10-01
---
# ITM-092 Tests → Schedule — levels by occasion, runners, secrets by name, one pull request

**REGISTER**

## Outcome

UC-027: the schedule table with the book's default marked, cells that cannot be ticked explained, nightly time and runners, the secrets by name with their pages, *Save* as one pull request with schedule and generated configuration.

## Realises

- UC-027 — Configure continuous integration

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/tests-schedule-view.mjs` (new)
- `tests/dashboard-tests-schedule.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-027 (Configure continuous integration), for the part this item builds:

> - The product's repository holds the schedule and a CI configuration generated from it.
> - Every commit and pull request runs the levels ticked for them, without calls to paid services.
> - A release candidate runs every test at every level.
> - No secret value is in the repository or in Agent M; the needed secrets are named.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-059 — the generator
- ITM-061 — secrets and runners
- ITM-055 — pull requests

## Needs a person

No.
