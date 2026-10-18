---
id: ITM-958
title: test_mail_import and test_mail_privacy guard a person's decision on a mail and a full run on test mails
level: module
realises:
  - A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK
  - AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
  - A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE
  - MAIL STAYS IN THE MAILBOX
  - THE PRODUCT ISSUE CARRIES NO PERSONAL DATA
  - NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
  - UC-038
modules:
  - MOD-mail-handling
builds_on:
  - ITM-952
  - ITM-954
tests:
  - release
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-038-4, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-958 test_mail_import and test_mail_privacy guard a person's decision on a mail and a full run on test mails

**REGISTER**

## Outcome

SPEC.md names `tests/test_mail_import.py` as the check of `A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK` (:2029-2030,
"a run without the click creates no issue; the participant's job definition contains no issue-creating call"), `AN ISSUE
FROM A MAIL IS A DEFECT OR A CHANGE` (:2035) and `A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE` (:2045). Today the file
guards only three other requirements (`tests/test_mail_import.py:2`).

SPEC.md names `tests/test_mail_privacy.py` for `MAIL STAYS IN THE MAILBOX` (:1984-1986), `THE PRODUCT ISSUE CARRIES NO
PERSONAL DATA` (:2021-2024) and `NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY` (:2127-2130). The file does not exist.

This item adds those cases over MOD-mail-handling's public functions (ITM-952, ITM-954) with fake mailbox, hosts and
participants, data in the `.md` files beside each loader (AGENTS.md §7). It is written by a participant other than the
implementer of ITM-952 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- `test_mail_import.py`: a run without `decideMail` creates no issue, and the kind `propose-issues` names no
  issue-creating call; every created issue carries `defect` or `change`; a confirmed duplicate adds its identifier to the
  existing issue and creates none.
- `test_mail_privacy.py`: after a full run on test mails, no write to a fake host or repository contains a sender
  address, a sender name, a mail body or an attachment; every header address, display name and body address or phone
  number is absent from the issue text. The measured rate of personal data in the participant's neutral text is reported,
  not gated.
- Counter-proofs: a body planted in a job record is found; a `decideMail` without the click's call creates nothing.
- Each new test fails on a planted fault in `src/mail-handling/` (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- Only tests that name MOD-mail-handling, and their `.md` data files, change.
