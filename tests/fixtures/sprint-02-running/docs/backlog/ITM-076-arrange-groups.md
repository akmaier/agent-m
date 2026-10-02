---
id: ITM-076
title: Arrange requirements, use cases, decisions, modules and tests into groups
kind: implementation
level: 1
realises:
  - A REGROUPING IS COMMITTED DIRECTLY
  - UC-021
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-012
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-076 Arrange requirements, use cases, decisions, modules and tests into groups

**REGISTER**

## Outcome

UC-021: *Arrange* turns a list into its hierarchy; *+ Group*, move by drag or *Move to …* (keyboard reachable), rename, pending changes listed, *Save arrangement* commits only `docs/groups/<kind>.md` after its SHA check; *Propose groups* through a participant.

## Realises

- `A REGROUPING IS COMMITTED DIRECTLY`
- UC-021 — Group artifacts into a hierarchy

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/arrange-view.mjs` (new)
- `docs/assets/jobs/propose-groups/` (new)
- `tests/test_groups.py`
- `tests/dashboard-arrange.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_groups.py` — `A REGROUPING IS COMMITTED DIRECTLY`

## Acceptance criteria

From the SPEC's checks:

- `A REGROUPING IS COMMITTED DIRECTLY` — `tests/test_groups.py`

From the postcondition of UC-021 (Group artifacts into a hierarchy), for the part this item builds:

> - Every item of the arranged kind has exactly one place in its hierarchy; no identifier, no artifact
>   file and no approval status has changed.
> - `docs/groups/<kind>.md` holds the new arrangement; the SPEC and every artifact file are
>   byte-identical to before.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-012 — group files; extends tests/test_groups.py
- ITM-008 — click authority

## Needs a person

No.
