---
id: ITM-894
title: The impact list stands in a box that scrolls
level: module
realises:
  - UC-023
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
modules:
  - MOD-site-frame
builds_on:
  - ITM-876
  - ITM-886
tests:
  - unit
origin:
  - ITM-876's stop (sprint team1/87), from developer-sonnet-d's reading of the style rules
---
# ITM-894 The impact list stands in a box that scrolls

**REGISTER**

## Outcome

akmaier: the impact "also needs to go into a text box with slider". The impact list is `section.change-impact`
(`src/review-pages/sections.mjs:101-114`), and no style rule gives it a box that scrolls. developer-sonnet-d read every
scrolling rule at ITM-876's stop:
- `docs/assets/style.css:68` (`.accepted-diff .diff`, the difference's own style) and `:61` (the editor's preview);
- `:6` and `:47`, horizontal only;
- `src/theme/lme.css:72` (the menu) and `:87` (`.table-scroll`, horizontal);
- nothing in `look.css` or `home.css`.

A new rule cannot go into `docs/assets/style.css`, a file outside every module. MOD-site-frame.md:85 names it as taken
over: "what of it the views' routes still need moves into `look.css`". So the rule for the impact list's box goes into
`look.css` with that move, together with ITM-886's status rules.

## Acceptance

- `look.css` holds a rule that gives `.change-impact` a vertical scrolling box, and the impact list on a file's page and
  on Review all is drawn in it. A test checks the rule and its use, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
