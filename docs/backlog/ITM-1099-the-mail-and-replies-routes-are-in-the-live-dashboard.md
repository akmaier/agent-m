---
id: ITM-1099
title: The routes of the maintenance pages are reached from the live dashboard's menu
level: module
realises:
  - UC-038
  - UC-039
modules:
  - MOD-site-frame
builds_on:
  - ITM-963
tests:
  - unit
origin:
  - the gate of #1122 (ITM-963), sprint team2/97, on main at 2aaf483b
---
# ITM-1099 The routes of the maintenance pages are reached from the live dashboard's menu

**REGISTER**

## Outcome

ITM-963 builds MOD-maintenance-pages' route `mail` (and its `view`), but the live dashboard does not load the module.
MOD-site-frame.md:109-110 has the page name the view modules it loads in `data-views`, `maintenance-pages` among them.
`src/site/views.mjs` and `docs/assets/dashboard/built.json`, taken over by MOD-site-frame (MOD-site-frame.md:94), list the
views the live app builds, and `maintenance-pages` is not there. This is the same step ITM-682 took for the release panel.

## Acceptance

- A unit test naming MOD-site-frame: the live app builds the view of MOD-maintenance-pages, and its menu offers `#mail`.
  Counter-proof: without it, `#mail` is not found.
- Release tests that pin the built views (`tests/release-sprint-02-a-dashboard-app.test.mjs`, `HANDED` and the allowlist) are
  changed by a participant other than the implementer, in a commit of its own, as at ITM-682, and run locally.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only MOD-site-frame's files (`src/site-frame/dashboard-app.mjs`, `src/site/views.mjs`, `docs/assets/dashboard/built.json`) and
  tests change.
