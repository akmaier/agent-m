---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 62b47f96b8a641809cff6b19817011d8462b7e7f
  - https://github.com/akmaier/agent-m/pull/1305
date: 2026-10-22 20:07 UTC
---
# Development → Release testing: ITM-1179's follow-up, apt reaches the next mirror

**REGISTER**

## Reason

#1305 into `sprint/team2/103`, a follow-up of #1304 (ITM-1179), passes on `62b47f96`. CI is green on 24 of 24.

1. **The cause, from the full job log 120047836731.**
   - Line 49: the cache was not found.
   - Lines 111 to 136: the azure mirror ignored the packages (`Ign:`).
   - Line 718: the fallback `https://archive.ubuntu.com` served them.
   - The developer's `timeout 30` loop had killed apt while it was still retrying the failing mirror.
2. **The change.** In `tests.yml` and `nightly.yml`, there is one `apt-get install --download-only` with no `timeout`,
   and `Acquire::Retries=1` replaces 5, in every apt call. Between the fix commit `98b89969` and the head, the only
   difference is the experiment's line, added by `989dfc3a` and removed again by `62b47f96`.
3. **Red first.** The tests-only commit `d2d4bfca` was pushed alone. On its run, `not ok 299`, TST-1179006 ("the download
   of xvfb and openbox is not cut short and gives up a failing mirror after one retry"), failed.
4. **Times, from the jobs API.**

   | Run | Head | `apt-archives` | Slowest shard |
   |---|---|---|---|
   | 39844719741, cold | `62b47f96` | 17 s | node (4), 81 s |
   | 39844395902, azure made unreachable | `989dfc3a` | 35 s | node (4), 86 s |

   On the second run, the full job log 120053713990 shows the failing mirror: `Ign:` for azure from line 112, and 26
   packages taken from `https://archive.ubuntu.com`. The download completes at line 191.
5. **Scope.** The two workflows, which are MOD-test-schedule's hand-written files, and
   `tests/test-schedule-openbox.test.mjs`. No helper changes.
6. **The reading.** #1305's description names none. #1304, the first pull request of the same item by the same
   developer, named it, and this pull request adds no new text to read.
7. **Release runs on the head, by this gate:**
   - traceability 8 of 8;
   - test levels and expected results: 7 pass and 1 fails, the same failure as on `main` on this machine.

## Open

- **Whether a pull request restores the cache that nightly saves on the default branch** is not shown by a run.
- **A rerun of one shard alone, on a cache miss, still fails.** #1305 does not change this.
  - The node shards' install (`tests.yml`, "Install xvfb and openbox") does not create
    `/home/runner/apt-archives/partial`.
  - On a cache miss without its own attempt's `apt-archives` job, it stops as job 120054035567 did: "Archives directory
    /home/runner/apt-archives/partial is missing".
  - This is the gap the sprint record named as ITM-1179's follow-up (`docs/backlog/sprints/team2/103.md`). It stays
    open, and the remedy is to rerun the whole workflow.
