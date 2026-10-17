---
id: ITM-790
title: A job waiting at a gate is resumed on the tab's or a Bridge's route
level: module
realises:
  - UC-034
  - A JOB STOPS AT EVERY GATE
modules:
  - MOD-runtimes
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-790 A job waiting at a gate is resumed on the tab's or a Bridge's route

**REGISTER**

## Outcome

UC-034 step 7, "the job continues". A job stops at a gate on the tab's route (`src/runtimes/tab.mjs:116`), and
MOD-runtimes states `resumeJob` and does not build it (`src/runtimes/index.mjs:7`). This item builds it as the module's
file states it: the resumption appended to the record, naming the gate record, on the head read; the job handed back —
on in the tab; on a Bridge handed over again when `bridge` is given, else taken up when the Bridge next reads the
repository; on CI the push itself goes on.

**Note.** No module file names `resumeJob` among its Uses, so no caller is stated for the tab's and a Bridge's routes
(MOD-main-page: "the job's route resumes or ends the job when it notices the record"). This item builds the function its
module provides; who calls it is a gap of the architecture, named in the report.

## Acceptance

- A job waiting at a gate goes on only after `resumeJob` names a gate record; its record shows the resumption.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
