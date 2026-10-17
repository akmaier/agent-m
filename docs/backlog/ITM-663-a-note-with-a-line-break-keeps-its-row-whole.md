---
id: ITM-663
title: A note with a line break keeps its row whole
level: module
realises:
  - A SOURCE VERSION IS NEVER OVERWRITTEN
modules:
  - MOD-source-register
builds_on:
  - ITM-576
tests:
  - unit
origin:
  - ITM-576's gate on pull request #706 (docs/gates/20261017-0803-development-release-testing-7e2b.md), from developer-sonnet-e's finding
---
# ITM-663 A note with a line break keeps its row whole

**REGISTER**

## Outcome

ITM-576 writes a hashed-only file's note into the `Kept at` cell of the version's file table, with `|` escaped. A note
that holds a line break is written raw, so the row spans two lines and the table breaks. Only a caller of
`registrationCommits` or `versionCommits` other than the library form, whose field is one line, can hand such a note.

The note's line breaks are written as one space each, so the row stays one line. A row of the version table is never
rewritten afterwards (`A SOURCE VERSION IS NEVER OVERWRITTEN`), so the note must be whole when it is first written.

## Acceptance

- A note with a line break is written on one row, its breaks as spaces, and `filesOf` reads the file as before.
- Its counter-proof: the raw break planted back fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
