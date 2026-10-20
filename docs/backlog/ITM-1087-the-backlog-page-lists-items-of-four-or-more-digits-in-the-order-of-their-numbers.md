---
id: ITM-1087
title: The backlog page lists items of four or more digits, in the order of their numbers
level: module
realises:
  - UC-031
  - EVERY ARTIFACT HAS AN IDENTIFIER
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-1000
tests:
  - unit
origin:
  - akmaier's bug report of 2026-10-19 ("The backlog and the progress bar on the front page only report backlog items until 999. This needs a fix"), on main at 30e4f94b
---
# ITM-1087 The backlog page lists items of four or more digits, in the order of their numbers

**REGISTER**

## Outcome

MOD-identifiers.md:54 gives an item's identifier as `ITM-<nnn>`, three or more digits. ITM-1000 changed MOD-work-plans'
reader; its Acceptance left "the other readers of the three-digit form" to later items, one per module. This is the one of
MOD-implementation-pages.

`docs/assets/dashboard/backlog-view.mjs:44` reads an item file with `ITEM_FILE = /^docs\/backlog\/(ITM-\d{3})-…/`, so ITM-1000 and later are not on the backlog page. `:77` sorts the paths as text, so ITM-1000 would stand before ITM-101. The file is taken over by MOD-implementation-pages (MOD-implementation-pages.md:122).

## Acceptance

- Unit tests naming MOD-implementation-pages: the backlog page lists ITM-100, ITM-999 and ITM-1000 in that order; a file `ITM-99-x.md` is not read as an item.
- Wherever this reader orders items, it orders them by number, as ITM-1000 does, not as text.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `docs/assets/dashboard/backlog-view.mjs` and the tests that name MOD-implementation-pages change.
