---
id: ITM-136
title: A browser setting's line keeps its last test across reloads — works since a date, or refused at the last use
kind: implementation
level: 1
realises:
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - UC-042
modules:
  - MOD-settings-store
  - MOD-dashboard-app
depends_on:
  - ITM-125
  - ITM-130
origin: sprint 01 review
---
# ITM-136 A browser setting's line keeps its last test across reloads — works since a date, or refused at the last use

**REGISTER**

## Outcome

UC-042 step 1: each browser setting's line shows ✓ *works* with the date of the last successful test, or ✗ *refused* when
the server refused it at the last use — also after a reload. Today both are kept for the page only (`tokenState` in
memory, in `dashboard-app.mjs` and the views that set it); after a reload a token shows "stored — not tested on this page
yet" (`docs/measurements/2026-10-01_built-flows-characterised.md`, section 3). The date and the outcome are kept in this
browser through MOD-settings-store, beside the setting they describe; *Clear* removes them with it (`A CLEAR IS A REAL
CLEAR`), and the export carries them like every browser setting.

## Realises

- `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`
- `EVERY SETTING IS REACHED FROM ONE PAGE` — the new keys have their place on the page
- UC-042 — Manage settings in one place (step 1)

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 13): a flow ITM-123 found not carried out. No
existing item builds it.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-settings-store (adapters) — uses no other module
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/settings-store.mjs` (the last test's date and outcome per setting, cleared with it)
- `docs/assets/dashboard-app.mjs`, `docs/assets/dashboard/settings-view.mjs` (read and write the kept state instead of `tokenState` in memory)
- `tests/dashboard-settings-last-test.test.mjs` (new — run in `tests/app-harness.mjs`)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_settings_page.py` — `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`; `EVERY SETTING IS REACHED FROM ONE PAGE`

## Acceptance criteria

From the postcondition of UC-042 (Manage settings in one place), for the part this item builds:

> - The person has seen every setting Agent M uses, where it is kept, and whether it works.

Further:

- After a successful *Test* and a reload, the token's line shows ✓ *works* with that date; after a refused request and a reload, ✗ *refused*; counter-proof: the dashboard of today shows "not tested on this page yet" after the reload.
- *Clear* removes the kept date and outcome with the setting; `tests/test_settings_page.py` finds every new key on the page.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-125 — changes `docs/assets/settings-store.mjs` first
- ITM-130 — changes `docs/assets/dashboard-app.mjs` and `docs/assets/dashboard/settings-view.mjs` first

## Needs a person

No.
