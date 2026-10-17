---
id: ITM-681
title: The backlog is the implementation pages' route
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - UC-032
  - UC-033
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-574
  - ITM-688
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-681 The backlog is the implementation pages' route

**REGISTER**

## Outcome

MOD-implementation-pages builds its route `backlog` (its module file, Interfaces), which it states and does not
build (`src/implementation-pages/index.mjs:3`), on MOD-work-plans' `backlogFindings` (ITM-688). Only then does the live
app show it, and `docs/assets/dashboard/backlog-view.mjs` goes. The adapters `process-view.mjs` and `roles-view.mjs` go,
since the app shows the routes `process` and `roles` directly.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
