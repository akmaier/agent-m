---
id: ITM-742
title: The findings of a schedule
level: module
realises:
  - UC-027
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - COMMIT TESTS CALL NO PAID SERVICE
  - THE TEST SCHEDULE IS DECLARED PER PRODUCT
modules:
  - MOD-test-schedule
builds_on:
  - ITM-250
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
  - ITM-476's prerequisite "Validate the declared schedule with its owner's schema and findings", separated from it as ITM-635 was
---
# ITM-742 The findings of a schedule

**REGISTER**

## Outcome

MOD-test-schedule's `scheduleFindings(schedule, participants)`, as its file states it, in `rules.mjs` behind
`index.mjs`. `src/test-schedule/index.mjs` builds only `scheduleSchema` and `defaultSchedule`. UC-027 step 2 needs
the rules before the page can show them, and `ciConfiguration` refuses a schedule with an error finding:
- a row whose *release candidate* cell is not ticked;
- the row `paid` ticked for *every commit* or *pull request*;
- `runs on` naming a participant without *run code and tests*, or without a runner route.

Each finding names the row and the column. ITM-476 consumes this function unchanged and does not build it again.

## Acceptance

- On fixture schedules and a fixture participant list: the default gives no finding; each of the three rules gives one
  error finding naming its row and column; a schedule breaking two rules gives both.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-schedule/` and the tests that name MOD-test-schedule change.
