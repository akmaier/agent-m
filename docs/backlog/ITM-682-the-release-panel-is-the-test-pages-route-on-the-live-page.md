---
id: ITM-682
title: The release panel is the test pages' route on the live page
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - UC-013
modules:
  - MOD-test-pages
  - MOD-site-frame
builds_on:
  - ITM-574
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-682 The release panel is the test pages' route on the live page

**REGISTER**

## Outcome

The live app shows the route `release` directly, and the adapter `docs/assets/dashboard/release-view.mjs` goes.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says. Besides, only MOD-site-frame's files that dispatch `#release` change: `src/site-frame/dashboard-app.mjs`,
  `src/site/views.mjs` and `docs/assets/dashboard/built.json` (sprint team2/96, #1075).
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- It is declared as refactoring: CI is green on every commit.
