---
id: ITM-420
title: The Bridge's test of a mailbox over IMAP and SMTP
level: module
realises:
  - UC-037
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
modules:
  - MOD-mail-protocols
builds_on:
  - ITM-419
tests:
  - unit
origin:
  - UC-037 step 7, 7b, 7c, 7d
---
# ITM-420 The Bridge's test of a mailbox over IMAP and SMTP

**REGISTER**

## Outcome

MOD-mail-protocols, as its file states it, begun in `src/mail-protocols/`: `mailHandlers` with the operation `test` — a
login to the IMAP server only over implicit TLS or STARTTLS, each named folder opened read-only and its mails counted,
Drafts and Sent recognised by their special-use markings, a login to the SMTP server over TLS and a disconnect without
sending —, with imapflow and nodemailer at the versions ARC-051 records and their logging off. The connection and its
password live only as long as the request. Errors: `no-encryption` naming the server, with no login sent to it;
`login-refused` with the server's answer; `not-found` for a named folder; `upstream-failed`. The other operations —
reading, finding, drafts, sending — are UC-038's and UC-039's and not part of this item.

## Acceptance

- Unit tests that name MOD-mail-protocols state, before the code exists, against local IMAP and SMTP test servers on
  loopback: the counts of two named folders, Drafts and Sent found and sending reported as working; a server without TLS
  sent no `LOGIN` or `AUTH`, and `no-encryption` naming it; a refused login with the server's answer; an unknown folder
  `not-found`; the IMAP session issuing `EXAMINE` and never `SELECT`, `STORE`, `COPY`, `MOVE` or `EXPUNGE`; no file
  written and nothing logged that holds the test's marker password.
- The tests reach imapflow and nodemailer the way the tunnels' tests reach ssh2; nothing reaches a server off this
  computer.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/mail-protocols/` and the tests that name MOD-mail-protocols change.
