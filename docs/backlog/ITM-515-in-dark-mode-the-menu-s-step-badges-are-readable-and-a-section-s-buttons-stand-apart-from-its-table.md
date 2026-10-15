---
id: ITM-515
title: In dark mode the menu's step badges are readable, and a section's buttons stand apart from its table
level: module
realises:
  - THE SITE WEARS THE PATTERN RECOGNITION LAB'S LOOK
  - UC-020
modules:
  - MOD-site-frame
  - MOD-trace-pages
builds_on:
tests:
  - unit
origin:
  - https://github.com/akmaier/agent-m/issues/519
---
# ITM-515 In dark mode the menu's step badges are readable, and a section's buttons stand apart from its table

**REGISTER**

## Outcome

Reported in issue #519 by the account shima78, for the review pages in dark mode:

- The menu's step badges are unreadable and off-centre: in `src/theme/lme.css` a badge's background is the fixed
  `--metallic-25`, which dark mode does not override, while its digit is `--heading`, which dark mode turns light; the
  badge inherits the body's `line-height: 1.55`, so the digit sits off-centre. The *soon* pill is barely readable for the
  same reason.
- In the specification view, *+ Requirement* stands without any space above the table of its section
  (`src/trace-pages/flow.mjs`, which inserts it before the table; `.btn.small` has no margin).

Afterwards, in light and in dark mode, each badge's digit and the *soon* pill read in a colour that contrasts with their
background, the digit centred in its circle; and *+ Requirement* stands apart from the table below it. The part of the
report about *Change by prompt* is not this item's: that button disappears with the accepted UC-019, UC-020 and the
prompt bar's architecture (ITM-508).

Where the change lies: the header and menu of the lab's look, for light and dark mode, are MOD-site-frame's `look.css`
(its Parts), which the frame links on every page after the page's own style sheets; the badge rules go there, overriding
those of `src/theme/lme.css`. The section's actions are drawn by MOD-trace-pages' specification view, which gives
*+ Requirement* its space. `src/theme/lme.css` and `docs/assets/style.css` lie outside every module's folder and stay as they
are; no change between jobs is needed, since none of the kinds `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` names
fits a style fix and the modules' own files carry it. The closed pull request #512 is a reference only.

## Acceptance

- In both colour schemes, a test reads the rules that apply to a badge and to the *soon* pill and finds a background
  of the scheme's own and a text colour other than it, and a line height that centres the digit; a counter-proof restores
  the fixed `--metallic-25` in dark mode and the test fails.
- In a small DOM, the specification view's *+ Requirement* carries the space that separates it from the table; a
  counter-proof without it fails.
- Nothing of the look changes in light mode beyond the badges' centring; no file outside the two modules' folders
  changes.
