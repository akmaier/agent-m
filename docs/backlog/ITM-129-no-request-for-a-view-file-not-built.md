---
id: ITM-129
title: A page load asks for no view or settings file that is not built yet — no 404 per planned view
kind: implementation
level: 1
realises:
  - UC-024
modules:
  - MOD-dashboard-app
depends_on: []
origin: sprint 01 review
---
# ITM-129 A page load asks for no view or settings file that is not built yet — no 404 per planned view

**REGISTER**

## Outcome

The dashboard shell (`docs/assets/dashboard-app.mjs`, the table `DASHBOARD`) learns which view and settings-section files
exist without requesting each planned file. Today every page load on GitHub Pages costs one `404` for each planned view
with a tab whose file is not built yet — the table names them, and the tab bar asks for each to find out (15 at the end
of sprint 01: the table names 39 view and section files, 31 of them not built, 15 of those with a tab). After this item a page load requests only files that exist, and a view whose file is missing is still not
shown, as ITM-003 made it. How the shell knows — a list kept beside the view files, written by the item that adds a
view, or asking on first use only — is the implementer's choice inside MOD-dashboard-app.

## Realises

- UC-024 — Implement modules from the architecture (the shell of MOD-dashboard-app, views loaded by name)

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 1): ITM-003 made the views files of their own,
loaded by name from one table; the table lists the files of views not built yet, and finding out costs one failed request
each.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard-app.mjs` (how the shell knows which files exist)
- `tests/dashboard-shell.test.mjs` (a page load requests no missing file)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises a use case only; its tests are the files listed above.

## Acceptance criteria

From the postcondition of UC-024 (Implement modules from the architecture), for the part this item builds:

> - Every file the job created or changed names the module it belongs to; no file outside the job's
>   modules was changed.

Further:

- In `tests/app-harness.mjs`, a load of every address of today requests no file below `docs/assets/dashboard/` that does not exist; counter-proof: the shell of today requests each missing one.
- The tab bar and every view of today are shown as before (the checks of `tests/dashboard-shell.test.mjs` keep their expectations); a view whose file is missing is still not shown.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- nothing

## Needs a person

No.
