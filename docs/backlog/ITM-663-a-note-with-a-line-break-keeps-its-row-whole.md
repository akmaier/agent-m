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

**Settled at sprint team1/69's start, on `sprint/team1/68`'s code. Selectable.**
- **The module whose files it changes:** MOD-source-register, `index.mjs:150`. The `Kept at` cell is written from
  `file.note`, with `|` escaped. Each line break of the note becomes one space there.
- **The grep, full output read:** `git grep -n "Kept at\|keptAt" origin/sprint/team1/68 -- src/source-register` finds
  the comments at :97, :146 and :196, the writer at :150 and the table at :164-165, and `source.schema.md:21`. No other
  writer of the cell exists.
- **Reads, against the token budget:** none.
- **No error is added.**
- **Reachable:** every registration and new version whose file is only hashed.
- **Sprint 68:** no release test is among the tests it is known to change. If the draft run finds one, the developer stops
  and reports it, and a separate item by another participant changes it first.
- **Sprint 64:** the developer's draft run over the modules' tests and their callers' lists every changed test before the
  tests-only commit.
- **Sprints 65 to 67:** DOM assertions compare booleans or strings, each shell command does one action, no refusal is
  worked around, and a module header the item touches loses its item history.

## Acceptance

- A note with a line break is written on one row, its breaks as spaces, and `filesOf` reads the file as before.
- Its counter-proof: the raw break planted back fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
