---
id: ITM-945
title: The CI shards keep the files that start Electron apart
level: unit
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
modules:
  - MOD-test-schedule
builds_on:
tests:
  - unit
origin:
  - ITM-935's pull request #911 (sprint team1/91), measured by developer-sonnet-e
---
# ITM-945 The CI shards keep the files that start Electron apart

**REGISTER**

## Outcome

**Measured on ITM-935's pull request #911 (sprint team1/91).** CI's node shards take the test files in sorted order,
`index % 8` (`.github/workflows/tests.yml:83-98`). Three files that start Electron fell into one shard:
`desktop-shell`, `site-accessibility` and `site-usability`. They take turns through one fixture lock, and `site-usability`
gave up after its 30-second wait (`tests/site-usability.d/browser.mjs:64`), with all 130 of its tests failing (job
117716321361).
- They fell together only because ITM-935's two new files sort before them and shift them by two. So any file added
  before them can cause this, in any pull request.
- With all three in one shard, the job also comes near the two-minute limit.

The partition places the test files that start Electron in different shards, whatever files sort before them, and keeps
every other file's share as it is. MOD-test-schedule.md:70 names `.github/workflows/tests.yml` as this module's.

## Acceptance

- No two test files that start Electron share a node shard, in every mode. A test runs the partition over the repository's
  test files, and over a list with files added before them, and finds the Electron files in distinct shards. Its
  counter-proof is `index % 8` alone.
- Every node job of the next mode=all run stays within two minutes.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
