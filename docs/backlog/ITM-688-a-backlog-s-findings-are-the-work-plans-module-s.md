---
id: ITM-688
title: A backlog's findings are the work-plans module's
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - UC-032
modules:
  - MOD-work-plans
builds_on:
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-688 A backlog's findings are the work-plans module's

**REGISTER**

## Outcome

MOD-work-plans states `backlogFindings`, and does not build it (`src/work-plans/index.mjs`). The old
`docs/assets/work-items.mjs` holds the only working version. The module builds it. `work-items.mjs` and
`work-items/flow.mjs` go once the backlog view (ITM-681) and the main page (ITM-684) no longer import them.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
