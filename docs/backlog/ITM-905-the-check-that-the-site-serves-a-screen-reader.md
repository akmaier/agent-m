---
id: ITM-905
title: The check that the site serves a screen reader
level: system
realises:
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-site-frame
builds_on:
tests:
  - system
origin:
  - akmaier's acceptance of the SPEC queue 2026-10-18_every-page-shares-one-look-and-serves-a-screen-reader (c992541c)
---
# ITM-905 The check that the site serves a screen reader

**REGISTER**

## Outcome

SPEC.md:944-949 (accepted in `c992541c`) names its check: `tests/site-accessibility.test.mjs`. "An automatic check of each
route against WCAG 2.2 level AA finds no violation; counter-proof: a planted button without a name fails."

This item builds that check, over every route the frame draws (MOD-site-frame). Its first task, the stop clause: which
automatic WCAG 2.2 AA checker the test runs, and how it reaches the test.
- A checker vendored into the site would fall under `NO SERVER`'s channels (`tests/test_no_backend.py`).
- A test-only package would be installed as CI installs the Bridge packages (`npm install --prefix src/bridge-build`).
The item names the choice and its source before any test. If neither path is open without a change of text, it stops and
the draft goes to akmaier.

The routes that fail today are named as todos with their route and rule. Each fix is an item of the route's module.

## Acceptance

- `tests/site-accessibility.test.mjs` checks every route against WCAG 2.2 level AA and names each violation today as a todo
  with its route and rule. Its counter-proof, a planted button without a name, fails.
- An item is registered for each route's module that has a violation.
