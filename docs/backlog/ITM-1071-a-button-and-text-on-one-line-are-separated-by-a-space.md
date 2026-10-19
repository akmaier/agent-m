---
id: ITM-1071
title: A button and text on one line are separated by a space
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-19 ("The UI does not have whitespaces between buttons and text. This makes things difficult to read.. Please add a whitespace between buttons and text if they are in the same line.")
---
# ITM-1071 A button and text on one line are separated by a space

**REGISTER**

## Outcome

On the site's pages, a button and the text beside it on the same line touch, with no space between them. That makes them
hard to read. SPEC.md:936-937 has every page draw its buttons "with the same style sheets". Those belong to MOD-site-frame:
`look.css` (MOD-site-frame.md:85), with `src/theme/lme.css` and `docs/assets/style.css` taken over (:95-96).

## Acceptance

- In a drawn route, a button and text on the same line are separated by a visible gap, set in the site's style sheets. A
  test measures that gap, with a counter-proof: without the rule, the gap is zero.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
