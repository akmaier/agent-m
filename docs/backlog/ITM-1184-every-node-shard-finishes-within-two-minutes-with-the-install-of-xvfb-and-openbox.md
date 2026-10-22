---
id: ITM-1184
title: Every node shard finishes within two minutes with the install of xvfb and openbox
level: system
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-test-schedule
builds_on:
  - ITM-1179
tests:
  - system
origin:
  - node (4) of #1300 at 4d0e977c cancelled at the job's two minutes, job 120060797923, reported by the coordinator on 2026-10-22
---
# ITM-1184 Every node shard finishes within two minutes with the install of xvfb and openbox

**REGISTER**

## Outcome

Since ITM-1179, every node shard installs xvfb and openbox before its tests (`.github/workflows/tests.yml:108-113`). The
slowest shards now reach the job's limit of two minutes (`tests.yml:89`, SPEC.md:1533-1535). No agent waits on CI for
more than two minutes, and the job limits enforce that.

**Shown on job 120060797923**, node (4) of #1300 at `4d0e977c`, which holds the whole sprint branch. The job ran from
20:10:03 to 20:12:11, 2:08, and was cancelled. Its steps, from the jobs API:

| Step | Seconds |
|---|---|
| setup, checkout, setup-node, cache restore | 7 |
| Install xvfb and openbox | 28 |
| Install Bridge app packages | 9 |
| Dashboard core (the tests) | 81 |

- The tests themselves passed: `# tests 393`, `# pass 392`, `# fail 0`, `# duration_ms 80523` (log lines 2905-2912,
  20:12:09). So the shard failed on time alone.
- **The install step**, read from the log:
  - `apt-get update` from 20:10:11 to 20:10:24, about 13 s;
  - the install from the cached archives, to 20:10:34, about 10 s;
  - the rest is triggers.

  On ITM-1179's own runs the same step took 11 to 13 s, so it varies by run.
- **The slowest shard on earlier runs:** 81 to 92 s.
  - 81 and 86 s: #1305's runs.
  - 92 s: #1300's run 39844872949.
  - 88 s: #1301's rerun 39845096788.
- **How files are partitioned** (`tests.yml`, step "Read the level of each test file"):
  - the sorted files go round-robin across 16 shards (`index % count`);
  - files that start Electron are spread one per shard.

  Nothing in the partition weighs a file's time.

## Acceptance

- Every node shard of `tests.yml` finishes within its `timeout-minutes: 2`, with the install of xvfb and openbox
  included, and the limit stays at two minutes.
- The way is the developer's to choose and to name. It may be more shards, a partition balanced by the files' times, or a
  shorter install step, such as no `apt-get update` when the archives are cached. Whatever is chosen keeps ITM-1179's
  install before the tests, and keeps `tests/test_ci_budget.py` and `tests/test-schedule-openbox.test.mjs` green.
- `nightly.yml` is checked against the same budget where it runs these tests.
- **Shown on CI, from the jobs API:**
  - every shard's time, on two full runs of the pull request;
  - the slowest shard with a margin of at least 20 s under the limit.
- A test of MOD-test-schedule states the rule the partition or the step follows. Counter-proof: today's workflow fails
  it, or, if the rule is a time, the run on the base shows the red.
- The first commit holds only the tests, and CI is red on it.
