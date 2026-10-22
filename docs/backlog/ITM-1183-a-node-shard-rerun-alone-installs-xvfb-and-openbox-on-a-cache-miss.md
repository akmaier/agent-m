---
id: ITM-1183
title: A node shard rerun alone installs xvfb and openbox on a cache miss
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
  - job 120054035567, node (0) of run 39842730231 attempt 3 (#1300 at 90923457), rerun alone; the gate of #1305 (docs/gates/20261022-2007-development-release-testing-c30c.md, "Open")
---
# ITM-1183 A node shard rerun alone installs xvfb and openbox on a cache miss

**REGISTER**

## Outcome

ITM-1179 (#1304, #1305) has the job `apt-archives` download xvfb and openbox into an Actions cache. Every node shard
`needs` it, restores that cache, and installs from it. A shard rerun alone does not run `apt-archives` again. When its
restore finds no cache, its install fails before any test.

**The path, read on `sprint/team2/103` at `3ed501f9`** (`.github/workflows/tests.yml`):
1. `:103-107`, the shard's step "Restore the downloaded archives of xvfb and openbox" restores
   `/home/runner/apt-archives` by key `apt-xvfb-openbox-<os>-<week>`.
2. `:108-113`, "Install xvfb and openbox" runs `apt-get install` with
   `Dir::Cache::archives=/home/runner/apt-archives`. It does not create the folder or its `partial` subfolder. Only
   `apt-archives` does that, at `:81`.
3. On a miss the folder is absent, and apt stops.

**Shown on job 120054035567** (node (0) alone, attempt 3 of run 39842730231):
- line 155, 19:56:42: `Cache not found for input keys: apt-xvfb-openbox-Linux-2026-43, apt-xvfb-openbox-Linux-`;
- line 204: `E: Archives directory /home/runner/apt-archives/partial is missing.`;
- line 205: exit code 100.

**Open: why the cache was missing.** The same run's `apt-archives` had saved that key in attempt 1 (job 120047836731,
line 753, `Cache saved with key: apt-xvfb-openbox-Linux-2026-43`). The repository's caches were deleted shortly before,
to measure #1305's cold run 39844719741, created at 19:58:12. Whether that deletion caused this miss is not shown. Either
way, a shard must not depend on the cache being there.

The remedy until this item is built: rerun the whole workflow, not one shard.

## Acceptance

- A node shard whose restore finds no cache still installs xvfb and openbox, within its two minutes, and on a hit it
  fetches nothing.
- `nightly.yml`, where it runs these tests, holds the same.
- A test of MOD-test-schedule states both for the two workflows. Counter-proof: today's install step, without the folder,
  fails it.
- Shown on CI: one shard rerun alone after the cache is removed is green, with its time from the jobs API.
- The first commit holds only the tests, and CI is red on it.
