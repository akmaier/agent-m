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
(`src/review-pages/sections.mjs:142`), and no style rule gives it a box that scrolls. Since `c358b76c` the routes' look
lives in `src/site-frame/look.css` and `docs/assets/style.css` is gone; the scrolling boxes there are the editor's preview
(`look.css:163`) and the accepted difference (`.accepted-diff .diff`, `:176`), and none is `.change-impact`'s. The rule for
the impact list's box goes into `look.css`.

## Acceptance

- `look.css` holds a rule that gives `.change-impact` a vertical scrolling box, and the impact list on a file's page and
  on Review all is drawn in it. A test checks the rule and its use, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
