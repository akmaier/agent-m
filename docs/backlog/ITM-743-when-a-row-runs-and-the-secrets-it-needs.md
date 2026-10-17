---
id: ITM-743
title: When a row runs, and the secrets the schedule needs by name
level: module
realises:
  - UC-027
  - UC-028
  - NO SECRET IN THE REPOSITORY
  - THE TEST SCHEDULE IS DECLARED PER PRODUCT
modules:
  - MOD-test-schedule
builds_on:
  - ITM-250
  - ITM-462
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-743 When a row runs, and the secrets the schedule needs by name

**REGISTER**

## Outcome

MOD-test-schedule's `occasionsOf(row, schedule)` and `secretsNeeded(schedule, resources)`, as its file states them.
Neither is built (`src/test-schedule/index.mjs`'s header), and no item names them.
- `occasionsOf` gives the occasions on which a row runs. UC-028 step 2 shows it for a level with no record on a commit,
  and UC-029 step 4 shows it for a test.
- `secretsNeeded` gives the names of the secrets the ticked rows' resources need, never a value. UC-027 step 4 lists
  them.

## Acceptance

- `occasionsOf` gives, for each row of the default, exactly the ticked columns of that row.
- `secretsNeeded` names the secret of an endpoint called by the ticked row `paid`, and nothing for a row that is not
  ticked on any occasion. No value from a fixture store appears in its result.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-schedule/` and the tests that name MOD-test-schedule change.
