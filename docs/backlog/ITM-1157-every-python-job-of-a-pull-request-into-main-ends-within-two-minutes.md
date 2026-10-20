---
id: ITM-1157
title: Every python job of a pull request into main ends within two minutes
level: module
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-test-schedule
builds_on:
tests:
  - unit
origin:
  - the end gates of sprint team1/97, pull request #1208, run 39423540794
---
# ITM-1157 Every python job of a pull request into main ends within two minutes

**REGISTER**

## Outcome

SPEC.md:1523-1524: every job of a pull request finishes within two minutes. On #1208 (`sprint/team1/97` into `main`), the
job python (2) was stopped at its limit twice: job 118630237898, and job 118632276882 on the rerun. Both times it stopped
after about 152 tests, at `tests/test_verbatim.py`, with no test failed. A pull request into a sprint's branch leaves out
the release tests (`.github/workflows/tests.yml`, `mode=rest`), so no sprint pull request showed it. At sprint 96's end
gate, python (2) took 93 s.

The python job splits the test files into 4 shards by their place in the sorted list (`tests.yml`, `index % count`).
That count is fixed in no module text (MOD-test-schedule.md:71 names the workflow).

**First task:** measure the time of each python test file in `mode=all`, and name which files make python (2) long.

## Acceptance

- The pull request's run, into `main` with the release tests, ends every python job within two minutes, the longest
  named in the pull request with its time. The way, for example more shards, is named with the measurement that chose
  it.
- `tests/test_ci_budget.py` passes. No test is left out, and no test's expected result changes.
- It is declared as refactoring: CI is green on every commit.
