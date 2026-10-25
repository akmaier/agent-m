---
id: ITM-431
title: The check of a mailbox's password, encryption and reading in the Bridge
level: system
realises:
  - THE BRIDGE HOLDS THE MAILBOX PASSWORD ONLY FOR ONE REQUEST
  - THE MAIL SERVER IS REACHED ONLY OVER TLS
  - READING THE MAILBOX CHANGES NOTHING IN IT
modules:
  - MOD-mail-protocols
  - MOD-desktop-shell
builds_on:
  - ITM-430
tests:
  - release
origin:
  - SPEC.md: the check `tests/test_bridge_mail.py` its requirements name
built_by:
  - 206064c71e68e66722a4ee79b3ddb4d2b5c675cc
---
# ITM-431 The check of a mailbox's password, encryption and reading in the Bridge

**REGISTER**

## Outcome

`tests/test_bridge_mail.py`, the check SPEC.md names for these requirements, for what UC-037 does: a connection tested
through the Bridge as `compose` builds it, against local IMAP and SMTP test servers — after a run with a marker
password, no file below the Bridge's folders and no log line holding it; against a server without TLS, no `LOGIN` or
`AUTH` sent; the test's IMAP session issuing no `STORE`, `COPY`, `MOVE` or `EXPUNGE` and no `FETCH` that is not a peek.
The cases of reading, finding, threading and sending that name the same check wait for the items of UC-038 and UC-039.

## Acceptance

- Each test states its input, its precondition and its expected result where they can be read without running it, names
  what it guards, the module it exercises and its level `release`; its cases stand in a Markdown data file beside it and
  the Python file only loads them (AGENTS.md §7).
- It is written by a participant who implemented none of the behaviour it tests (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`); each test's counter-proof — a fault planted in the code it guards, and the test failing on it — is
  recorded in the pull request.
- Where the code does not do what the requirement says, the test follows the requirement and the disagreement is named
  as a finding.
- Only the new test file and its data file change.

## Built (read on main by po-opus-b, 2026-10-18)

This item is built: commit `206064c7` ("Team2 sprint52 ITM-431 bridge mail release check") is on `main`. No merged pull request names it, because it predates the record
format in which a merge names its item. So MOD-work-plans' reading of the pull requests still shows it open. The gap analysis
of UC-036 to UC-049 found its code and tests on `main`.

**Done (sprint team2/98, po-opus-b):** read against its Acceptance on `main` at `3436203a`: `tests/test_bridge_mail.py` carries it and passes on `main`; built by `206064c7`. No pull request names it, since it predates the pull-request flow or was built by another item. No code changes.
