---
id: ITM-919
title: The backlog and roles routes fit a phone
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-implementation-pages
  - MOD-site-frame
builds_on:
  - ITM-681
  - ITM-904
tests:
  - unit
  - system
origin:
  - ITM-904's findings (sprint team1/89), `tests/site-usability.test.mjs`
---
# ITM-919 The backlog and roles routes fit a phone

**REGISTER**

## Outcome

The live native routes in `src/implementation-pages/backlog.mjs` and `roles.mjs` still draw tables wider than a phone,
and backlog draws both burn-down charts at 700px. `widthFindings` in `tests/site-usability.d/inspect.mjs` checks the
actual table and SVG, not merely their scrolling containers. TST-904117 and TST-904126 retain the corresponding
findings. The old legacy routes are not the implementation target.

## Readiness and scope

MOD-implementation-pages blob `b177dbe3c2bc208e38acdcb920dc1a04dd50096f` and MOD-site-frame blob
`d38b1f2e6ef8946e0a995d2d28ae2d2b770d4bfa` are accepted. Frame's Parts already give the narrow table and burn-down
forms; no draft acceptance or whole-page switch to `start.mjs` is pending for this item. Both live entry pages load
`look.css` already. The prerequisites ITM-681 and ITM-904 are delivered.

Implementation-pages owns the native tables' column-title `data-label` attributes and the chart's requested width and
axis labels. Frame owns the single shared narrow-table rule in `look.css`: below 600px each row's cells stack and show
their column labels, with no route-owned style. Its accepted chart contract keeps the requested desktop property
width, fits the narrower window less page margins, and keeps body-sized text by drawing fewer axis labels, not by
shrinking the SVG's text. Preserve the plotted data, merge times, counts, line and axis meaning. Change only the owned
route files and the shared styles needed for this outcome; no unrelated route, wholesale migration, helper, custom
staging or private legacy-file edit. Shared Frame writers are serialized.

## Tests and exact old-expectation boundary

The real-browser usability and backlog-layout files are system tests. Existing component and unit cases keep their
levels and expectations except for the exact system boundary below. New cases declare their module, level, guarded
input and literal expected result before Source; browser titles begin with their declared TST identifier. Use the
unchanged browser/site/route helpers, which serve actual worktree files; Electron staging caches only its binary.

In `tests/dashboard-backlog-layout.test.mjs`, the existing case named
`#backlog in a browser — tables, panels and the chart keep the heading's margins; the chart reads as clearly as its axes`
currently requires the chart to scroll wider than its box at 390px. Only that phone-only scrolling policy and its
matching header/expected-result prose may change to require the actual tables and chart to fit without horizontal
overflow. The phone-only requirement for a scrolling overflow mode may likewise become the no-overflow outcome;
keep the individual containers, four exact table parts, heading/panel margins and document-width check. Preserve
the 1280px desktop checks, body-sized chart text within 1px, positive text/axis controls, line width relative to axes
and contrast of at least 3. This is not permission to delete the case, shrink its text or weaken readability checks.

In `tests/site-usability.test.mjs`, remove only the resolved `#backlog` and `#roles` width TODO reasons for
TST-904117/126; their literal empty-findings expectations, route inputs and all other controls remain. Keep other
actual findings explicit. Do not rewrite the old component expectations in `tests/dashboard-backlog-teams.test.mjs`:
each table's own scrolling box, body font 17px, requested width 640px, chart counts and times remain valid controls.
All other old expectations, fixtures and helpers remain unchanged. No whole-UC release coverage is claimed.

## Acceptance

- At a phone's width, the module's `backlog` and `roles` routes hold no table or chart wider than the window. The todos for
  `#backlog` and `#roles` are removed from `tests/site-usability.test.mjs`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
