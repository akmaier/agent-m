---
id: ITM-948
title: Every CI shard finishes within two minutes when all levels run
level: unit
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-test-schedule
builds_on:
  - ITM-945
  - ITM-947
tests:
  - unit
origin:
  - sprint team1/91's pull request #919, mode=all run 39149951283, node (5) job 117741356049, found by scrum-master-opus
---
# ITM-948 Every CI shard finishes within two minutes when all levels run

**REGISTER**

## Outcome

**Measured on #919 (`fe44aefc`, run 39149951283).** Eleven jobs passed, and the longest took 1 min 18 s. node (5) was
stopped at the job's two-minute limit (`.github/workflows/tests.yml:66`) after 2 min 11 s.
- Its tests had all finished: 741 tests, 0 failed, `duration_ms` 115,823.
- Its slowest tests were TST-905001 (`site-accessibility.test.mjs`, 60 s), TST-492005 (28 s) and TST-418120 (19 s). The
  other node jobs took between 26 s and 78 s.

The partition in `tests.yml` deals files out by their sorted position, and keeps only the files that start Electron apart
(ITM-945). Mode=all adds the release files to the same eight shards, so it does not see what a file costs.

**First task:** read each node job's file durations in that run, and name the simplest change of the partition or the
shard count that keeps every job of a mode=all run within the limit. If the change needs a file that MOD-test-schedule's
Parts do not name, for example a list of durations, the item stops, and a draft goes to akmaier first.

## Acceptance

- In the sprint pull request's mode=all run, every job finishes within its two-minute limit, and the longest job is
  named with its time.
- `tests/test-schedule-ci-shards.test.mjs` covers the changed partition, with a counter-proof. The files that start
  Electron stay apart (ITM-945, ITM-947).
- The first commit holds only the tests, and CI is red on it. No stub is committed.
