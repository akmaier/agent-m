---
id: ITM-1088
title: The main page's progress bar counts items of four or more digits
level: module
realises:
  - UC-046
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-progress-measures
builds_on:
  - ITM-1000
tests:
  - unit
origin:
  - akmaier's bug report of 2026-10-19 ("The backlog and the progress bar on the front page only report backlog items until 999. This needs a fix"), on main at 30e4f94b
---
# ITM-1088 The main page's progress bar counts items of four or more digits

**REGISTER**

## Outcome

MOD-identifiers.md:54 gives an item's identifier as `ITM-<nnn>`, three or more digits. ITM-1000 changed MOD-work-plans'
reader; its Acceptance left "the other readers of the three-digit form" to later items, one per module. This is the one of
MOD-progress-measures.

`src/home/progress.mjs:27` reads plan steps and backlog items with `ITM-\d{3}`, so the progress bar on the main page leaves out ITM-1000 and later. The file is taken over by MOD-progress-measures (MOD-progress-measures.md:102), whose own readers already take three or more digits (`src/progress-measures/facts.mjs:39-40`).

## Acceptance

- Unit tests naming MOD-progress-measures: the progress of a product with ITM-100, ITM-999 and ITM-1000 counts all three, and any order it shows is by number; `ITM-99-x.md` is not counted.
- Wherever this reader orders items, it orders them by number, as ITM-1000 does, not as text.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/home/progress.mjs` and the tests that name MOD-progress-measures change.
