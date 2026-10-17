---
id: ITM-695
title: A group file is written by the group-document module
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - ARTIFACTS ARE ARRANGED IN NESTED GROUPS
modules:
  - MOD-group-document
builds_on:
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-695 A group file is written by the group-document module

**REGISTER**

## Outcome

MOD-group-document states `groupFileText` and does not build it (`src/group-document/index.mjs:4`). The old
`docs/assets/artifacts/groups.mjs` holds the only working version. The module builds it, `tests/test_groups.py` is
rewritten on it, and `groups.mjs` goes.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
