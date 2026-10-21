---
id: ITM-1174
title: The waiting-state badges meet contrast
level: module
realises:
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-site-frame
builds_on:
  - ITM-905
tests:
  - system
origin:
  - Team1 Sprint106 review; PR1278 head aeda2b2fe3bdd68ce48bf72c8d044856f7984184
  - CI39630327573 node4 job119326541360; TST-905060
---
# ITM-1174 The waiting-state badges meet contrast

**REGISTER**

## Outcome

The existing real-browser WCAG check still reports color-contrast on #backlog's .b-superseded
status badge at both 390px and1280px. TST-905060 retains the finding after the selected accepted
badge is clear. The class name is a style, not a claim that the backlog item itself is superseded:
implementation-pages/backlog.mjs:36 also uses it for waiting-for-acceptance and prerequisite states.

The path is that state-to-style mapping -> .b-superseded -> docs/assets/style.css:30's shared
--muted/--open-bg pair -> the actual rendered badge -> axe color-contrast. Read the actual cascade
and caller before choosing the smallest shared-look correction; do not infer a palette from a name.

## Scope

Frame owns the shared look and explicitly takes over the legacy styles. Both live entry pages load
look.css. Correct this badge through owned shared Frame code, not an in-place legacy edit or a route
state/label change. One responsibility keeps its contrast separate from the return-link outcome;
DRY and KISS keep one shared rule. No new public interface or formal change is required.

Keep the waiting labels, state derivation, class meaning and destinations; retain accepted-badge
behavior, step-badge/soon-pill colors and TST-515001/2. Do not fix unrelated return links, tables,
views, helpers or checker rules. Existing unfiltered whole-page assertions stay unchanged.
This is a behavior item with system verification, not a tests-only coverage item.

## Acceptance

- The same live #backlog route at the existing phone and desktop widths has no contrast violation on
  this badge. TST-905060 keeps its identifier, system level and empty-violations expectation; remove
  only the actual resolved reason after the check passes and retain any other real finding.
- Focused system verification begins with an unused TST identifier and uses the unchanged native
  browser/server/axe path. A planted owned-code color fault actually fails it; exact restoration passes.
- The first commit contains only tests and its automatic CI is red before explicit source assignment.
  No state calculation, old expected value, helper, unrelated feature or formal artifact changes.
