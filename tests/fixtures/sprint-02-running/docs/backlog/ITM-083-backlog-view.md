---
id: ITM-083
title: The backlog — order, propose items, plan a sprint, pull under the WIP limit
kind: implementation
level: 1
realises:
  - UC-032
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-033
  - ITM-034
  - ITM-008
  - ITM-147
origin: backlog refinement 2026-10-01
---
# ITM-083 The backlog — order, propose items, plan a sprint, pull under the WIP limit

**REGISTER**

## Outcome

UC-032, the writes: *Propose items* through a participant, *+ Item*, reorder and *Save order*, *Plan sprint* with selection and closer, *Pull* under the WIP limit and *End sprint*. The read part — items in order with their derived state, uncovered requirements on top, the running sprint's board under the limit — is ITM-147 (*From the sprint 02 planning*), whose view this item extends.

## Realises

- UC-032 — Maintain the backlog

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/backlog-view.mjs` (created by ITM-147; the writes added here)
- `docs/assets/jobs/propose-backlog-items/` (the job definition ITM-033 writes, wired to *Propose items*)
- `tests/dashboard-backlog.test.mjs` (created by ITM-147; the write tests added here)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-032 (Maintain the backlog), for the part this item builds:

> - The product repository holds its backlog as one Markdown file per item, plus an order and, in
>   Scrum, the sprint selections. No state is stored in them. State is derived from approvals, jobs
>   and pull requests.
> - Every item names what it realises and where it came from.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-033 — items
- ITM-034 — states, sprints, WIP
- ITM-008 — click authority
- ITM-147 — the view this item adds its writes to

## Needs a person

No.

## From the sprint 02 planning

The read part of UC-032 — the backlog in order with derived states, the uncovered names, the running sprint's board
under the limit — was cut out as ITM-147, the first slice of the process dashboard (akmaier's wish of 2026-10-01).
This item keeps every write and depends on ITM-147.
