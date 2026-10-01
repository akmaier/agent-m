---
id: ITM-063
title: Browser end-to-end tests with Playwright against the dashboard and local fake servers
kind: implementation
level: 1
realises:
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - A REFUSED SAVE KEEPS THE EDIT
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-063 Browser end-to-end tests with Playwright against the dashboard and local fake servers

**REGISTER**

## Outcome

ARC-016 kind 3: Chromium, Firefox and WebKit drive the dashboard served from `docs/` locally, with the git host and the bridge replaced by local fake servers — a click that commits, a refused save that keeps the edit, Show and Clear on the settings page. The same harness can run the reachability measurements on a schedule. Playwright is a development dependency in CI only, never served and never compiled into the bridge.

## Realises

- `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK`
- `A REFUSED SAVE KEEPS THE EDIT`
- `A STORED SECRET IS HIDDEN UNTIL SHOWN`
- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-016 decision 3 (with its due diligence).

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/e2e/` (new)
- `tests/e2e/fake-servers/` (new)
- `playwright.config.mjs` (new)
- `.github/workflows/tests.yml`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK`; `A REFUSED SAVE KEEPS THE EDIT`
- `tests/test_measurement_present.py` — `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`
- `tests/test_settings_page.py` — `A STORED SECRET IS HIDDEN UNTIL SHOWN`

## Acceptance criteria

From the SPEC's checks:

- `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK` — `tests/review-core.test.mjs`
- `A REFUSED SAVE KEEPS THE EDIT` — `tests/review-core.test.mjs`
- `A STORED SECRET IS HIDDEN UNTIL SHOWN` — `tests/test_settings_page.py` — a stored secret is rendered hidden; counter-proof: after *Show* it appears in full.
- `BROWSER REACHABILITY IS MEASURED, NOT ASSUMED` — `tests/test_measurement_present.py` — a released runtime has a dated measurement file.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-008 — the authority write path the tests drive

## Needs a person

No.
