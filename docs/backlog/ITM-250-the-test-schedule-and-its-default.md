---
id: ITM-250
title: The test schedule and its default
level: module
realises:
  - UC-013
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - THE DEFAULT SCHEDULE FOLLOWS THE BOOK
modules:
  - MOD-test-schedule
builds_on:
tests:
  - unit
origin:
  - UC-013
---
# ITM-250 The test schedule and its default

**REGISTER**

## Outcome

MOD-test-schedule's `scheduleSchema` and `defaultSchedule`, as its file states them, in `src/test-schedule/`: the schema
of a product's `docs/tests/schedule.md` in `schedule.schema.md`, and the book's default in `default-schedule.md`, marked
as the default. They give the complete run of a release candidate the levels it runs, the command that runs them and the
runner of each (MOD-release-evidence). The findings of a schedule, the CI configuration generated from it and
its proposal are UC-027's and not part of this item. Nothing else of the module is part of this item.

## Acceptance

- Unit tests that name MOD-test-schedule state, before the code exists: the default read with the schema, its rows and
  columns as the module's file gives them, every row ticked for the release candidate, and marked as the default; a
  product's schedule read with the schema; a schedule of another shape named by MOD-documents' findings.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/test-schedule/` and the tests that name MOD-test-schedule change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS
  MODULES`).
