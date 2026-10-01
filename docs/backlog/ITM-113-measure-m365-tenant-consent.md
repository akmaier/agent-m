---
id: ITM-113
title: Measure whether a user at FAU may consent to the three mail permissions
kind: measurement
level: 1
realises:
  - AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
  - THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING
modules: []
depends_on:
  - ITM-066
origin: backlog refinement 2026-10-01
---
# ITM-113 Measure whether a user at FAU may consent to the three mail permissions

**REGISTER**

## Outcome

ARC-014 open measurement 2: with a test `spa` app registration, whether FAU's tenant lets a user consent to `Mail.ReadWrite`, `Mail.Send` and `offline_access`, and what the sign-in window shows.

## Realises

- `AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN`
- `THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING`

## Where it came from

ARC-014 consequences (open measurement 2).

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `docs/measurements/<date>_m365-consent.md` (new)

## Kind and level

- Job kind: **measurement** — not a coding job: a person measures or decides, and the result is a dated file in `docs/measurements/`.
- Level: **1** — browser and hosted CI; nothing installed.

## Checks of the SPEC this measurement bears on

- `tests/test_mail_routes.py` — `AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN`; `THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING`

## Acceptance criteria

From the SPEC's checks:

- `AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN` — `tests/test_mail_routes.py` — the API route stores no password; counter-proof: the IMAP route asks for one.
- `THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING` — `tests/test_mail_routes.py` — the requested scopes are exactly `Mail.ReadWrite`, `Mail.Send` and `offline_access`.

Further:

- The measurement file states its method, date, environment and every raw result, and is not edited afterwards.
- Where the result contradicts the architecture, it is reported as a finding to the PO; nothing in SPEC.md, the use cases or the architecture is changed by this item.

## Depends on

- ITM-066 — the sign-in to test with

## Needs a person

A person with an FAU Microsoft 365 account and the right to register a test app (or the tenant's administrators) — the consent decision belongs to the institution.
