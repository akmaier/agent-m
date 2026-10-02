---
id: ITM-109
title: Gmail and every other mailbox over IMAP and SMTP in the bridge — TLS only, password for one request, confirmed sends
kind: implementation
level: 2
realises:
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
  - THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN
  - A REPLY IS THREADED ON THE REPORTER'S MAIL
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - UC-037
modules:
  - MOD-mailbox
  - MOD-bridge-app
  - MOD-dashboard-app
depends_on:
  - ITM-066
  - ITM-099
  - ITM-106
  - ITM-072
  - ITM-067
origin: backlog refinement 2026-10-01
---
# ITM-109 Gmail and every other mailbox over IMAP and SMTP in the bridge — TLS only, password for one request, confirmed sends

**REGISTER**

## Outcome

`mailRoutes()` of MOD-mailbox on the bridge (`EXAMINE`, `BODY.PEEK[]`, `UID SEARCH HEADER Message-ID`, `APPEND` to *Drafts*, SMTP only with a single-use confirmation naming the SHA-256 of the mail shown; no `LOGIN`/`AUTH` without TLS; the password in one request's variable only, nothing logged but route and outcome) and the browser side over the bridge client; the mailbox settings' *Store and test* for the IMAP route.

## Realises

- `THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE`
- `THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST`
- `THE MAIL SERVER IS REACHED ONLY OVER TLS`
- `THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN`
- `A REPLY IS THREADED ON THE REPORTER'S MAIL`
- `READING THE MAILBOX CHANGES NOTHING IN IT`
- UC-037 — Connect a mailbox

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-mailbox (takes over the withdrawn MOD-bridge-mail); ARC-014 route 2.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005, ARC-011, ARC-012, ARC-014, ARC-017.

## Modules

- MOD-mailbox (adapters) — uses MOD-bridge-server
- MOD-bridge-app (shells) — uses MOD-bridge-server, MOD-bridge-tunnel, MOD-derivation, MOD-git-host, MOD-mailbox, MOD-participants, MOD-run-engine, MOD-settings-store, MOD-test-records
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/mailbox/bridge-routes.mjs` (new)
- `docs/assets/mailbox/bridge-client.mjs` (new)
- `bridge/main.mjs`
- `docs/assets/dashboard/settings/mailbox.mjs`
- `tests/test_bridge_mail.py`
- `tests/test_mail_password_route.py`
- `tests/test_mail_routes.py`
- `tests/fixtures/mail-server/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/test_bridge_mail.py` — `THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST`; `THE MAIL SERVER IS REACHED ONLY OVER TLS`; `THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN`; `A REPLY IS THREADED ON THE REPORTER'S MAIL`; `READING THE MAILBOX CHANGES NOTHING IN IT`
- `tests/test_mail_password_route.py` — `THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE`
- `tests/test_mail_routes.py` — `READING THE MAILBOX CHANGES NOTHING IN IT`

## Acceptance criteria

From the SPEC's checks:

- `THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE` — `tests/test_mail_password_route.py` — every outgoing request of a full mail run is recorded; the password appears only in requests to the bridge address.
- `THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST` — `tests/test_bridge_mail.py` — after a run with a marker password, no file below the bridge's directories and no log line contains it; counter-proof: a bridge that logs the request fails.
- `THE MAIL SERVER IS REACHED ONLY OVER TLS` — `tests/test_bridge_mail.py` — against a local test server without TLS, no `LOGIN`/`AUTH` is sent.
- `THE BRIDGE SENDS ONLY WITH A CONFIRMATION OF THE MAIL SHOWN` — `tests/test_bridge_mail.py` — sending mocked: without confirmation, with a reused one, or with a body changed after the preview, zero SMTP calls.
- `A REPLY IS THREADED ON THE REPORTER'S MAIL` — `tests/test_bridge_mail.py`
- `READING THE MAILBOX CHANGES NOTHING IN IT` — `tests/test_bridge_mail.py` — a read against a test server issues no `STORE`, `COPY`, `MOVE`, `EXPUNGE` and no non-peek `FETCH`. On the web-API routes, a read issues no request that modifies a message (`tests/test_mail_routes.py`).

From the postcondition of UC-037 (Connect a mailbox), for the part this item builds:

> - The mailbox connection exists only in this browser's `localStorage`; no repository, cookie or URL
>   contains any part of it.
> - On the web-API route, Agent M never saw the mailbox password; its token reaches mail only and goes
>   only to the provider. On the IMAP route, the password has left the browser only towards the bridge on
>   the author's machine, and from there only over encrypted connections; the bridge keeps no copy.
> - The mailbox is unchanged: nothing was read as new, moved, flagged or sent.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-066 — the mail interface; extends tests/test_mail_routes.py
- ITM-099 — bridge client
- ITM-106 — mounts the mail routes in bridge/main.mjs after the job runner
- ITM-072 — replyDraft for the threading check
- ITM-067 — the IMAP test on the mailbox settings

## Needs a person

No.

## Notes

Library choice follows ARC-014 (imapflow, nodemailer through Deno's npm compatibility, subject to ITM-122; the fallback named there otherwise).
