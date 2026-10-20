---
id: ITM-1092
title: An issue's marks name items of four or more digits
level: module
realises:
  - UC-038
  - UC-039
modules:
  - MOD-mail-records
builds_on:
  - ITM-1000
tests:
  - unit
origin:
  - akmaier's bug report of 2026-10-19 ("The backlog and the progress bar on the front page only report backlog items until 999. This needs a fix"), on main at 30e4f94b
---
# ITM-1092 An issue's marks name items of four or more digits

**REGISTER**

## Outcome

MOD-identifiers.md:54 gives an item's identifier as `ITM-<nnn>`, three or more digits. ITM-1000 changed MOD-work-plans'
reader; its Acceptance left "the other readers of the three-digit form" to later items, one per module. This is the one of
MOD-mail-records.

`src/mail-records/issue-marks.mjs:6`, `:75` and `:76` read an item identifier as `ITM-\d{3}`, in the whole identifier and in the marks "Backlog item `ITM-…` added" and "Closed with …; item `ITM-…`". So a mark that names ITM-1000 is not read.

## Acceptance

- Unit tests naming MOD-mail-records: the marks naming ITM-100, ITM-999 and ITM-1000 are read with their item; one naming `ITM-99` is not.
- Wherever this reader orders items, it orders them by number, as ITM-1000 does, not as text.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/mail-records/` and the tests that name MOD-mail-records change.
