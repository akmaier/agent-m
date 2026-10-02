---
id: ITM-067
title: The mailbox connection on the settings page — route, folders, processing places and their notices
kind: implementation
level: 1
realises:
  - THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE
  - A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
  - THE SHARED PAGES ORIGIN IS DISCLOSED
  - A CLEAR IS A REAL CLEAR
  - UC-037
  - UC-042
modules:
  - MOD-settings-store
  - MOD-dashboard-app
depends_on:
  - ITM-065
  - ITM-066
origin: backlog refinement 2026-10-01
---
# ITM-067 The mailbox connection on the settings page — route, folders, processing places and their notices

**REGISTER**

## Outcome

UC-037 on the settings page: the route chosen from the address (Microsoft 365 → Graph; every other provider, Gmail included, → IMAP through the bridge), the app registration and sign-in steps, the servers and password behind their own notice, the folders, the processing places with the EU notice, *Store and test* (Graph route here; the IMAP test arrives with ITM-109), *Disconnect*; the marks *not an issue* are a named key too.

## Realises

- `THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE`
- `A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT`
- `THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED`
- `THE SHARED PAGES ORIGIN IS DISCLOSED`
- `A CLEAR IS A REAL CLEAR`
- UC-037 — Connect a mailbox
- UC-042 — Manage settings in one place

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-settings-store, MOD-dashboard-app; UC-037, UC-042.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-settings-store (adapters) — uses no other module
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/settings-store.mjs`
- `docs/assets/dashboard/settings/mailbox.mjs` (new)
- `tests/test_settings_page.py`
- `tests/test_settings_disclosure.py`
- `tests/dashboard-settings-mailbox.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_clear_removes_storage.py` — `A CLEAR IS A REAL CLEAR`
- `tests/test_mail_privacy.py` — `THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED`
- `tests/test_settings_disclosure.py` — `THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE`; `A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT`; `THE SHARED PAGES ORIGIN IS DISCLOSED`

## Acceptance criteria

From the SPEC's checks:

- `THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE` — `tests/test_settings_disclosure.py` — the mailbox form stores nothing before the notice is acknowledged.
- `A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT` — `tests/test_settings_disclosure.py`
- `THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED` — `tests/test_mail_privacy.py` — a mail is not sent to a participant whose processing place is not listed; counter-proof: it is sent to one whose place is.
- `THE SHARED PAGES ORIGIN IS DISCLOSED` — `tests/test_settings_disclosure.py`
- `A CLEAR IS A REAL CLEAR` — `tests/test_clear_removes_storage.py`

From the postcondition of UC-037 (Connect a mailbox), for the part this item builds:

> - The mailbox connection exists only in this browser's `localStorage`; no repository, cookie or URL
>   contains any part of it.
> - On the web-API route, Agent M never saw the mailbox password; its token reaches mail only and goes
>   only to the provider. On the IMAP route, the password has left the browser only towards the bridge on
>   the author's machine, and from there only over encrypted connections; the bridge keeps no copy.
> - The mailbox is unchanged: nothing was read as new, moved, flagged or sent.

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

- ITM-065 — changes settings-store.mjs and tests/test_settings_page.py after it
- ITM-066 — Graph sign-in and test

## Needs a person

No.
