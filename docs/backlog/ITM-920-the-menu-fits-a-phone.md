---
id: ITM-920
title: The menu fits a phone
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-site-frame
builds_on:
  - ITM-904
tests:
  - unit
origin:
  - ITM-904's findings (sprint team1/89), `tests/site-usability.test.mjs`
---
# ITM-920 The menu fits a phone

**REGISTER**

## Outcome

**A lead from ITM-904, and a reading.** At 390 px, `nav#tabs` holds tabs beyond the window inside a nav that scrolls
sideways. The check flags no single element, because the nav itself fits the window. The accepted sentence reads "read on
a phone without scrolling sideways". Hidden tabs that are reached only by scrolling sideways are read as breaking it.

The menu's rules are in `src/theme/lme.css`, which MOD-site-frame.md:84 names as taken over by `look.css`, and `look.css`
reaches the live page only after its switch to `start.mjs`. So the item waits for that switch, as ITM-886 does.

## Acceptance

- At a phone's width, every menu entry is visible without scrolling sideways, for example wrapped or folded. The check
  gains that clause, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
