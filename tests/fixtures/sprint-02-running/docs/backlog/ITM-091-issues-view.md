---
id: ITM-091
title: Handle an issue — analyse, bug or change, fix job or SPEC change, move to the backlog
kind: implementation
level: 1
realises:
  - UC-012
  - UC-033
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-044
  - ITM-033
  - ITM-055
  - ITM-040
origin: backlog refinement 2026-10-01
---
# ITM-091 Handle an issue — analyse, bug or change, fix job or SPEC change, move to the backlog

**REGISTER**

## Outcome

UC-012 (analyse with a participant, confirm the class, a fix job with a regression test first, or a SPEC change queue naming the issue) and UC-033 (*Move to backlog*: item prefilled, comment and label on the issue).

## Realises

- UC-012 — Handle an issue — bug fix or specification change
- UC-033 — Move an issue into the backlog

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/issues-view.mjs` (new)
- `tests/dashboard-issues.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-012 (Handle an issue — bug fix or specification change), for the part this item builds:

> - A bug is fixed with a regression test that guards it from now on; the specification is unchanged.
> - A change is in the specification before any code implements it, and the accepted entry names the
>   issue it came from.

From the postcondition of UC-033 (Move an issue into the backlog), for the part this item builds:

> - The backlog holds an item that names the issue as its origin, and what it realises.
> - The issue names the item.
> - No implementation job can start for a change item before its specification change is accepted.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-044 — issue triage
- ITM-033 — itemFromIssue
- ITM-055 — issues
- ITM-040 — runJob

## Needs a person

No.
