---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 0bbeb7fa
  - https://github.com/akmaier/agent-m/pull/1320
date: 2026-10-23 12:36 UTC
---
# Development → Release testing: ITM-1193, the install of xvfb and openbox no longer spends its time in dpkg

**REGISTER**

## Reason

ITM-1193, pull request #1320 into `sprint/team2/105`, passes on `0bbeb7fa`. Run 39883255636 is green on 28 of 28.

1. **Red first, from the full job log.** Job 120170920958 at the tests-only commit `25aa4f7d` has `not ok 378`, `379`
   and `382` to `385`, with `# fail 6`: the pre-configure hook, its guard, and the read-ahead of dpkg's file lists.
2. **The time, from the jobs API on run 39883255636:** the install step of the 20 node shards took 3 to 6 s, median 4 s.
   - Before, it took 8 to 40 s, median 13 s.
   - ITM-1193 asked for the slowest case to be at most half of 40 s.
3. **Each remedy was measured on its own,** and one that did not move its time was not kept. The description's table
   names each run.
   - **Kept:** the read-ahead of `/var/lib/dpkg/info/*.list` as the node job's first step, and in the install step the
     execute bit taken from four hooks: `dpkg-preconfigure`, update-notifier's check and needrestart's two.
   - **Not kept:** `NEEDRESTART_SUSPEND=1`.
   - This follows sprint 104's agreement: the time was read step by step before any change.
4. **Guarded.** The hooks are taken away only on a runner of GitHub Actions, and a refused `chmod` leaves the install
   slower, never failed. TST-1193004 shows the guard.
5. **Scope:** `tests.yml` and `tests/test-schedule-dpkg-time.test.mjs`. The reading is named in the description.

## Noted

- The head is behind `sprint/team2/105` (ITM-1196 and others merged since). It merges in only `tests.yml` and one new
  test. The merge commit is gated by a green CI run on it, as #1301's was.
- The scratch branch `item/ITM-1193-measure` of the closed #1316 may be deleted. Its runs, which the description cites,
  stay in the Actions history.
