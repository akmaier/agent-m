---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 71feb8425cd91d9df1ce17035bf1080c18dcf700
  - https://github.com/akmaier/agent-m/pull/1304
date: 2026-10-22 19:44 UTC
---
# Development → Release testing: ITM-1179, CI installs xvfb and openbox once, before the tests

**REGISTER**

## Reason

ITM-1179, pull request #1304 into `sprint/team2/103`, passes on `71feb842`. Run 39840833894 is green on 23 of 23 checks in
both its attempts: attempt 1 with a cold cache, attempt 2 with a warm one.

1. **The red, from the full job log.** Job 119946893311 on the base, lines 460 and 469: "Linux Openbox install" ends
   `SIGTERM`, `ETIMEDOUT`, after 60014 ms. i's tests-only commits `b4dd2fe0` and `ae97e5a5` were pushed by themselves.
2. **The design.**
   - A new job, `apt-archives`, downloads the archives of xvfb and openbox once, with `--download-only` and apt's
     retries, into an `actions/cache` keyed by ISO week.
   - Every node shard `needs` it, and installs from those archives. `nightly.yml` does the same inline.
   - One job instead of one install per shard, because sixteen shards fetching at once stalled a cold run.
   - Every job keeps `timeout-minutes: 2`.
3. **Times, from the jobs API.**

   | Job | Cold (attempt 1) | Warm (attempt 2) |
   |---|---|---|
   | `apt-archives` | 13 s | 13 s |
   | slowest shard | node (11), 85 s | node (4), 75 s |
   | site-usability shard | 60 s | 41 s |

   Every shard is under 90 s.
4. **The test.** `tests/test-schedule-openbox.test.mjs`, TST-1179001 to 005, with five counter-proofs, states that both
   workflows install the packages before the tests, from the archives, within the budget.
5. **Scope.** Only `.github/workflows/tests.yml`, `nightly.yml` and the new test change. Both workflows are
   MOD-test-schedule's hand-written files (Parts), not generated. No helper changes, and on CI they find openbox.
6. **The deleted caches.** To measure cold runs, i deleted the repository's Actions caches twice.
   - No workflow on `main` uses `actions/cache`, and `setup-node` is called without its `cache` option. So the deletions
     cleared nothing but the apt cache this pull request adds.
   - The repository's cache list now holds only `apt-xvfb-openbox-Linux-2026-43`.
   - Electron is fetched by each run, not from an Actions cache.
