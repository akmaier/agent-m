---
id: ITM-1091
title: A group names backlog items of four or more digits
level: module
realises:
  - EVERY ARTIFACT HAS AN IDENTIFIER
modules:
  - MOD-group-document
builds_on:
  - ITM-1000
tests:
  - unit
origin:
  - akmaier's bug report of 2026-10-19 ("The backlog and the progress bar on the front page only report backlog items until 999. This needs a fix"), on main at 30e4f94b
---
# ITM-1091 A group names backlog items of four or more digits

**REGISTER**

## Outcome

MOD-identifiers.md:54 gives an item's identifier as `ITM-<nnn>`, three or more digits. ITM-1000 changed MOD-work-plans'
reader; its Acceptance left "the other readers of the three-digit form" to later items, one per module. This is the one of
MOD-group-document.

`docs/assets/artifacts/groups.mjs:39` reads a backlog item as `/^ITM-\d{3}$/`. The file is taken over by MOD-group-document (MOD-group-document.md:38).

## Acceptance

- Unit tests naming MOD-group-document: a group that names ITM-100, ITM-999 and ITM-1000 reads all three as backlog items; `ITM-99` is not one.
- Wherever this reader orders items, it orders them by number, as ITM-1000 does, not as text.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `docs/assets/artifacts/groups.mjs` and the tests that name MOD-group-document change.
