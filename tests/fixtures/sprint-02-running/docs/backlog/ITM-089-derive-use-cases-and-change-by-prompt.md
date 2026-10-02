---
id: ITM-089
title: Derive use cases, and change a specification or use case by prompt
kind: implementation
level: 1
realises:
  - UC-007
  - UC-019
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-043
  - ITM-075
  - ITM-040
origin: backlog refinement 2026-10-01
---
# ITM-089 Derive use cases, and change a specification or use case by prompt

**REGISTER**

## Outcome

UC-007 (select requirements, *Run*, one open file per use case) and UC-019 (*Change by prompt*, the run panel, the loop, the difference in the editor, *Refine*, *Save*).

## Realises

- UC-007 — Derive use cases from requirements
- UC-019 — Change a specification or a use case by prompt

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/derive-use-cases-view.mjs` (new)
- `docs/assets/dashboard/prompt-change.mjs` (new)
- `tests/dashboard-derive-use-cases.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-007 (Derive use cases from requirements), for the part this item builds:

> - Each proposed use case is one Markdown file naming the requirements it realises.
> - None of them counts as accepted until UC-008.

From the postcondition of UC-019 (Change a specification or a use case by prompt), for the part this item builds:

> - Only what the author saved — or, through a CI agent, what its workflow committed for review (6b) —
>   was written: a use case as open, or a queue entry beside the current SPEC section; the SPEC itself is
>   unchanged.
> - No requirement was duplicated: a restated rule became a duplicate, a changed rule kept its name.
> - The record of the change names the instruction and the participant that drafted it.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-043 — use-case derivation
- ITM-075 — the editor UC-019 opens
- ITM-040 — runJob

## Needs a person

No.
