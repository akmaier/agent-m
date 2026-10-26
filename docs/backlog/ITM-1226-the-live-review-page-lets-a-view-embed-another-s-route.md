---
id: ITM-1226
title: The live review page lets a view embed another's route
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - UC-029
  - UC-030
  - UC-013
modules:
  - MOD-site-frame
builds_on:
  - ITM-1223
  - ITM-1224
  - ITM-765
tests:
  - unit
origin:
  - ITM-1224's report (PR #1346): on the live review page the tests browser and the audit show "Open tests-views" instead of the Tests entry's views
---
# ITM-1226 The live review page lets a view embed another's route

**REGISTER**

## Outcome

MOD-site-frame's `embedRoute(name, target, params)` renders a route of a view loaded on the same page, with the context of
the route shown now (MOD-site-frame.md, Interfaces). It finds that route in `started` (`src/site-frame/index.mjs:184`),
which only `startPage` (`:290`) and the Bridge's start (`:466`) set. The live review page's app,
`src/site-frame/dashboard-app.mjs`, loads MOD-test-pages and MOD-trace-pages and renders their routes itself, but never
sets it; so every `embedRoute` on the live page puts in its link and rejects `RouteNotLoaded`:

- the tests browser and the audit of a release tag show "Open tests-views" instead of the Tests entry's views (ITM-1224);
- the release panel shows a link instead of its candidate's audit (ITM-765).

The live app makes the routes of the views it loads reachable by `embedRoute`, with the context of the route it shows now,
as `startPage` does.

## Acceptance

- Unit tests naming MOD-site-frame, over the live app with its views loaded: on `#trace/key=tests` and
  `#trace/key=audit` the Tests entry's five views are drawn under the heading, Browser or Audit marked, and no
  "Open tests-views" link; the release panel's candidate audit is drawn, not linked. Counter-proof: before the change
  each shows the link.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
