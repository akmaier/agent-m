---
id: ITM-087
title: Close a sprint — review of the increment and retrospective on the dashboard
kind: implementation
level: 1
realises:
  - UC-041
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-036
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-087 Close a sprint — review of the increment and retrospective on the dashboard

**REGISTER**

## Outcome

UC-041: the increment and the items not done, feedback lines, the unfinished items' destinations, the retrospective with the sprint's numbers, *Close sprint* only with a retrospective entry, *Merge increment* for a sprint branch.

## Realises

- UC-041 — Close a sprint with review and retrospective

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/sprint-close-view.mjs` (new)
- `tests/dashboard-sprint-close.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-041 (Close a sprint with review and retrospective), for the part this item builds:

> - The product repository holds, for the sprint, one record with the review of its increment and the
>   retrospective; feedback is in the backlog as items that name what they realise.
> - Every selected item is either done, back in the backlog, or selected for the next sprint.
> - With a sprint branch, the increment is in the default branch only if the Product Owner merged it.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-036 — sprintClose
- ITM-008 — click authority

## Needs a person

No.
