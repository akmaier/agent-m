---
id: ITM-1089
title: The live dashboard reads backlog items of four or more digits
level: module
realises:
  - UC-031
  - EVERY ARTIFACT HAS AN IDENTIFIER
modules:
  - MOD-site-frame
builds_on:
  - ITM-1000
tests:
  - unit
origin:
  - akmaier's bug report of 2026-10-19 ("The backlog and the progress bar on the front page only report backlog items until 999. This needs a fix"), on main at 30e4f94b
---
# ITM-1089 The live dashboard reads backlog items of four or more digits

**REGISTER**

## Outcome

MOD-identifiers.md:54 gives an item's identifier as `ITM-<nnn>`, three or more digits. ITM-1000 changed MOD-work-plans'
reader; its Acceptance left "the other readers of the three-digit form" to later items, one per module. This is the one of
MOD-site-frame.

`src/site-frame/dashboard-app.mjs:270` reads the backlog with `ITEM_PATH = /^docs\/backlog\/ITM-\d{3}-…/` (used at :321), so the live app does not load ITM-1000 and later for its views.

## Acceptance

- Unit tests naming MOD-site-frame: the files the live app reads include ITM-100, ITM-999 and ITM-1000; `ITM-99-x.md` is not among them.
- Wherever this reader orders items, it orders them by number, as ITM-1000 does, not as text.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/site-frame/dashboard-app.mjs` and the tests that name MOD-site-frame change.
