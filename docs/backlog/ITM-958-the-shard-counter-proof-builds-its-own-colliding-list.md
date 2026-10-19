---
id: ITM-958
title: The shard test's counter-proof builds a list on which plain modulo collides
level: unit
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
modules:
  - MOD-test-schedule
builds_on:
  - ITM-945
  - ITM-948
tests:
  - unit
origin:
  - developer-sonnet-d's finding on ITM-646's pull request #926 (sprint team1/92), run 39155405267, node (12), job 117757481086
---
# ITM-958 The shard test's counter-proof builds a list on which plain modulo collides

**REGISTER**

## Outcome

TST-945005 (`tests/test-schedule-ci-shards.test.mjs:187`) is the counter-proof that a plain `index % count` puts two files
that start Electron into one shard. It runs over the repository's real file list (`repositoryFiles()`, `:190`).

Whether plain modulo collides there depends on where those files happen to fall in the sorted list. On #926 (`d0c28d85`),
a new, unrelated test file shifted the list. Plain modulo then kept the Electron files apart, and TST-945005 failed. So
any pull request that adds a test file can fail CI with no fault of its own.

## Acceptance

- The counter-proof builds its own list, on which plain modulo provably puts two Electron files into one shard, and
  finds that the workflow's partition keeps them apart. Adding a file to the repository changes neither result.
- A test adds files to the real list and finds TST-945005's outcome unchanged. The counter-proof of that test is the
  current version of TST-945005 failing on the shifted list.
- The first commit holds only the tests. No stub is committed.
