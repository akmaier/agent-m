---
id: ITM-122
title: Measure imapflow and nodemailer inside the compiled bridge, Gmail with an app password
kind: measurement
level: 2
realises:
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
  - READING THE MAILBOX CHANGES NOTHING IN IT
modules: []
depends_on:
  - ITM-109
  - ITM-102
origin: backlog refinement 2026-10-01
---
# ITM-122 Measure imapflow and nodemailer inside the compiled bridge, Gmail with an app password

**REGISTER**

## Outcome

ARC-014 open measurement 1: the compiled bridge reads a mailbox of more than 1 MB over implicit TLS and STARTTLS and sends over 465 and 587, against a local test server and against Gmail with an app password; if one fails, the fallback of ARC-014 is built with its due diligence re-read.

## Realises

- `THE MAIL SERVER IS REACHED ONLY OVER TLS`
- `READING THE MAILBOX CHANGES NOTHING IN IT`

## Where it came from

ARC-014 consequences (open measurement 1).

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `docs/measurements/<date>_mail-libraries-in-the-bridge.md` (new)

## Kind and level

- Job kind: **measurement** — not a coding job: a person measures or decides, and the result is a dated file in `docs/measurements/`.
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Checks of the SPEC this measurement bears on

- `tests/test_bridge_mail.py` — `THE MAIL SERVER IS REACHED ONLY OVER TLS`; `READING THE MAILBOX CHANGES NOTHING IN IT`
- `tests/test_mail_routes.py` — `READING THE MAILBOX CHANGES NOTHING IN IT`

## Acceptance criteria

From the SPEC's checks:

- `THE MAIL SERVER IS REACHED ONLY OVER TLS` — `tests/test_bridge_mail.py` — against a local test server without TLS, no `LOGIN`/`AUTH` is sent.
- `READING THE MAILBOX CHANGES NOTHING IN IT` — `tests/test_bridge_mail.py` — a read against a test server issues no `STORE`, `COPY`, `MOVE`, `EXPUNGE` and no non-peek `FETCH`. On the web-API routes, a read issues no request that modifies a message (`tests/test_mail_routes.py`).

Further:

- The measurement file states its method, date, environment and every raw result, and is not edited afterwards.
- Where the result contradicts the architecture, it is reported as a finding to the PO; nothing in SPEC.md, the use cases or the architecture is changed by this item.

## Depends on

- ITM-109 — the mail routes
- ITM-102 — the compiled bridge

## Needs a person

A person with a Gmail account that offers app passwords (2-Step Verification on); the password never enters the repository.
