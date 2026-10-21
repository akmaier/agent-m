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
  - system
origin:
  - ITM-904's findings (sprint team1/89), `tests/site-usability.test.mjs`
---
# ITM-920 The menu fits a phone

**REGISTER**

## Outcome

**A lead from ITM-904, and a reading.** At 390 px, `nav#tabs` holds tabs beyond the window inside a nav that scrolls
sideways. The check flags no single element, because the nav itself fits the window. The accepted sentence reads "read on
a phone without scrolling sideways". Hidden tabs that are reached only by scrolling sideways are read as breaking it.

The live main and review pages already load `src/site-frame/look.css`, alongside `src/theme/lme.css`.
The narrow rule in `src/theme/lme.css:72` sets `.menu` to `flex-wrap: nowrap; overflow-x: auto`; the shared
look currently supplies badge and button rules but no replacement for that forced horizontal scrolling.
The review page loads `src/site-frame/dashboard-app.mjs`, whose `drawMenu` calls `menuHtml`; the separate public
`startPage` path also draws `.menu`. The outcome must reach both live entry pages, not merely an unused start script.

## Implementation scope

MOD-site-frame owns the common menu and its look. Its accepted Parts name the legacy menu and styles as taken over;
move the relevant shared menu rules into `look.css` as needed for this outcome, without a whole-app migration or a
second route-specific phone rule. The existing loaded styles make this work independent of switching the entry script.
Preserve the process order, labels, destinations, disabled entries, chosen-product links and desktop behavior.
No old expected result is authorized to change. Add focused checks of all menu entries at the phone boundary, retaining
the existing badge-color assertions and target-size checks; a matching rule's presence alone is not the outcome.

The real-browser checks in `tests/site-usability.test.mjs` are system tests, as their file header declares; new browser
menu-visibility cases keep that level and begin their titles with their declared TST identifier for native JUnit.
Focused non-browser cases may be unit tests. Reuse the unchanged `site-usability.d/browser.mjs`, `site.mjs` and
`routes.mjs`: Electron staging caches the binary, while serveSite streams this worktree's actual entry pages, scripts
and styles. No helper edit or custom staged copy of the app is in scope. The old TST-904054/072/117/126 width TODOs
for arc/module/backlog/roles belong to the deferred table/chart work and remain unchanged by this menu item.

## Acceptance

- At a phone's width, every menu entry is visible without scrolling sideways, for example wrapped or folded. The check
  gains that clause, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
