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

`docs/assets/jobs/propose-backlog-items/job.json` repeats the kind `propose-items`. It goes, as MOD-job-catalogue's
Parts say (`docs/architecture/MOD-job-catalogue.md:45`), and `tests/test_backlog_item_fields.py` (`:13`, `:31`,
`:192-196`) and `tests/test_artifact_format.py` (`:123`) stop reading it. The old process-model reader,
`docs/assets/process-model.mjs`, was removed by `4929406eb`; the old backlog view is gone (`docs/assets/dashboard/` holds
only `built.json`).

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- It is declared as refactoring: CI is green on every commit.
