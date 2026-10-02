---
id: ITM-086
title: Run the process over a selection, start sprint work, implement a module
kind: implementation
level: 1
realises:
  - UC-043
  - UC-034
  - UC-024
  - UC-023
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-039
  - ITM-040
  - ITM-061
origin: backlog refinement 2026-10-01
---
# ITM-086 Run the process over a selection, start sprint work, implement a module

**REGISTER**

## Outcome

UC-043 (selection with the dependency diagram, the plan from the model, limits, *Start run*, the validation at its end), UC-034 (*Start sprint work*, the reasons an item cannot start) and UC-024 / UC-023 step 6 (*Implement* on a module, the job panel). Jobs for CI agents at level 1; CLI agents arrive with ITM-108.

## Realises

- UC-043 — Run the process over a selection
- UC-034 — Implement backlog items with a coding agent
- UC-024 — Implement modules from the architecture
- UC-023 — Modify the architecture

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/run-view.mjs` (new)
- `docs/assets/dashboard/review-views.mjs` (the Implement buttons on the architecture views)
- `tests/dashboard-run.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-043 (Run the process over a selection), for the part this item builds:

> - Every selected module has code and tests merged through pull requests whose Definition of Done held, or
>   is listed with the job that failed or the gate that waits.
> - The run's record names the selection, the limits, every job it started and the end state; each job's
>   record names the run.
> - The author clicked to start, and wherever the model gave a gate to a person — nowhere else.

From the postcondition of UC-034 (Implement backlog items with a coding agent), for the part this item builds:

> - Each started item has a pull request with failing-then-passing tests. It is either merged on green
>   CI with every gate recorded, or waits, or failed with a reason.
> - No job has continued past a gate without its decider's recorded decision.
> - The dashboards show the new state without anyone setting it (UC-035, UC-036).

From the postcondition of UC-024 (Implement modules from the architecture), for the part this item builds:

> - The code reached the default branch only through a pull request whose CI run was green.
> - The job's first commit was a failing test; the module's tests guard named requirements from now on.
> - Every file the job created or changed names the module it belongs to; no file outside the job's
>   modules was changed.
> - The pull request records who implemented it, with which model and Agent M version, and when.

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

- ITM-039 — nextJobs and runPlan
- ITM-040 — runJob
- ITM-061 — CI-agent driver and workflows

## Needs a person

No.
