---
id: ITM-684
title: The main page is the main-page module's route home
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
modules:
  - MOD-main-page
builds_on:
  - ITM-685
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-684 The main page is the main-page module's route home

**REGISTER**

## Outcome

MOD-main-page builds its route `home` from `src/home/home.mjs` and `cards.mjs`, as its Parts `cards.mjs` and
`waits.mjs` state. `index.html` loads `start.mjs` with this module's view, and `src/home/` goes. The progress it shows is
MOD-progress-measures' (ITM-685).

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Noted at ITM-685's gate (sprint team1/74, 2026-10-17, po-opus).** MOD-progress-measures' `productFacts` builds only the
scope `work`. With it, `requirements`, `graph`, `tests`, `results`, `tags` and `modelSince` are `"unknown"`, so the
Requirements, Tests and Release stages have no share. The main page calls it with the scope `all`, and its request count
is measured at this item's start. The instance's own bar waits for ITM-809.
