---
id: ITM-849
title: The Python suite of a pull request runs in four shards
level: unit
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-test-schedule
builds_on:
tests:
  - unit
origin:
  - the gate of pull request #795 (docs/gates/20261017-2210-development-release-testing-be7d.md), and sprint team2/79's pull request #792 into main, whose job python (0) is cancelled at its two-minute limit
---
# ITM-849 The Python suite of a pull request runs in four shards

**REGISTER**

## Outcome

On a pull request into `main`, `.github/workflows/tests.yml` runs every Python test, and the job `python (0)` of sprint
team2/79's pull request #792 is cancelled at two minutes; all its tests pass in 111 s. The workflow's header names the
remedy: the suite is split.

MOD-test-schedule's Parts name `.github/workflows/tests.yml` as taken over, "since GitHub fixes their place, until this
module generates `agent-m-tests.yml`". So the file is changed by this module's job, in its place:
- the Python job's matrix goes from `shard: [0, 1]` to `[0, 1, 2, 3]`;
- the count that the job passes to `level.mjs` goes from `2` to `4`.

No limit changes, no test moves, and the node job stays as it is. The change is the diff of `190cb959` (#795). That
commit's parent is `sprint/team2/79`, and its provenance line names no item, so the diff is committed again on this
item's branch.

## Acceptance

- The Python job of `.github/workflows/tests.yml` runs four shards, and `level.mjs` is given the count 4. No other line
  of the file changes.
- Every job keeps `timeout-minutes: 2`, and `tests/test_ci_budget.py` passes unchanged.
- No other file changes.
- It is declared as refactoring: CI is green on every commit.
