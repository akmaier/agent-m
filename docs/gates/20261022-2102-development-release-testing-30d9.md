---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - fd806db8272f95f3d2b1b5300ef9cbb80bd9bc75
  - https://github.com/akmaier/agent-m/pull/1306
date: 2026-10-22 21:02 UTC
---
# Development → Release testing: ITM-1184, every node shard within two minutes with the install

**REGISTER**

## Reason

ITM-1184, pull request #1306 into `sprint/team2/103`, passes on `fd806db8`. Run 39851916231 is green on 28 of 28 checks in
both attempts. Only `.github/workflows/tests.yml`, `nightly.yml` and the two test files of MOD-test-schedule change.

1. **The way, named in the description.**
   - 20 node shards instead of 16. A file that starts Electron stands alone on one of the first shards, and the other files
     share the rest round-robin.
   - A shard installs from the cached archives and package lists with `--no-download` and no `apt-get update`. Only when
     that fails does it update and install from the mirror.
   - The limit stays `timeout-minutes: 2`. Both ways are among those ITM-1184's acceptance names.
2. **Times, from the jobs API.**

   | Attempt | `apt-archives` | Slowest node shard | Margin |
   |---|---|---|---|
   | 1, cold for the new cache key | 12 s | node (9), 67 s | 53 s |
   | 2 | 38 s | node (0), 75 s | 45 s |

   - Both margins are above the 20 s the item asks for. The base was 125 s (job 120060797923).
   - node (0)'s install in attempt 2 took 40 s with nothing fetched. Its full log (job 120081402445) has the cache
     restored at 20:50:44 and no `Get:` or `Hit:` line, so the install ran with `--no-download`. It then spends 17 s
     between apt's package list (20:50:46) and "Preconfiguring packages" (20:51:03). Why is not shown. The install step
     varies between 8 and 40 s, and that variance is why the margin is not larger.
3. **Red, from the full job logs.**
   - The base: job 120060797923, 2:08, tests passing in 81 s.
   - The install tests, at `e4b4222c`: node (14) of run 39851695739 (job 120079375148) fails TST-1179002, TST-1179005 and
     TST-1184003, with `# fail 3`.
   - **The partition tests, at `4a574ee5`.** The first run (39849945557) had no shard run: its `apt-archives` stalled on
     the mirror and was cancelled.
     - This gate reran that run. Attempt 2, node (9), job 120085210016, fails TST-945004, TST-1184001, TST-1184002,
       TST-948001 and TST-948003, with `# fail 5`. These are the five the description names from the local run.
     - Lines 245 and 246 of that log are `# TODO` cases and are not counted as failures.
   - **The stalled-mirror test, at `cb0458bb`.** Its first run failed before any test: the cache was deleted, and
     "partial is missing".
     - This gate reran that run. Attempt 2, node (14), job 120085175411, fails `not ok 353`, TST-1179006 ("the download of
       xvfb and openbox is bounded, and a stalled mirror gives way to archive.ubuntu.com").
   - So every tests-only commit now has its red on CI, and a local red alone does not have to suffice.
4. **The bounded download, beyond the brief.**
   - #1305 had removed a `timeout` that killed apt while it still retried. This one is different: the 45 s bound comes
     with a switch of the mirror list to archive.ubuntu.com, and a second, unbounded download.
   - The cause is in job 120073106497: azure sent poppler-data at 20:34:11 and nothing more until the cancellation at
     20:36:39.
   - The known positive is job 120075675998, at the experiment commit `7b334cd0` (bound at 1 s). The mirror list is
     rewritten at line 123, it holds 34 B at line 152, the download completes at line 172, and the job took 15 s. The
     experiment is reverted at `a01d466e`.
   - The cache key now names the lists: `apt-xvfb-openbox-lists-…`.
5. **nightly.yml has no two-minute limit, and that is right.**
   - SPEC.md:1533-1535: "Every job that the CI of Agent M's own repository runs on a pull request finishes within two
     minutes", checked on `.github/workflows/tests.yml`.
   - `nightly.yml` runs on `schedule` and `workflow_dispatch` only, at `fd806db8` lines 8-11, so it runs no job on a pull
     request. Its node job keeps `timeout-minutes: 30` (line 91).
6. **Callers.** The description names every test that reads the partition or the install:
   - `tests/test-schedule-ci-shards.test.mjs`;
   - `tests/test-schedule-openbox.test.mjs`;
   - `tests/test_ci_budget.py`;
   - `tests/test-schedule-nightly.test.mjs`.

   On the head, this gate ran the two node files (22 of 22) and `tests/test_ci_budget.py`, all passing.
7. **The reading is not named in #1306's description,** as it was not in #1305's.
   - The item builds on ITM-1179, by the same developer, on the same files and the same SPEC sentence. #1304's
     description named that reading: AGENTS.md, SPEC.md's A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES, and book chapters
     9, 11, 12 and 13.
   - The gate takes that reading. Two pull requests in a row without it go to the retrospective.
8. **Release runs on the head, by this gate:**
   - traceability 8 of 8;
   - test levels and expected results: one fails, `test_the_tests_of_the_repository_that_read_a_document_are_listed`, the
     same as on `main` on this machine.

## Open

- **ITM-1183 is not done by this.**
  - The shard now creates `apt-archives/partial` and `apt-lists/partial` (`cfafeb06`), and on a miss it updates and
    installs from the mirror.
  - No test pins that folder. TST-1184003 reads that the install runs with `--no-download` and no update before it, and
    allows an update after it.
  - No single-shard rerun after a cache miss is shown on CI.
  - ITM-1183's acceptance asks for both, so it stays in the backlog. Its remaining work is smaller now.
- **Whether a pull request restores nightly's cache from `main`** is still not shown.
