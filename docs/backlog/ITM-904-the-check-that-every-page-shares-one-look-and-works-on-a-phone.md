---
id: ITM-904
title: The check that every page shares one look and works on a phone
level: system
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-site-frame
builds_on:
tests:
  - system
origin:
  - akmaier's acceptance of the SPEC queue 2026-10-18_every-page-shares-one-look-and-serves-a-screen-reader (c992541c)
---
# ITM-904 The check that every page shares one look and works on a phone

**REGISTER**

## Outcome

SPEC.md:936-942 (accepted in `c992541c`) names its check: `tests/site-usability.test.mjs`. "Each route, drawn at a phone's
width and at a desktop's, uses the site's style sheets only, offers no button or link below the minimum target size, and
holds no element wider than the window; counter-proof: a planted table wider than a phone fails."

This item builds that check, in the frame that draws every route (MOD-site-frame). Its first task, the stop clause: which
engine gives the check its geometry. The tests' fixture DOM has no layout. The desktop shell's native tests draw pages in
Electron under CI's virtual screen (`tests/desktop-shell.test.mjs`), and that is the existing way to read real widths. If no
engine the repository already uses can give widths and target sizes, the item stops and reports it.

The routes that fail the check today are named in the test as todos, each with its route and finding, as the repository's
other known findings are. Each fix is then an item of the route's module. A red CI is not left on `main`.

## Acceptance

- `tests/site-usability.test.mjs` draws every route at a phone's width and a desktop's. It checks the style sheets, the
  target sizes and the widths, and names each finding today as a todo with its route. Its counter-proof, a planted table
  wider than a phone, fails.
- An item is registered for each route's module that has a finding.
