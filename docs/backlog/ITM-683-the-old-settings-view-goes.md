---
id: ITM-683
title: The old settings view goes
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - UC-042
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
  - ITM-574
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-683 The old settings view goes

**REGISTER**

## Outcome

`#settings` already shows MOD-settings-pages' route. `docs/assets/dashboard/settings-view.mjs` is reached only for
`tokenBannerHtml`, which becomes MOD-site-frame's `notice` (`token-expiring`, `token-refused`) in the live app.
`settings/endpoints.mjs` is reached by no route. Both go.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
