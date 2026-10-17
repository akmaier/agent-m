---
id: ITM-824
title: An issue's notes are read back, and its labels are named
level: module
realises:
  - UC-038
  - UC-039
  - THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
  - A SENT REPLY IS NOTED IN THE ISSUE
  - AN ISSUE WAITING FOR A REPORTER IS LABELLED
  - AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
modules:
  - MOD-mail-records
builds_on:
  - ITM-661
tests:
  - unit
origin:
  - MOD-mail-records, Interfaces notesOf and issueLabels, which src/mail-records/ does not provide; ITM-661 left notesOf and the labels out
---
# ITM-824 An issue's notes are read back, and its labels are named

**REGISTER**

## Outcome

MOD-mail-records' accepted file provides `notesOf` and `issueLabels`; `src/mail-records/` provides neither. They are
added through `index.mjs`, in `issue-marks.mjs`, as the file states:
- `notesOf(issue)` gives the `Note`s among an issue's comments, one per comment in a form of the notes table, with its
  kind, subject and date. A comment in no form of the table is left out. The kinds `item-added` and `closed-with` carry
  no date in their text; the pull request names what the accepted file leaves open there, and no test asserts an
  invented value.
- `issueLabels` holds the label names of the labels table as constants: `defect`, `change`, `not-reproducible`,
  `waiting-for-reporter` and `backlog`.

## Acceptance

- New unit tests naming MOD-mail-records call both through the public entry. Their inputs are literal `IssueText`s, and
  their expected values are stated before they run, not read from a document or produced by `noteText`. They cover:
  - one comment of each of the six kinds;
  - comments in no form of the table, and an issue with no comments;
  - the five label names.
- A text written by `noteText` is read back by `notesOf`, as a check separate from the literal assertions.
- The existing tests of MOD-mail-records stay green with no expected result changed.
- The first commit holds only tests, and CI is red on it; each new test's counter-proof is recorded in the pull request.
- Only `src/mail-records/` and tests naming MOD-mail-records change.
