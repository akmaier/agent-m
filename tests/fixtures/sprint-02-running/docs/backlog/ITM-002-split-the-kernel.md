---
id: ITM-002
title: Split the kernel — artifacts, traceability and personal-data parts out of the approval engine
kind: refactoring
level: 1
realises:
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - UC-024
modules:
  - MOD-review-core
  - MOD-artifacts
  - MOD-traceability
  - MOD-pseudonymiser
  - MOD-dashboard-app
depends_on:
  - ITM-001
origin: backlog refinement 2026-10-01
---
# ITM-002 Split the kernel — artifacts, traceability and personal-data parts out of the approval engine

**REGISTER**

## Outcome

The text formats move into `docs/assets/artifacts.mjs` (`parseFrontMatter`, `parseArchitecture`, `isRequirementName`, `specRequirements`, `reviewedId`, `kindOfPath`, `ARCHITECTURE_FILE`, `isCodePath`, `isTestPath`, `headerModules`, the identifier check of `saveReviewedFile` as `identifierKept`); the derived views move into `docs/assets/traceability.mjs` (`moduleHeaders`, `impactList`, `componentDiagram`); the product's personal-data settings move into `docs/assets/pseudonymiser.mjs` (`parseProductSettings`, `pseudonymisationOn`, `parseCollaborators`, `formatCollaborators`, `addCollaborator`, `removeCollaborator`). `review-core.mjs` keeps the approval engine of MOD-review-core: blob SHA, records, status, last accepted text, line diff, sections and queues, the review session, the review page and the acceptance plan. No expected result changes.

## Realises

- `EVERY ARTIFACT NAMES ITS ORIGIN`
- UC-024 — Implement modules from the architecture

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-003 decision 1 (kernel), ARC-006, ARC-020.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005, ARC-006, ARC-007, ARC-014, ARC-020.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts
- MOD-artifacts (kernel) — uses no other module
- MOD-traceability (kernel) — uses MOD-artifacts, MOD-review-core
- MOD-pseudonymiser (features) — uses MOD-job-harness
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core.mjs`
- `docs/assets/artifacts.mjs` (new)
- `docs/assets/traceability.mjs` (new)
- `docs/assets/pseudonymiser.mjs` (new)
- `docs/assets/review-app.mjs`
- `tests/*.test.mjs` (imports only)
- `tests/test_*.py` (namespace only)

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_origin_links.py` — `EVERY ARTIFACT NAMES ITS ORIGIN`

## Acceptance criteria

From the SPEC's checks:

- `EVERY ARTIFACT NAMES ITS ORIGIN` — `tests/test_origin_links.py`

From the postcondition of UC-024 (Implement modules from the architecture), for the part this item builds:

> - The code reached the default branch only through a pull request whose CI run was green.
> - The job's first commit was a failing test; the module's tests guard named requirements from now on.
> - Every file the job created or changed names the module it belongs to; no file outside the job's
>   modules was changed.
> - The pull request records who implemented it, with which model and Agent M version, and when.

Further:

- Every test green before is green after; no assertion changed.
- Each new file names its one module; `review-core.mjs` names MOD-review-core.
- No module imports a module that its file's `uses:` does not name (MOD-artifacts imports nothing; MOD-traceability imports only MOD-artifacts and MOD-review-core).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-001 — moves code out of the same files after the adapters have left

## Needs a person

No.
