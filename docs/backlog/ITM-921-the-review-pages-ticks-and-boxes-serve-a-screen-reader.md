---
id: ITM-921
title: The review pages' ticks and scrolling boxes serve a screen reader
level: module
realises:
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-review-pages
builds_on:
  - ITM-905
tests:
  - unit
origin:
  - ITM-905's findings (sprint team1/89), `tests/site-accessibility.test.mjs`
---
# ITM-921 The review pages' ticks and scrolling boxes serve a screen reader

**REGISTER**

## Outcome

ITM-905's check finds two rules broken on MOD-review-pages' routes:
- **label:** the list tick boxes on `#uc`, `#arc`, `#module` and `#spec` have no accessible name;
- **scrollable-region-focusable:** the boxes that scroll, on `#uc/UC-001` at a phone's width, the three edit pages, and
  `#arc` and `#module` at a phone's width, cannot be reached by keyboard. The difference boxes of ITM-877 are among them.
Each finding is a todo in `tests/site-accessibility.test.mjs`.

## Acceptance

- Each tick names the file it accepts, and each difference box that scrolls can be focused. The `label` todos on these
  routes are removed, and the check passes there, with a counter-proof each. The `scrollable-region-focusable` todos that
  belong to other modules stay, each with its own item.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
