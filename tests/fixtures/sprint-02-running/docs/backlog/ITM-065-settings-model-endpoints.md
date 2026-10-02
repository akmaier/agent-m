---
id: ITM-065
title: Model endpoints on the settings page — stored, tested and cleared in this browser
kind: implementation
level: 1
realises:
  - CONFIGURATION LIVES IN THE BROWSER
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - A CLEAR IS A REAL CLEAR
  - UC-003
  - UC-042
modules:
  - MOD-settings-store
  - MOD-dashboard-app
depends_on:
  - ITM-064
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-065 Model endpoints on the settings page — stored, tested and cleared in this browser

**REGISTER**

## Outcome

Endpoint address, model and key are named keys of the browser store with a row on the settings page — hidden key with Show, Test (one short request, the endpoint's own error message shown), Change, Clear — and are exported and imported with the other settings.

## Realises

- `CONFIGURATION LIVES IN THE BROWSER`
- `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`
- `A CREDENTIAL IS NEVER PLACED IN A URL`
- `A CLEAR IS A REAL CLEAR`
- UC-003 — Configure a model endpoint
- UC-042 — Manage settings in one place

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-settings-store `browserStore`, `settingKeys`; UC-003, UC-042.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-settings-store (adapters) — uses no other module
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/settings-store.mjs`
- `docs/assets/dashboard/settings/endpoints.mjs` (new)
- `tests/test_settings_page.py`
- `tests/dashboard-settings-endpoints.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_clear_removes_storage.py` — `A CLEAR IS A REAL CLEAR`
- `tests/test_config_client_side.py` — `CONFIGURATION LIVES IN THE BROWSER`
- `tests/test_no_credential_in_url.py` — `A CREDENTIAL IS NEVER PLACED IN A URL`
- `tests/test_settings_page.py` — `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN`

## Acceptance criteria

From the SPEC's checks:

- `CONFIGURATION LIVES IN THE BROWSER` — `tests/test_config_client_side.py`
- `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN` — `tests/test_settings_page.py`
- `A CREDENTIAL IS NEVER PLACED IN A URL` — `tests/test_no_credential_in_url.py`
- `A CLEAR IS A REAL CLEAR` — `tests/test_clear_removes_storage.py`

From the postcondition of UC-003 (Configure a model endpoint), for the part this item builds:

> - The configuration exists only in this browser.
> - The key has not appeared in a URL, a cookie, or any repository.

From the postcondition of UC-042 (Manage settings in one place), for the part this item builds:

> - The person has seen every setting Agent M uses, where it is kept, and whether it works.
> - Browser settings changed or cleared here are changed or cleared in `localStorage` itself; repository
>   settings changed here are commits under the person's account.
> - No secret was shown in full except on **Show**, written to a repository, or put into a URL; an export
>   holds them only after the notice.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-064 — the test request goes through the driver
- ITM-008 — the settings view after the write-path change

## Needs a person

No.
