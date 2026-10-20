---
id: ITM-919
title: The backlog and roles routes fit a phone
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-681
  - ITM-904
tests:
  - unit
origin:
  - ITM-904's findings (sprint team1/89), `tests/site-usability.test.mjs`
---
# ITM-919 The backlog and roles routes fit a phone

**REGISTER**

## Outcome

ITM-904's check finds, at a phone's width, that `#backlog`'s tables and both its charts and `#roles`' table are wider than
the window. Both pages are still drawn by the old views `docs/assets/dashboard/backlog-view.mjs` and `roles-view.mjs`.
MOD-implementation-pages.md:117-118 names these as taken over: "removed once this module's route `backlog` is built and the
live app shows it", and the routes `process` and `roles` likewise. So the fix is in this module's routes, once they are
live (ITM-681). The old views are changed only by the job that moves them (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO
IT`).

## Not ready: it begins with a draft for akmaier

At its first task in sprint team1/102, developer-sonnet-b found that the texts do not give a table, or the burn-down
chart, a form that fits a phone:
- `widthFindings` (`tests/site-usability.d/inspect.mjs:86-99`) finds every element wider than the window, a table in a
  `.table-scroll` box included.
- The chart keeps `--burn-down-width: 700px` (`src/theme/lme.css:80-83`).
- A table's columns reflow only through a style-sheet rule. The style sheets are MOD-site-frame's, and MOD-site-frame.md
  names `look.css` (:87) and `lme.css`'s removal (:97), but no narrow form of a table and no width of the chart on a
  phone.

The draft, of MOD-site-frame, gives one rule that serves `#backlog`, `#roles`, `#arc` and `#module` (*nothing twice*):
- a narrow form of a table in `look.css` below a phone's width, each row's cells one under another and labelled by
  their column, saying where the labels come from;
- the burn-down chart no wider than the window, saying what holds of its text size there.

ITM-1159 starts on the same draft.

## Acceptance

- At a phone's width, the module's `backlog` and `roles` routes hold no table or chart wider than the window. The todos for
  `#backlog` and `#roles` are removed from `tests/site-usability.test.mjs`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
