---
id: ITM-1191
title: On a screen up to 760 px wide the menu is one button that unfolds and folds its entries
level: module
realises:
  - UC-046
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
  - system
origin:
  - akmaier's request ("Fold below 760 px."), accepted in MOD-site-frame at blob 2a232661 (f35b9903) and UC-046 at fcbc9d83 (9559c14f), 2026-10-22
---
# ITM-1191 On a screen up to 760 px wide the menu is one button that unfolds and folds its entries

**REGISTER**

## Outcome

The accepted text:
- `docs/architecture/MOD-site-frame.md`: `menu.mjs` draws the eight entries and, on a screen up to 760 px wide, the button
  that folds them.
  - Its click unfolds the entries one under another, and a second click folds them.
  - On a wider screen the button is not shown, and the entries stand in a row.
  - look.css's phone rules hold "The menu".
- UC-046 step 2 says the same.

## Acceptance

- At 760 px and below, the menu is one button.
  - It is named *Menu* and states its fold with `aria-expanded`.
  - It meets the target size of EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE.
  - A click unfolds the eight entries, and a second click folds them.
- Above 760 px no button is shown, and the entries stand in a row.
- TST-920001 and TST-920002 (`tests/site-usability.test.mjs`, system) change with it. They are written by a developer who
  does not build this item.
- Nothing else of the menu changes.
- The first commit holds only the tests, and CI is red on it.
