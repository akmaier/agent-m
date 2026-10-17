---
id: ITM-686
title: The pages use the markdown renderer's libraries
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
modules:
  - MOD-markdown-render
builds_on:
  - ITM-574
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-686 The pages use the markdown renderer's libraries

**REGISTER**

## Outcome

`docs/assets/vendor/` repeats `src/markdown-render/vendor/`: `mermaid.min.js` and `purify.es.mjs` are the same,
and `marked` is older. The live app and `docs/index.html` use the module's copies, and `docs/assets/vendor/` goes.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- It is declared as refactoring: CI is green on every commit.
