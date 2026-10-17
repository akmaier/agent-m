---
id: ITM-747
title: The writer that sets up CI in a run
level: module
realises:
  - UC-027
  - A RUN SETS UP CI BEFORE IT IMPLEMENTS
  - THE DEFAULT SCHEDULE FOLLOWS THE BOOK
modules:
  - MOD-test-schedule
builds_on:
  - ITM-746
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-747 The writer that sets up CI in a run

**REGISTER**

## Outcome

MOD-test-schedule's `scheduleStrategies` with its writer `ci-configuration`, which the kind `set-up-ci` names
(`src/job-catalogue/kinds/set-up-ci/kind.md`). The writer takes the product's schedule, or the default where there is
none, and passes it through `proposeSchedule` with the job's provenance lines (UC-027's opening paragraph). The set is
not built, and no item builds it. ITM-572 lists `scheduleStrategies` among the sets that join "as the items that build
them add them". Registering the set is ITM-755.

## Acceptance

- With a fake host and a fixture job context: a product without a schedule gets the default proposed, with the job's
  provenance lines on its commit; a product with a schedule gets its own.
- `prepareJob` of `set-up-ci` with the set registered finds the writer.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-schedule/` and the tests that name MOD-test-schedule change.
