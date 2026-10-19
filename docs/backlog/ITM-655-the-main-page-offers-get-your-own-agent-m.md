---
id: ITM-655
title: The main page offers Get your own Agent M
level: module
realises:
  - UC-014
modules:
  - MOD-main-page
builds_on:
  - ITM-587
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), whose row was blocked on a draft that akmaier accepted in b43da779
---
# ITM-655 The main page offers Get your own Agent M

**REGISTER**

## Outcome

UC-014 step 1: "presses **Get your own Agent M**". MOD-main-page's `home` (accepted text): "the greeting with its
folded explanation and *Get your own Agent M*, which leads to MOD-settings-pages' `get-your-own`". Whether
MOD-settings-pages' `get-your-own` route is built, or which item builds it, is read at the start; if it is not, this item
waits for it.

## Acceptance

- The main page's greeting carries *Get your own Agent M*, which opens MOD-settings-pages' `get-your-own`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
