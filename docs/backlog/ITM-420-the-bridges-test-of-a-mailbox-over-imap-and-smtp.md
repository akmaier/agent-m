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
  - ITM-459
tests:
  - unit
origin:
  - UC-037 step 7, 7b, 7c, 7d
---
# ITM-420 The Bridge's test of a mailbox over IMAP and SMTP

**REGISTER**

## Outcome

Complete the unit verification of MOD-mail-protocols' existing `mailHandlers` operation `test`, as its accepted file
states it: IMAP and SMTP over TLS, read-only folder counts and special-use Drafts/Sent, no mail sent, named errors,
and no file written or mailbox password logged or retained beyond the request.

The selected work is tests-only completion of the existing no-file/no-password-log Acceptance. Product code, the
operation's interface and behaviour, dependency versions and existing expected results stay unchanged. Reading,
finding, drafts and sending remain outside this item.

## Acceptance

- TST-420001 through TST-420005 in `tests/mail-protocols.test.mjs` remain green with every assertion and expected result
  unchanged: counts, TLS, read-only commands, no sending, encryption refusal before login, refused-login answer and
  missing-folder error.
- New unit tests naming MOD-mail-protocols state their preconditions, inputs and literal expected results before
  running. Through the existing public handler and real local IMAP/SMTP loopback fixtures, they observe that the
  handler writes no file and that its and its libraries' output holds no marker password. Observe the handler's
  operation separately from fixture setup, which creates the test certificate; distinguish fixture protocol records
  from product/library output. Include a successful request and the named failure paths that the existing fixtures
  exercise. No real mailbox or off-computer mail server is reached.
- Reach imapflow and nodemailer from the existing Bridge lockfile installation, as ITM-459 states; no test downloads
  or installs a package. Existing test fixture preparation may be factored for reuse only within tests naming
  MOD-mail-protocols; no existing case, header ownership or asserted result is changed.
- The first commit holds only tests and their fixture data. This job adds no product behaviour, so it does not
  manufacture a failing product baseline; each new test is instead shown to fail at its own assertion on a planted
  source fault and to pass after exact restoration. The pull request records the actual baseline/fault/restored
  commands, outcomes and source/test/executor pins. Final CI is green.
- Only tests naming MOD-mail-protocols and their necessary owned fixture preparation change. No production source,
  dependency, workflow, SPEC, use case, architecture, process or role change is part of this tests-only job.
