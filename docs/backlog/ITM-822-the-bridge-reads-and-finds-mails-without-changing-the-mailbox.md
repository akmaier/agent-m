---
id: ITM-822
title: The Bridge reads and finds mails without changing the mailbox
level: module
realises:
  - UC-038
  - READING THE MAILBOX CHANGES NOTHING IN IT
  - A MAIL IS FOUND AGAIN BY ITS IDENTIFIER
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
  - THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
modules:
  - MOD-mail-protocols
builds_on:
  - ITM-420
tests:
  - unit
origin:
  - MOD-mail-protocols, Interfaces mailHandlers, operations read, find, drafts and sent; ITM-420 leaves them out
---
# ITM-822 The Bridge reads and finds mails without changing the mailbox

**REGISTER**

## Outcome

MOD-mail-protocols' `mailHandlers` answers only `test` (`POST /v1/mail/test`). Its accepted file also states the
operations `read`, `find`, `drafts` and `sent`. They are added as the file states them:
- `read` gives the mails of the named folders as MOD-mail-routes' `Mail`, each with its `MAIL-` identifier from
  MOD-mail-records' `mailId`. Each folder is opened read-only, so that nothing is marked as read, moved, flagged or
  deleted.
- `find` gives the mail of one identifier in the named folders, found by hashing the `Message-ID`s of their envelopes.
  It answers `not-found` when none matches, never a guess.
- `drafts` and `sent` give the folders the mailbox marks as Drafts and Sent.

Each fails with the named errors of the file: `no-encryption` before any login, `login-refused`, `not-found` for a
missing folder, `upstream-failed`. The part `imap.mjs` is the file's place for them.

## Acceptance

- New unit tests naming MOD-mail-protocols run against the local IMAP fixture servers of `tests/mail-protocols.test.mjs`.
  Each states its input, precondition and expected result before it runs, with literal expected values:
  - `read` gives the fixture mails with their fields and identifiers;
  - the server's protocol record shows no `STORE`, `COPY`, `MOVE`, `EXPUNGE` and no non-peek `FETCH`;
  - `find` finds a mail moved to a named folder; an identifier with no matching mail answers `not-found`;
  - a server without TLS answers `no-encryption` with no login sent;
  - no file is written and no output holds the marker password.
- TST-420001 to TST-420005 stay green with no expected result changed.
- The first commit holds only tests, and CI is red on it; each new test's counter-proof is recorded in the pull request.
- Only `src/mail-protocols/` and tests naming MOD-mail-protocols change; no dependency changes.
