---
id: ITM-081
title: Configure a process model — adapt or create, validated, with a live diagram and a plan preview
kind: implementation
level: 1
realises:
  - UC-031
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-028
  - ITM-035
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-081 Configure a process model — adapt or create, validated, with a live diagram and a plan preview

**REGISTER**

## Outcome

UC-031: the catalogue and the instance's models, *Adapt*, *+ New model*, one form section per part, errors beside their fields, the live Mermaid diagram, the plan preview for a planned model, *Save* only without errors.

## Realises

- UC-031 — Configure a process model

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/process-models-view.mjs` (new)
- `tests/dashboard-process-models.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-031 (Configure a process model), for the part this item builds:

> - The instance holds a valid process model definition as data. Agent M's code is unchanged
>   (`THE CATALOGUE IS DATA`).
> - Products can choose the model in UC-002. For a *planned* model, their plan covers every accepted
>   requirement in every phase (UC-035). For a *pulled* model, their work comes from a backlog
>   (UC-032).

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-028 — shipped catalogue
- ITM-035 — plan preview
- ITM-008 — click authority

## Needs a person

No.
