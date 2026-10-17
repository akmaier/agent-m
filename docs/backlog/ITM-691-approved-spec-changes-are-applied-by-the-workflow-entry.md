---
id: ITM-691
title: Approved SPEC changes are applied by the workflow entry
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
modules:
  - MOD-workflow-entries
  - MOD-spec-changes
builds_on:
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-691 Approved SPEC changes are applied by the workflow entry

**REGISTER**

## Outcome

`.github/workflows/apply-approvals.yml` runs `tools/apply_approvals.py`, not the entry `onApprovalsCommitted`, which
MOD-workflow-entries states and builds. The workflow runs the entry and nothing else, and `tools/apply_approvals.py` and
`docs/assets/review-core/apply-approvals.mjs` go. `fetch-sources.yml` is named in MOD-workflow-entries' Parts.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
