---
id: ITM-814
title: The release test of a mail's identifier, its thread and a decided mail
level: system
realises:
  - UC-038
  - A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER
  - A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
  - A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
modules:
  - MOD-mail-records
builds_on:
tests:
  - release
origin:
  - akmaier's instruction of 2026-10-17 that team 2 plans around team 1
---
# ITM-814 The release test of a mail's identifier, its thread and a decided mail

**REGISTER**

## Outcome

`tests/test_mail_import.py`, the check SPEC.md names for seven requirements of turning mails into issues, does not
exist. Three of them are decided by MOD-mail-records, which is built (`src/mail-records/`): `mailId`, `undecided` and
`threadMatch`. The test is written with the cases of these three. The cases of the other four — `A MAIL BECOMES AN
ISSUE ONLY BY A PERSON'S CLICK`, `AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE`, `A DUPLICATE MAIL IS ADDED TO THE
EXISTING ISSUE` and the reading of `A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN` through the mail dashboard — exercise
MOD-mail-handling, and are added to the file by an item of that module.

## Acceptance

- A mail's identifier is `MAIL-` and the first sixteen hexadecimal digits of the SHA-256 of its `Message-ID`, or of its
  bytes when it has none; it is the same on two readings of the same mail, and two mails with different `Message-ID`s
  get different identifiers.
- Of the identifiers read a second time, none that an issue lists and none marked *not an issue* is proposed; an
  unmarked new one is.
- A mail whose `In-Reply-To` or `References` names a listed mail is matched to that issue's number without a model; a
  mail naming none is matched to none.
- Each test names the requirement it guards, the module it exercises and its level `release`; its cases stand in a
  Markdown data file beside it, and the Python file only loads them (AGENTS.md §7).
- It is written by a participant who implemented none of the behaviour it tests; each test's counter-proof — a fault
  planted in the module, and the test failing on it — is recorded in the pull request.
- Only the new test file and its data file change.
