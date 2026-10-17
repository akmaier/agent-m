---
id: ITM-699
title: The old process-model reader and job file go
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
modules:
  - MOD-model-catalogue
  - MOD-job-catalogue
builds_on:
  - ITM-681
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-699 The old process-model reader and job file go

**REGISTER**

## Outcome

`docs/assets/process-model.mjs` repeats MOD-model-catalogue's `modelFindings` and `catalogue`, and
`docs/assets/jobs/propose-backlog-items/job.json` the kind `propose-items`. Once the old backlog view is gone, both go,
and `tests/test_backlog_item_fields.py` and `test_artifact_format.py` stop reading the job file.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- It is declared as refactoring: CI is green on every commit.
