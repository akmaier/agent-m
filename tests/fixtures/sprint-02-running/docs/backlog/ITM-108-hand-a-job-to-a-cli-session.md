---
id: ITM-108
title: Hand a job to a CLI session from the dashboard — run view and job dashboard
kind: implementation
level: 2
realises:
  - UC-011
  - UC-034
  - UC-036
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-086
  - ITM-085
  - ITM-105
  - ITM-106
origin: backlog refinement 2026-10-01
---
# ITM-108 Hand a job to a CLI session from the dashboard — run view and job dashboard

**REGISTER**

## Outcome

CLI and sandboxed agents in the run panel and the job panel, with the browser's refusal of loopback named and the HTTPS route offered (UC-011 2a); the job dashboard reads each configured bridge's jobs with its token and names an unreachable one.

## Realises

- UC-011 — Hand a job to a local CLI session
- UC-034 — Implement backlog items with a coding agent
- UC-036 — Inspect running jobs

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/run-view.mjs`
- `docs/assets/dashboard/jobs-view.mjs`
- `tests/dashboard-cli-jobs.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-011 (Hand a job to a local CLI session), for the part this item builds:

> - The artifacts arrived as open; nothing counts as accepted before a person accepts it.
> - The bridge never listened on a non-loopback interface.

From the postcondition of UC-034 (Implement backlog items with a coding agent), for the part this item builds:

> - Each started item has a pull request with failing-then-passing tests. It is either merged on green
>   CI with every gate recorded, or waits, or failed with a reason.
> - No job has continued past a gate without its decider's recorded decision.
> - The dashboards show the new state without anyone setting it (UC-035, UC-036).

From the postcondition of UC-036 (Inspect running jobs), for the part this item builds:

> - The author has seen every reachable job of every product in one place, with state, participant,
>   runtime, elapsed time, cost where known, and log.
> - Every gate passed from this page is recorded with who, when and on which text.
> - A cancelled job wrote nothing after its cancel. A retry is a new job that names the one it retries.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-086 — the run view
- ITM-085 — the job dashboard
- ITM-105 — CLI driver
- ITM-106 — the bridge runs jobs

## Needs a person

No.
