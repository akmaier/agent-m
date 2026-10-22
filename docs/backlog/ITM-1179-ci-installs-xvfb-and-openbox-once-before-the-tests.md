---
id: ITM-1179
title: CI installs xvfb and openbox once, before the tests, and no test installs them
level: system
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-test-schedule
builds_on:
tests:
  - system
origin:
  - CI red across the repository since 2026-10-22 15:30 UTC, full job logs 119946893311, 119945961231 and 119947592791 (ETIMEDOUT, "Linux Openbox installation failed"), reported by the coordinator
---
# ITM-1179 CI installs xvfb and openbox once, before the tests, and no test installs them

**REGISTER**

## Outcome

Six test files install openbox themselves when it is missing, with `sudo apt-get … install openbox` under a 60 s timeout:
- `tests/site-usability.d/browser.mjs:89`;
- `tests/desktop-shell.d/electron.mjs`;
- `tests/desktop-shell.test.mjs`;
- `tests/dashboard-backlog-layout.test.mjs`;
- `tests/release-itm-276-desktop-shell.test.mjs`;
- `tests/release-itm-290-public-settings-layout.test.mjs`.

openbox is 24 packages, 22.9 MB. Since about 15:30 UTC on 2026-10-22, the runner's apt mirror has been slower than the
timeout, and every shard with an Electron or browser test fails: TST-276*, TST-1071*, TST-905*, TST-935004 and 005, and
TST-919001. That is every pull request of both teams, `sprint/team1/109` included.

`.github/workflows/tests.yml` and `nightly.yml` are MOD-test-schedule's files (MOD-test-schedule.md:71). The fix is
there: the node job installs xvfb and openbox once, in a step before the tests, with apt's retries, from a cache where one
is kept. The helpers then find openbox, and install nothing. A step's time counts against the job's two minutes
(`tests.yml:66`).

## Acceptance

- `tests.yml`, and `nightly.yml` where it runs these tests, install xvfb and openbox before the tests, with retries.
- A second run takes them from a cache, or the step's time on a run is recorded.
- On CI no test installs a package. The six helpers' own install stays as the fallback for a local machine.
- CI is green on every shard, each node job stays within its two minutes, and the shard of `tests/site-usability.test.mjs`
  within 90 s. The times of the step and of the slowest shard are recorded in the pull request, from the jobs API.
- Red evidence: the failing run on the base, read from its full job log.
