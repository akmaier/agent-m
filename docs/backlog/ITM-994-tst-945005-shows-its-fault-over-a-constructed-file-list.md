---
id: ITM-994
title: TST-945005 shows its fault over a constructed file list, not over the repository's files
level: unit
realises:
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-test-schedule
builds_on:
tests:
  - unit
origin:
  - the second gate of ITM-873 (#904, ee5d1364), sprint team2/94; reported to team 1 in team2/94.md, For Team 1
---
# ITM-994 TST-945005 shows its fault over a constructed file list, not over the repository's files

**REGISTER**

## Outcome

TST-945005 (`tests/test-schedule-ci-shards.test.mjs:181-192`, ITM-945) is the counter-proof of the CI partition. It asserts
that plain `index % 8` puts two files that need the Electron into one shard. It builds its lists from `repositoryFiles()`,
the files of the repository at the commit under test. Whether two such files collide under `index % 8` therefore depends on
which file names exist. A new test file of either team can make the assertion false by chance, although the partition is
unchanged.

**The known positive, replayed at #904's second gate on `1edbe699`:**
- with the new file named `tests/progress-measures-no-graph.test.mjs`, TST-945005 fails with "plain index % 8 keeps them
  apart, so these lists cannot show the fault";
- with the same file named `tests/main-page-progress-no-graph.test.mjs`, it passes.
Nothing else changed between the two runs.

The fix: the counter-proof runs over a fixed, constructed file list in which plain `index % 8` puts two files that need the
Electron into one shard, by construction. The check that the workflow's partition keeps them apart stays over the
repository's files.

## Acceptance

- TST-945005 builds its lists from a constructed set of file names, given in the test. It passes whatever test files the
  repository holds.
- Counter-proof: with the partition replaced by plain `index % 8`, TST-945005's second assertion fails over the constructed
  list.
- A test adds a test file of any name to the repository's list and shows that TST-945005's result does not change.
- TST-945001 to TST-945004 keep their identifiers, inputs and expected results.
- Only `tests/test-schedule-ci-shards.test.mjs` and its helpers change.

**Team 1's module.** MOD-test-schedule is held by team 1's running sprint. This item is team 1's to take, or team 2's once
team 1 leaves the module free.
