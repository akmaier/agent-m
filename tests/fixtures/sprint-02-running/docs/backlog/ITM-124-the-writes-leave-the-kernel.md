---
id: ITM-124
title: The writes leave the kernel — the dashboard's five commits move into the dashboard, the product-settings line into the pseudonymiser
kind: refactoring
level: 1
realises:
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - UC-024
modules:
  - MOD-review-core
  - MOD-dashboard-app
  - MOD-pseudonymiser
depends_on:
  - ITM-007
origin: sprint 01, PO decision of 2026-10-01 at the start of ITM-008
---
# ITM-124 The writes leave the kernel — the dashboard's five commits move into the dashboard, the product-settings line into the pseudonymiser

**REGISTER**

## Outcome

The five functions of `review-core.mjs` that write — `saveReviewedFile`, `acceptItems`, `addProduct`, `savePseudonymisation`, `saveCollaborators` — move, with their signatures, their `click` parameter and their behaviour unchanged, into `docs/assets/dashboard/writes.mjs` (MOD-dashboard-app); the three views that call them (`review-views.mjs`, `settings-view.mjs`, `add-product-view.mjs`) import them from there. `setProductSetting`, `PRODUCT_SETTINGS_PATH` and `COLLABORATORS_PATH` move into `pseudonymiser.mjs` (MOD-pseudonymiser), whose test already exercises the function. The kernel keeps the pure functions the writes call — `planAcceptance`, `missingNeeds`, `missingLayout` — and no longer imports `commitFiles`, `commitFilesGitLab`, `writeFiles`, `gitlabProject` or `gitlabSnapshot` from the git host, nor anything from the pseudonymiser: it returns the files, and the shell commits them (MOD-review-core; ARC-003 decision 1). `addProduct` takes its own `isTrusted` check with it. The checks of the five writes move with them, unchanged, out of the test files of MOD-review-core into files of MOD-dashboard-app. The write path of MOD-git-host, its `click` parameter and its tests stay as they are. No expected result changes.

## Realises

- `EVERY ARTIFACT NAMES ITS ORIGIN`
- UC-024 — Implement modules from the architecture

## Where it came from

Sprint 01, 2026-10-01: the developer of ITM-008 stopped before writing, because the write path cannot take an authority without the five kernel functions that call it changing too — and MOD-review-core is not among ITM-008's modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`). The move itself is owed to the accepted architecture regardless of ITM-008: MOD-review-core "never writes itself — it returns the files, and a shell commits them on its authority", and a kernel module "imports only kernel modules" (ARC-003 decision 1). ITM-001 moved the requests into the git host and left the orchestration that calls them in the kernel; this item closes that gap (PO decision in `docs/backlog/sprints/sprint-01.md`, *Selection changed on 2026-10-01*).

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005, ARC-006, ARC-007, ARC-014, ARC-020.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items
- MOD-pseudonymiser (features) — uses MOD-job-harness

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core.mjs` (the five writes, `setProductSetting` and the two path constants leave; the imports they needed go with them)
- `docs/assets/dashboard/writes.mjs` (new — the five writes, naming MOD-dashboard-app)
- `docs/assets/pseudonymiser.mjs` (`setProductSetting`, `PRODUCT_SETTINGS_PATH`, `COLLABORATORS_PATH`)
- `docs/assets/dashboard/review-views.mjs` (imports only)
- `docs/assets/dashboard/settings-view.mjs` (imports only)
- `docs/assets/dashboard/add-product-view.mjs` (imports only)
- `docs/assets/dashboard-app.mjs` (the comments that say where the writes live)
- `tests/review-core.test.mjs`, `tests/architecture.test.mjs`, `tests/review-page-core.test.mjs` (the checks of the five writes move out; header lines follow)
- `tests/review-core.d/dashboard-writes.test.mjs` (new — the moved node checks, unchanged, naming MOD-dashboard-app)
- `tests/test_settings_in_the_core.py` (its `savePseudonymisation` check moves back into `tests/test_settings_page.py`, which SPEC.md names for `A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY`)
- `tests/test_settings_page.py` (takes that check)
- `tests/review-core.d/pseudonymiser.test.mjs` (import only)

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

- Every test green before is green after, with no assertion changed: the diff of the test files shows moved blocks, import lines and header lines only.
- `review-core.mjs` names none of `commitFiles`, `commitFilesGitLab`, `writeFiles`, `gitlabProject`, `gitlabSnapshot`, `SETTING_LINE`, `formatCollaborators` outside a comment and imports nothing from `pseudonymiser.mjs`; a repository check in a test file of MOD-dashboard-app, beside the `fetch` check of ARC-003 decision 6, refuses a kernel file that imports one of the three write functions of the git host — red on a planted `writeFiles` import in `review-core.mjs` (counter-proof recorded in a dated file in `docs/measurements/`).
- The checks SPEC.md names at `tests/review-core.test.mjs` and `tests/test_settings_page.py` are reached under those paths after the move (the first runs every file of `tests/review-core.d/`).
- A synthetic click still writes nothing: `addProduct` with `{ isTrusted: false }` rejects as before, and `writeFiles` without a trusted click rejects as before — the same expectations, in their new files.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-007 — changes the imports of the settings view after ITM-007's last text fix in it

## Needs a person

No.

## Notes

ITM-008 follows this item: it turns the `click` the moved writes hand to `writeFiles` into the authority of ARC-003 decision 3, with its modules exactly where the click and the write path live. The kernel's reads through the git host (`readBlob`, `recordCommittedAt`, `lastAccepted` and `deriveTarget` call `fetchText`) stay as they are; they are a question for the next refinement, not this item.
