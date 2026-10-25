---
id: ITM-433
title: The system and release tests of UC-037
level: system
realises:
  - UC-037
modules:
  - MOD-settings-pages
  - MOD-mail-routes
  - MOD-browser-store
  - MOD-bridge-client
  - MOD-mail-protocols
builds_on:
  - ITM-427
  - ITM-428
  - ITM-429
  - ITM-430
tests:
  - system
  - release
origin:
  - UC-037
---
# ITM-433 The system and release tests of UC-037

**REGISTER**

## Outcome

UC-037 checked as a whole through the mailbox page, once ITM-427 to ITM-429 and the change between jobs by which the
dashboard reaches MOD-settings-pages' route `mailbox` are merged: a system test that walks the main flow on both routes
and the alternative flows 2a, 3a, 3b, 4a, 4b, 6a, 7a to 7d, 8a and 1a, with Microsoft's sign-in service and Graph
replaced by fixture servers, and the IMAP route through the Bridge as `compose` builds it (ITM-430) with local IMAP and
SMTP test servers; and release tests, one or more for each requirement UC-037 realises. The tests are written by a
Developer who implemented none of ITM-419 to ITM-430, nor that change (`RELEASE TESTS ARE NOT WRITTEN BY THE
IMPLEMENTER`).

## Acceptance

- Every requirement UC-037 realises has a release test, and the system test walks the main flow and each alternative
  flow named; each test states its input, precondition and expected result where they can be read without running it,
  and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the mailbox page and UC-037 disagree, the test follows UC-037 and the disagreement is named as a finding.
- Only new test files change.

## What is missing

Its system and release tests, `tests/system-uc-037-connect-mailbox.test.mjs` and
`tests/release-uc-037-connect-mailbox.test.mjs` (added by `44de5bf0`), were evidence maps only and were removed in
`a6c56a46`. No system test walks UC-037's main flow or its alternative flows: no file under `tests/` names UC-037 among
the `system-uc-*` and `release-*` tests.
