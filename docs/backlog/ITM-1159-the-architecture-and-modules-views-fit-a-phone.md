---
id: ITM-1159
title: The architecture and modules views fit a phone
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-trace-pages
  - MOD-site-frame
builds_on:
  - ITM-721
tests:
  - unit
origin:
  - ITM-721's pull request #1225 (sprint team1/100), from developer-sonnet-a's report
---
# ITM-1159 The architecture and modules views fit a phone

**REGISTER**

## Outcome

ITM-721 draws the modules view as the table MOD-trace-pages.md:113 states, one row per module, inside
`div.table-scroll`. At a phone's width its six columns of paths are wider than the window, so TST-904054 (`#arc`) and
TST-904072 (`#module`) find it (`tests/site-usability.test.mjs`). `EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE`
(SPEC.md:935-938) asks that tables be read on a phone without scrolling sideways, from the site's shared style sheets.
The two findings stand as todos in the `TODAY` map of `tests/site-usability.test.mjs:70-72`, naming this item.

**First task:** read whether MOD-site-frame's text gives the shared style sheet a narrow form of a table, in which a row's
cells stand one under another, each labelled by its column. Read too whether one such rule serves `#backlog` and `#roles`
as well (*nothing twice*). Where the text does not give it, the item stops for a draft.

**The draft `3ef0fce2`** of MOD-site-frame, written at ITM-919's stop, is accepted: MOD-site-frame.md:106-110 gives the
narrow form of a table below a phone's width, one rule for every route (approval of blob `866f160f`, `b6c70419`). The
item is ready.

## Acceptance

- At a phone's width, `#arc` and `#module` hold no element wider than the window, and their todos go. The views still
  draw a table, one row per module.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
