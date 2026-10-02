---
id: ITM-066
title: A Microsoft 365 mailbox over Microsoft Graph — sign-in with PKCE, read without change, drafts, released sends
kind: implementation
level: 1
realises:
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
  - THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING
  - THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - EVERY OUTGOING MAIL IS RELEASED BY A PERSON
  - A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
  - A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
  - UC-037
modules:
  - MOD-mailbox
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-066 A Microsoft 365 mailbox over Microsoft Graph — sign-in with PKCE, read without change, drafts, released sends

**REGISTER**

## Outcome

`MAIL_SCOPES`, `signIn(clientId, redirect)` (authorization code with PKCE for a `spa` redirect, no library) and `mailbox(connection, secret)` on the Graph route: list `Message-ID`s of named folders, read with `GET` only, find by identifier hashes (*not found in the mailbox* rather than a guess), store a reply draft in *Drafts*, send only the released draft; the token only to Graph and Microsoft's token endpoint.

## Realises

- `A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE`
- `AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN`
- `THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING`
- `THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER`
- `READING THE MAILBOX CHANGES NOTHING IN IT`
- `EVERY OUTGOING MAIL IS RELEASED BY A PERSON`
- `A MAIL IS FOUND AGAIN BY ITS IDENTIFIER`
- `A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER`
- UC-037 — Connect a mailbox

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-mailbox (takes over the withdrawn MOD-mail-api); ARC-014 route 1.

Architecture decisions its modules follow: ARC-003, ARC-012, ARC-014.

## Modules

- MOD-mailbox (adapters) — uses MOD-bridge-server

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/mailbox.mjs` (new)
- `tests/test_mail_routes.py`
- `tests/review-core.d/mail-token.test.mjs`
- `tests/fixtures/graph/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER`
- `tests/test_bridge_mail.py` — `READING THE MAILBOX CHANGES NOTHING IN IT`; `A MAIL IS FOUND AGAIN BY ITS IDENTIFIER`
- `tests/test_mail_replies.py` — `A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER`
- `tests/test_mail_routes.py` — `A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE`; `AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN`; `THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING`; `READING THE MAILBOX CHANGES NOTHING IN IT`; `EVERY OUTGOING MAIL IS RELEASED BY A PERSON`

## Acceptance criteria

From the SPEC's checks:

- `A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE` — `tests/test_mail_routes.py` — a Microsoft 365 fixture is read with no bridge request; counter-proof: an IMAP fixture, a Gmail one included, is read only through the bridge.
- `AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN` — `tests/test_mail_routes.py` — the API route stores no password; counter-proof: the IMAP route asks for one.
- `THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING` — `tests/test_mail_routes.py` — the requested scopes are exactly `Mail.ReadWrite`, `Mail.Send` and `offline_access`.
- `THE MAIL SIGN-IN TOKEN GOES ONLY TO ITS PROVIDER` — `tests/review-core.test.mjs` — a request to any other origin carries no mailbox token; counter-proof: the request to the provider carries it.
- `READING THE MAILBOX CHANGES NOTHING IN IT` — `tests/test_bridge_mail.py` — a read against a test server issues no `STORE`, `COPY`, `MOVE`, `EXPUNGE` and no non-peek `FETCH`. On the web-API routes, a read issues no request that modifies a message (`tests/test_mail_routes.py`).
- `EVERY OUTGOING MAIL IS RELEASED BY A PERSON` — `tests/test_mail_routes.py` — on both routes, no send request is made without the click; counter-proof: with it, exactly one.
- `A MAIL IS FOUND AGAIN BY ITS IDENTIFIER` — `tests/test_bridge_mail.py` — a mail moved to a named folder is found; counter-proof: an identifier with no matching mail yields *not found in the mailbox*, never a guess.
- `A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER` — `tests/test_mail_replies.py` — after drafting, the draft is in *Drafts* with `In-Reply-To` set, and no write outside the mailbox contains its text.

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

- ITM-004 — adds its checks under tests/review-core.d/

## Needs a person

No.
