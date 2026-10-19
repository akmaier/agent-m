---
id: ITM-1093
title: A reply reads the closing item of four or more digits
level: module
realises:
  - UC-039
  - CLOSING AN ISSUE PREPARES ITS REPLIES
modules:
  - MOD-mail-handling
builds_on:
  - ITM-1000
tests:
  - unit
origin:
  - akmaier's bug report of 2026-10-19 ("The backlog and the progress bar on the front page only report backlog items until 999. This needs a fix"), on main at 30e4f94b
---
# ITM-1093 A reply reads the closing item of four or more digits

**REGISTER**

## Outcome

MOD-identifiers.md:54 gives an item's identifier as `ITM-<nnn>`, three or more digits. ITM-1000 changed MOD-work-plans'
reader; its Acceptance left "the other readers of the three-digit form" to later items, one per module. This is the one of
MOD-mail-handling.

`src/mail-handling/replies.mjs:9` reads "Closed with …; item `ITM-\d{3}`", so a closing note that names ITM-1000 does not match, and what solved the issue is not read.

## Acceptance

- Unit tests naming MOD-mail-handling: a closing note naming ITM-100, ITM-999 or ITM-1000 is read with its item; one naming `ITM-99` is not.
- Wherever this reader orders items, it orders them by number, as ITM-1000 does, not as text.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/mail-handling/` and the tests that name MOD-mail-handling change.
