---
id: ITM-767
title: An opened test shows its declaration, counter-proof and history
level: module
realises:
  - UC-029
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - THE NAME IS THE ID AND IT SURVIVES
modules:
  - MOD-trace-pages
builds_on:
  - ITM-766
  - ITM-751
  - ITM-743
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-767 An opened test shows its declaration, counter-proof and history

**REGISTER**

## Outcome

The detail of a row of the `tests` view, `trace/tests/<TST>` (UC-029 steps 4 and 5, 5a, 5b):
- its declaration: level, guarded identifiers, precondition, input and expected result;
- when the schedule runs it (`occasionsOf`);
- its counter-proof record, rendered from its file, and the participant it names as the participant that wrote the
  test;
- a link to its code (`webLinks`);
- its history through `testHistory`: one mark per commit of the default branch, one row per release tag, flaky commits
  marked, and a model-dependent test's rate per release as a line with its runs;
- a test that was removed, marked as removed at the commit that removed it (5a);
- a run's log that the server no longer keeps, marked *no longer available* (5b).

**A reading.** "the participant that wrote it" (step 4) is read from the counter-proof record's `participant`. No
other text records who wrote a test.

**A reading of 5a.** The commit that removed a test is the first commit in its file's history (`readHistory`) whose
version of the file no longer declares it.

## Acceptance

- On fixtures, the tests state each part above, including a flaky commit, a rate line and a removed test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.

**Stopped at its first task (sprint team1/101, developer-sonnet-c):** the schedule, the counter-proof's participant and
the link to the test's code have no interface among MOD-trace-pages' uses.
- The drafts, by developer-sonnet-c: MOD-trace-pages' uses gain `scheduleSchema`, `defaultSchedule` and `resultSchema`.
- MOD-repository-hosts' `WebLinks` gains a page of one file at a ref, which MOD-trace-pages uses.
- The item waits for their acceptance.

