---
id: ITM-225
title: A date is history only as the date of a change
level: module
realises:
  - A DOCUMENT HOLDS NO HISTORY
modules:
  - MOD-text-tools
builds_on:
  - ITM-212
tests:
  - unit
origin:
  - A DOCUMENT HOLDS NO HISTORY
---
# ITM-225 A date is history only as the date of a change

**REGISTER**

## Outcome

MOD-text-tools' `historyMarks`, in `src/text-tools/history-marks.mjs`, as the module's accepted file states it. It finds
the marks of history, each told by its words:
- a note that something was withdrawn (`withdrawal`);
- a stamp of who edited what or when (`edit-stamp`);
- a date given as the date of a change (`dated-change`): after a word of decision or acceptance, as in `PO decision
  <date>`, or set off by a comma as the date of an attribution, as in `(PO A. Maier, <date>)` or `PO, <date>: …`.

Any other date is no mark: the date a fact was read, a version, a release, a measurement a document names, stated with
the words that say what they are or in a table's cells. The code ITM-212 built marks every date as `dated-change`.

## Acceptance

- Unit tests that name MOD-text-tools state, before the code changes:
  - the dates of a change in their three forms, each marked `dated-change` with its line;
  - dates that are no mark: a retrieval date, the date of a version, of a release and of a measurement, and a date in a
    table's cell;
  - withdrawals and edit stamps marked with their lines and kinds.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The tests of ITM-212 whose expected marks change — a date that is no mark now, such as its fixture's retrieval date —
  change with it, each named in the pull request with the expected result it changes. Every other test stays green with
  no expected result changed.
- Only `src/text-tools/` and the tests that name MOD-text-tools change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
