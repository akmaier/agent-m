---
id: ITM-922
title: The frame's menu, status badges and explanations serve a screen reader
level: module
realises:
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-site-frame
builds_on:
  - ITM-905
tests:
  - unit
  - system
origin:
  - ITM-905's findings (sprint team1/89), `tests/site-accessibility.test.mjs`
---
# ITM-922 The frame's menu, status badges and explanations serve a screen reader

**REGISTER**

## Outcome

ITM-905's check finds three rules broken on what the frame draws:
- **aria-required-children,** on every route: `nav#tabs`, a `tablist`, holds children that are no `tab` (`span.soon`). The
  menu is built by `src/site/menu.mjs`, called by the live `src/site-frame/dashboard-app.mjs:764`, and the header in
  `docs/index.html`. MOD-site-frame names that legacy menu as taken over. Read axe's actual rule and the public page:
  the built-view list leaves Tests unavailable, so the disabled span remains a real child, not an absent-API inference.
- **color-contrast:** the `.b-accepted` badge on `#uc`, `#uc/UC-001`, `#arc`, `#arc/ARC-001`, `#arc/MOD-reader`, `#module`
  and `#backlog`. The badge rule is in `docs/assets/style.css`, which the accepted Frame Parts explicitly take over;
  it uses the shared `--ok` and `--ok-bg` colors. Both live entry pages already load `look.css`; moving the relevant
  shared rule there need not wait for a different entry script.
- **target-size:** the `summary` of the explanations on the three edit pages, at a phone's width. The frame's `explain`
  draws it.

## Implementation and existing test scope

Use the accepted Frame responsibility and its existing ordinary-navigation pattern: `startPage` draws a normal nav
with links and disabled unlinked text, not a tablist. Make the live menu's semantics valid without changing its process
order, visible labels, destinations, identifiers or disabled/unlinked meaning. Move only the shared badge/explanation
look needed here from the named taken-over styles into `look.css`; do not migrate unrelated views or rewrite the app.
The existing `explain` element stays a folded details/summary with its current label and rendered body.

The existing test named "with every view file of today, the menu shows the stages of the process in their order, each
linked to its page" in `tests/dashboard-shell.test.mjs` may change only its legacy menu-role expectation: remove
`role="tab"` from the expected link strings in `MENU_OF_TODAY` and the matching release-entry filter when the live
menu uses ordinary navigation. All hrefs, ids, data-entry values, labels, titles, order, disabled span and release-filter
meaning remain unchanged. This aligns its markup assertion with MOD-site-frame's accepted menu contract and normal
navigation caller while removing the invalid tablist structure; no other old expected result changes.

In `tests/site-accessibility.test.mjs`, remove only this item's menu/contrast/target TODO reasons once the corresponding
actual page checks pass. Keep any other remaining route finding, the empty-violations expectation, rule tags, engine,
fixtures and old counter-proof controls. TST-515001/2's step-badge/soon-pill colors and contrast expectations in
`tests/site-frame-menu-badges.test.mjs`, and the existing folded-explanation assertions, are unchanged. New focused cases
must distinguish already-working controls from each remaining fault; no passing behavior is recast as a new red ticket.

The existing generated whole-route cases TST-905034 through TST-905064, TST-905114, TST-905117 and TST-905120 in
`tests/site-accessibility.test.mjs` keep their system level, identifiers, fixtures and empty-violations expectations.
Only their menu/contrast/target TODO metadata may be removed when that rule no longer fails; any other actual finding
continues to be named. New real-browser cases are system tests with TST-prefixed titles; focused non-browser cases
may be unit tests. The existing browser/server/route/axe helpers and staging stay unchanged. The server streams the
worktree's actual source/styles, so planted code/CSS faults use that existing path, not a custom app staging mechanism.

## Acceptance

- The menu, the status badges and the explanations break none of these rules. The todos are removed, and the check passes,
  with a counter-proof each. The badge colour follows the switch to `look.css`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
