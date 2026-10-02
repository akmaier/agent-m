---
id: ITM-090
title: Derive the architecture, and describe a change to it
kind: implementation
level: 1
realises:
  - UC-022
  - UC-023
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-043
  - ITM-048
  - ITM-040
origin: backlog refinement 2026-10-01
---
# ITM-090 Derive the architecture, and describe a change to it

**REGISTER**

## Outcome

UC-022 (selection, run panel, candidates by class, the due-diligence table, the component diagram, *Write proposals*) and UC-023's *Describe the change* route.

## Realises

- UC-022 — Derive the system architecture from requirements and use cases
- UC-023 — Modify the architecture

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/derive-architecture-view.mjs` (new)
- `tests/dashboard-derive-architecture.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-022 (Derive the system architecture from requirements and use cases), for the part this item builds:

> - The product repository holds one open file per proposed decision and per proposed module under
>   `docs/architecture/`; nothing counts as accepted before a person accepts it.
> - No proposal duplicates an existing decision or module: changes stand under their existing
>   identifiers.
> - Every reuse decision carries a due diligence whose facts name where and when they were read.

From the postcondition of UC-023 (Modify the architecture), for the part this item builds:

> - The accepted text of every changed decision and module is named by an approval record; its old text
>   stays reachable in the git history.
> - The reviewer saw, before accepting, every module, code file, test and requirement the change
>   touches.
> - Code still reflects the old architecture until an implementation job changes it.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-043 — architecture derivation
- ITM-048 — due diligence
- ITM-040 — runJob

## Needs a person

No.
