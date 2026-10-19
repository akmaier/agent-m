---
id: ITM-959
title: The SPEC check test_mail_replies.py over the replies due, their drafts and their notes
level: module
realises:
  - THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
  - AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS
  - A REPLY GOES TO ONE REPORTER
  - CLOSING AN ISSUE PREPARES ITS REPLIES
  - A REPLY DRAFT IS KEPT IN THE MAILBOX'S DRAFTS FOLDER
  - THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS
  - A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO
  - A SENT REPLY IS NOTED IN THE ISSUE
  - AN ISSUE WAITING FOR A REPORTER IS LABELLED
  - A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE
  - A CLOSED ISSUE IS REOPENED ONLY BY A PERSON
  - UC-039
modules:
  - MOD-mail-handling
builds_on:
  - ITM-952
  - ITM-953
tests:
  - release
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-039-5, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-959 The SPEC check test_mail_replies.py over the replies due, their drafts and their notes

**REGISTER**

## Outcome

SPEC.md names `tests/test_mail_replies.py` as the check of eleven requirements (SPEC.md:1991, 2009, 2066, 2072, 2078,
2083, 2089, 2095, 2101, 2106 and 2110). The file does not exist. Team 2's sprint 78 read this (team2/78.md:57: "`test_mail_replies.py` needs the
mail dashboard's groups"). Those groups are MOD-mail-handling's `repliesDue` (MOD-mail-handling.md:95-103), which ITM-953
builds.

The check follows the pattern of `tests/test_mail_import.py`:
- one data file, `tests/test_mail_replies.md`, and one loader, as AGENTS.md §7 asks;
- it runs the module's public functions through `jsrun`;
- its header names MOD-mail-handling, the level `release` and the requirements it guards.

The cases are the checks the SPEC states:
- a closed issue listing two mails yields two offers; with a reply noted for one, it yields one (SPEC.md:2072);
- an issue with three reports yields three drafts, each to one reporter (:2066);
- after drafting, the draft is in Drafts with `In-Reply-To` (:2078);
- an unrelated draft is not listed (:2083);
- a reply placed in Sent by hand is noted at the next reading, and an unrelated sent mail is not (:2089);
- after a send, the issue has one comment with the identifier and the date and no address (:2095);
- clearing the browser's storage changes no group (:1991).

## Acceptance

- Each requirement in `realises` has at least one case. Each case states its input, precondition and expected result in
  the `.md`.
- Each case's counter-proof, a fault planted in `src/mail-handling/`, is recorded in the pull request.
- Written by a participant other than the implementer of ITM-953 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).
- Only `tests/test_mail_replies.py` and `tests/test_mail_replies.md` are added.
