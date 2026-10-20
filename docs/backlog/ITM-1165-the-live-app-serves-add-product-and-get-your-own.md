---
id: ITM-1165
title: The live app serves #add-product and #get-your-own with the settings view's routes
level: module
realises:
  - THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
  - UC-014
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-684's stop at its first task (team 2's sprint 100, developer-sonnet-h) and the probe of docs/index.html recorded there
---
# ITM-1165 The live app serves #add-product and #get-your-own with the settings view's routes

**REGISTER**

## Outcome

The live review page, `docs/index.html`, runs `src/site-frame/dashboard-app.mjs`, "the live page's app" until it starts
through `start.mjs` (MOD-site-frame.md:94).
- It serves MOD-settings-pages' route `add-product` at the old address `#add`, and does not serve `get-your-own` at all.
- Probed with `tests/app-harness.mjs`' `openDashboard`, `#add-product` and `#get-your-own` render the same use-case list as
  an address no view answers. `#add`, `#settings`, `#use-case/id=…`, `#spec-entry/id=…` and `#process` are served.

The new main page (ITM-684) links "+ Add product" and *Get your own Agent M* to the routes MOD-settings-pages names. So
the live app serves those two names with the settings view's routes, as it serves `#add`. This is an implementation
change inside MOD-site-frame's own part, with no interface change, and needs no draft.

## Acceptance

- `docs/index.html#add-product` draws MOD-settings-pages' `add-product`.
- `docs/index.html#get-your-own` draws its `get-your-own`, with `step=` passed.
- A test checks both, against an address no view answers, with a counter-proof.
- `#add` keeps working.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
