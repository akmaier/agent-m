---
id: ITM-430
title: The Bridge answers the mail routes
level: subsystem
realises:
  - UC-037
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
modules:
  - MOD-desktop-shell
  - MOD-mail-protocols
  - MOD-bridge-http
integrates: ARC-040
builds_on:
  - ITM-419
  - ITM-420
tests:
  - component
origin:
  - UC-037 step 7
built_by:
  - db7e2551b2c985cd013b7e9b1cb73169010faad9
  - 88148a892d7ec9d3b4a213d57a48f5c3b1abc010
---
# ITM-430 The Bridge answers the mail routes

**REGISTER**

## Outcome

MOD-desktop-shell's composition, `compose.mjs`, serves MOD-mail-protocols' `mailHandlers` beside the jobs' handlers, as
its file states; and component tests of the interface ARC-040 offers, with the Bridge as `compose` builds it in Node on
loopback and local IMAP and SMTP test servers: `POST /v1/mail/test` with the pairing token answered with the counts;
refused without the token and from another origin; `paused` while paused; a server without TLS answered `no-encryption`,
with no login sent; after the request, no file under the Bridge's data folder and no log line that holds the marker
password. A fault the tests find is fixed in the folder of the module it names.

## Acceptance

- Component tests that name the three modules state their input, precondition and expected result readable without
  running them.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/desktop-shell/`, `src/mail-protocols/`, `src/bridge-http/` and the tests that name one of these modules
  change.

## Built (read on main by po-opus-b, 2026-10-18)

This item is built: commit `88148a89` ("Team2 sprint46 ITM-430 compose mail handlers") is on `main`. No merged pull request names it, because it predates the record
format in which a merge names its item. So MOD-work-plans' reading of the pull requests still shows it open. The gap analysis
of UC-036 to UC-049 found its code and tests on `main`.

**Done (sprint team2/98, po-opus-b):** read against its Acceptance on `main` at `3436203a`: `tests/mod-desktop-shell-mail-composition.test.mjs` (TST-430001, TST-430002) carries it and passes on `main`; built by `88148a89`. No pull request names it, since it predates the pull-request flow or was built by another item. No code changes.
