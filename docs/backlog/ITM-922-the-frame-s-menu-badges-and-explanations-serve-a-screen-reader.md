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
origin:
  - ITM-905's findings (sprint team1/89), `tests/site-accessibility.test.mjs`
---
# ITM-922 The frame's menu, status badges and explanations serve a screen reader

**REGISTER**

## Outcome

ITM-905's check finds three rules broken on what the frame draws:
- **aria-required-children,** on every route: `nav#tabs`, a `tablist`, holds children that are no `tab` (`span.soon`). The
  menu is built by `src/site/menu.mjs`, which MOD-site-frame.md:83 names as taken over by `menuOf`, and by the header in
  `docs/index.html`. **This is a lead.** It may be axe's own reading of a `tablist`, and that is read first.
- **color-contrast:** the `.b-accepted` badge on `#uc`, `#uc/UC-001`, `#arc`, `#arc/ARC-001`, `#arc/MOD-reader`, `#module`
  and `#backlog`. The colour is in `docs/assets/style.css`, outside every module. It moves into `look.css` with the live
  page's switch to `start.mjs` (MOD-site-frame.md:85, as for ITM-886), so this part waits for that switch.
- **target-size:** the `summary` of the explanations on the three edit pages, at a phone's width. The frame's `explain`
  draws it.

## Acceptance

- The menu, the status badges and the explanations break none of these rules. The todos are removed, and the check passes,
  with a counter-proof each. The badge colour follows the switch to `look.css`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
