---
id: ITM-1095
title: The nightly run builds the real Linux Bridge, TST-961006 with BRIDGE_BUILD_REAL=1 under xvfb
level: module
realises:
  - UC-044
  - THE BRIDGE IS ONE FILE PER PLATFORM
modules:
  - MOD-test-schedule
builds_on:
tests:
  - unit
origin:
  - ITM-961's pre-gate (#930), sprint team2/97, on main at 45f37441
---
# ITM-1095 The nightly run builds the real Linux Bridge, TST-961006 with BRIDGE_BUILD_REAL=1 under xvfb

**REGISTER**

## Outcome

TST-961006 (`tests/bridge-build-build-platform.test.mjs`, ITM-961) runs the real npm, electron-builder and Electron, writes
an AppImage and needs a display (xvfb). It runs only with `BRIDGE_BUILD_REAL=1`.
- No job of a pull request may take more than two minutes (SPEC.md:1523-1526, A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES).
  So it cannot run there.
- SPEC.md:1509 names the nightly run among the occasions tests run on, and the two-minute rule is for a pull request's jobs.
- `.github/workflows/nightly.yml` is MOD-test-schedule's file (MOD-test-schedule.md:71, taken over). So the nightly run is
  where this test runs, and changing it is this module's item. No draft is needed: the accepted text names the file, and
  states nothing of its jobs that this changes.

## Acceptance

- `nightly.yml` gains one job on `ubuntu-latest`. It installs xvfb, installs the Bridge app's packages as CI does, and runs
  `tests/bridge-build-build-platform.test.mjs` with `BRIDGE_BUILD_REAL=1` under `xvfb-run`. The job carries its own
  timeout, longer than two minutes, since it is no pull request's.
- A unit test naming MOD-test-schedule reads `nightly.yml` and finds that job, with the variable and `xvfb-run`.
  Counter-proof: the job removed, or the variable dropped, fails it.
- `tests.yml` is unchanged, and `tests/test_ci_budget.py` still passes.
- One run of `nightly.yml`, started by `workflow_dispatch` on the item's branch, is linked in the pull request with its
  result.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `.github/workflows/nightly.yml` and the tests that name MOD-test-schedule change.
