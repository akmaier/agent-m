---
id: ITM-088
title: Derive requirements from a source on the dashboard
kind: implementation
level: 1
realises:
  - UC-005
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-042
  - ITM-040
  - ITM-064
origin: backlog refinement 2026-10-01
---
# ITM-088 Derive requirements from a source on the dashboard

**REGISTER**

## Outcome

UC-005: linked source and part, hash check, the run panel with destination, excerpt and the number of existing requirements, *Run*, the loop's rounds, the candidates by class beside what they refer to, conflicts decided, *Write proposals*.

## Realises

- UC-005 — Derive requirements from a source

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/derive-requirements-view.mjs` (new)
- `tests/dashboard-derive-requirements.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-005 (Derive requirements from a source), for the part this item builds:

> - The product repository holds a queue of proposals; the SPEC itself is unchanged until entries are
>   accepted.
> - No proposal duplicates an existing requirement: what the source adds is new, what it alters is a
>   change under the existing name, what it repeats is an added source.
> - Each proposal names its source passage, the source version and the participant that produced it.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-042 — proposals
- ITM-040 — runJob in the tab
- ITM-064 — endpoint participants

## Needs a person

No.
