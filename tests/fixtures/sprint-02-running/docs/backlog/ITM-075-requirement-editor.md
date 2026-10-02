---
id: ITM-075
title: Edit or add a requirement on the dashboard — saved as a proposal beside the current text
kind: implementation
level: 1
realises:
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - A REFUSED SAVE KEEPS THE EDIT
  - A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED
  - UC-018
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-015
  - ITM-018
  - ITM-009
origin: backlog refinement 2026-10-01
---
# ITM-075 Edit or add a requirement on the dashboard — saved as a proposal beside the current text

**REGISTER**

## Outcome

UC-018 for requirements: the editor with live preview opened from a requirement or *+ Requirement*, marks for a missing field or a conjunction, the *Why* field, the impact list, *Save* as one commit of a queue entry (SPEC.md untouched), a refused save keeping the edit beside the newer text, the GitHub fallback without a token.

## Realises

- `A SPEC EDIT IS SAVED AS A PROPOSAL`
- `A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE`
- `A REFUSED SAVE KEEPS THE EDIT`
- `A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`
- UC-018 — Edit a specification or a use case in the dashboard

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/requirement-editor.mjs` (new)
- `tests/dashboard-requirement-editor.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A SPEC EDIT IS SAVED AS A PROPOSAL`; `A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE`; `A REFUSED SAVE KEEPS THE EDIT`; `A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`

## Acceptance criteria

From the SPEC's checks:

- `A SPEC EDIT IS SAVED AS A PROPOSAL` — `tests/review-core.test.mjs` — a save from the editor leaves `SPEC.md` byte-identical.
- `A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE` — `tests/review-core.test.mjs`
- `A REFUSED SAVE KEEPS THE EDIT` — `tests/review-core.test.mjs`
- `A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED` — `tests/review-core.test.mjs`

From the postcondition of UC-018 (Edit a specification or a use case in the dashboard), for the part this item builds:

> - A use case: the edited text is on the default branch and counts as open until an approval record
>   names its SHA (UC-008).
> - A requirement: a queue entry holds the edited section beside the current one; `SPEC.md` is
>   unchanged until the entry is accepted (UC-006).
> - No identifier changed; a renamed requirement left a withdrawal note behind.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-015 — proposeEdit
- ITM-018 — impact list
- ITM-009 — the marks of the five fields

## Needs a person

No.
