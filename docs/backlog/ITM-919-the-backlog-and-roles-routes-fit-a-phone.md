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

## Acceptance

- At a phone's width, the module's `backlog` and `roles` routes hold no table or chart wider than the window. The todos for
  `#backlog` and `#roles` are removed from `tests/site-usability.test.mjs`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
