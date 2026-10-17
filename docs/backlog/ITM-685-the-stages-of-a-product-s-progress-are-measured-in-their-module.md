---
id: ITM-685
title: The stages of a product's progress are measured in their module
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - THE MAIN PAGE SHOWS EACH PRODUCT'S PROGRESS BY STAGE
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-685 The stages of a product's progress are measured in their module

**REGISTER**

## Outcome

MOD-progress-measures states `stageShares`, `currentStage`, `buildInProgress` and `waitingForAPerson`, and builds
none of them. Today `src/home/progress.mjs` holds the only working version, on the old core and artifacts. The module
builds them on its own Uses. `src/home/progress.mjs` goes when the main page calls them (ITM-684).

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
