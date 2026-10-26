---
id: ITM-1213
title: The schedule declares shards, a time limit and a setup, and names the test files of a row (testsOfRow)
level: module
realises:
  - THE TEST SCHEDULE IS DECLARED PER PRODUCT
  - COMMIT TESTS CALL NO PAID SERVICE
  - UC-027
modules:
  - MOD-test-schedule
builds_on:
  - ITM-742
  - ITM-1211
tests:
  - unit
origin:
  - ITM-476, split after akmaier accepted MOD-test-schedule on 2026-10-26 (33f3ab1b)
---
# ITM-1213 The schedule declares shards, a time limit and a setup, and names the test files of a row (testsOfRow)

**REGISTER**

## Outcome

MOD-test-schedule's Data as accepted (MOD-test-schedule.md, Data):

- `schedule.schema.md` gains the front matter `setup`, `cache` and `minutes` and the column `shards` of `## Levels`;
  `report` goes. `command` is the command that runs the files a job is given. The default schedule has none of them and
  one shard per row. `scheduleFindings` finds a `shards` or `minutes` that is not a whole number from 1.
- `testsOfRow(row, files) -> { files, unreadable }` in the new part `rows.mjs`: the committed files named as tests
  (`isNamedTestFile`, ITM-1211), a file's level its header's `Level:` or else the one level all its declarations share;
  the row of a level runs those of that level none of whose declarations names a paid service, the row `paid` every file
  one of whose declarations does; a named test file whose level cannot be read is in `unreadable`. Pure, in path order;
  `UnknownRow` for a row the schema does not name.

## Acceptance

- Unit tests naming MOD-test-schedule: a schedule with `shards`, `setup`, `cache` and `minutes` validates, and one with
  `shards: 0` or `minutes: x` has a finding; `report` is no longer a field. `testsOfRow` over fixture files: a unit file,
  a file whose header says `Level:`, a file calling a paid service (in `paid`, not in its level), a helper (in none), a
  file with no readable level (in `unreadable`), and `UnknownRow`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-schedule/` and the tests that name MOD-test-schedule change.
