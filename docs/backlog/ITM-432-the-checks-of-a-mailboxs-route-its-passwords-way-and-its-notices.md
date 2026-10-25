---
id: ITM-432
title: The checks of a mailbox's route, its password's way and its notices
level: system
realises:
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - AN API MAILBOX IS OPENED BY THE PROVIDER'S SIGN-IN
  - THE MAIL SIGN-IN ASKS ONLY FOR READING, DRAFTING AND SENDING
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE
  - A MAILBOX THROUGH THE JUMP HOST IS NAMED AS READABLE THERE
  - A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT
modules:
  - MOD-mail-routes
  - MOD-settings-pages
  - MOD-bridge-client
builds_on:
  - ITM-427
  - ITM-428
  - ITM-429
tests:
  - release
origin:
  - SPEC.md: the check `tests/test_mail_routes.py` its requirements name
  - SPEC.md: the check `tests/test_mail_password_route.py` its requirements name
  - SPEC.md: the check `tests/test_settings_disclosure.py` its requirements name
built_by:
  - 82db8d4a43ec1fc92b4adea095683f3b1f8c55db
---
# ITM-432 The checks of a mailbox's route, its password's way and its notices

**REGISTER**

## Outcome

The checks SPEC.md names for these requirements, for what UC-037 does. `tests/test_mail_routes.py`: a Microsoft 365
fixture connection tested with no request to a Bridge, and IMAP fixture connections, Gmail's among them, that name
different Bridges, each tested only through its own; the Microsoft route storing no password while the IMAP route asks
for one; exactly `Mail.ReadWrite`, `Mail.Send` and `offline_access` asked. `tests/test_mail_password_route.py`: every
request of storing and testing a connection recorded while two Bridges are stored, and the password only in requests to
the address of the Bridge the connection names. The mailbox's cases of `tests/test_settings_disclosure.py`: nothing
stored before the password's notice is acknowledged; a connection through a Bridge reached via the jump host stored only
after its notice, one through this computer's Bridge with no such notice; a place outside the EU stated before saving.
`tests/test_settings_disclosure.py` names MOD-dashboard-app in its header, which the accepted architecture lacks, so a
change between jobs names MOD-settings-pages there first (`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`). The cases of
reading and sending in the first two checks wait for the items of UC-038 and UC-039.

## Acceptance

- Each test states its input, its precondition and its expected result where they can be read without running it, names
  what it guards, the module it exercises and its level `release`; its cases stand in a Markdown data file beside it and
  the Python file only loads them (AGENTS.md §7).
- It is written by a participant who implemented none of the behaviour it tests (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`); each test's counter-proof — a fault planted in the code it guards, and the test failing on it — is
  recorded in the pull request.
- Where the code does not do what the requirement says, the test follows the requirement and the disagreement is named
  as a finding.
- Only the two new test files, their data files and the mailbox's cases in `tests/test_settings_disclosure.py` change.

## Built (read on main by po-opus-b, 2026-10-18)

This item is built: commit `82db8d4a` ("Team2 sprint40 ITM-432 mailbox release checks") is on `main`. No merged pull request names it, because it predates the record
format in which a merge names its item. So MOD-work-plans' reading of the pull requests still shows it open. The gap analysis
of UC-036 to UC-049 found its code and tests on `main`.

**Read at sprint team1/93 (developer-sonnet-c): built** (`82db8d4a`, team2/40.md). Its Outcome holds. Its tests pass:
`test_mail_routes`, `test_mail_password_route` and `test_settings_disclosure` (18), and the two mailbox files (57). It is
done. Its weak spots are findings of their own, registered once four-digit identifiers stand on `main`:
- `connectionHasPassword` (`tests/test_mail_routes.py:140`) is computed from the fixture and cannot fail on the code;
- the two Python files name `system` as their module.
