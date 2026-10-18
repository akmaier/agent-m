---
id: ITM-947
title: The shard test finds the Electron files by the partition's rule
level: unit
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-test-schedule
builds_on:
  - ITM-945
tests:
  - unit
origin:
  - ITM-935's pull request #911 after merging the sprint branch (sprint team1/91)
---
# ITM-947 The shard test finds the Electron files by the partition's rule

**REGISTER**

## Outcome

ITM-945's `tests/test-schedule-ci-shards.test.mjs` keeps its own list of the files that start Electron (`ELECTRON`, `:32-40`,
seven files). It builds its cases on that list's count, not on the partition's rule. So it broke as soon as ITM-935 added
an eighth file that calls `stageElectron` (run 39143619737, job 117722884113):
- TST-945007 builds "as many files as shards" by adding one copy to the seven. With eight real files that is nine, so the
  partition fails as designed and the test fails.
- TST-945004 counts the new file among "every other file", because the list does not name it. So the test reports that
  file as moved.
A list kept by hand beside the rule it mirrors is a second copy of that rule (AGENTS.md §2, "nothing twice").

## Acceptance

- The test finds the files that start Electron by the partition's own rule, the text that calls `stageElectron` or names
  `native-fixture-lock`, and keeps no list of them.
- TST-945007 builds exactly as many such files as shards, whatever the real count is. TST-945006 builds one more than
  shards. Both pass with the repository's eight files and would with seven, as a test over a smaller copy shows.
- The first commit holds only the tests, and CI is red on it as it is on #911 today. No stub is committed.
