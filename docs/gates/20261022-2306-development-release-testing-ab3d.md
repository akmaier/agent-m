---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - a432057466e851b7bbdadcd3b03faded9df36c8c
  - https://github.com/akmaier/agent-m/pull/1310
date: 2026-10-22 23:06 UTC
---
# Development → Release testing: ITM-1183, a node shard on a cache miss, third round

**REGISTER**

## Reason

ITM-1183, pull request #1310 into `sprint/team2/104`, passes on `a4320574`. CI is green on 28 of 28. Its tree equals
the fix `a8feb4ff`; the experiment `636f25c1` is reverted.

1. **The bound is one, 15 s,** around the download only, in `apt-archives` (`tests.yml:88`), the node shard (:127) and
   `nightly.yml` (:46). TST-1183011 pins it.
   - Red at `857d7163`: job 120133673594 (`not ok 349`, `353`) and job 120133673532 (`not ok 405`, "bounded by 15
     seconds in the three places").
2. **The two minutes on a miss with a stalled mirror, shown on the heaviest shards** (run 39868077250, only the pull
   request's own cache deleted, the stall forced by the experiment):
   - node (4), job 120137481651: 86 s;
   - node (11), job 120138188764: 96 s.
3. **The cancelled run is not ITM-1183's.** node (4), job 120136281734, was cancelled at 158 s. Its full log shows where
   the 83 s install went:
   - 22:55:51 to 22:55:59: the update, 8 s;
   - to 22:56:15: the stall, 15 s;
   - to 22:56:21: the download, 6 s;
   - to 22:56:41: 20 s from "Reading package lists" to "Preconfiguring packages";
   - to 22:56:56: poppler-data unpacking, 15 s;
   - to 22:57:06: libc-bin's trigger, 7 s.

   The last three are the install from archives that every shard runs, with or without a miss. #1306 measured 8 to 40 s
   for it with nothing fetched (job 120081402445: 17 s before "Preconfiguring" there too). The miss adds about 30 s on a
   stall; the variance is the install's own. A shorter bound would not remove it. So ITM-1183's Acceptance is met in
   every case the runs show, and the variance goes to its cause.
4. **The cause is registered as ITM-1193** (MOD-test-schedule, under ITM-1184's line). The install from archives spends
   its time in the preconfiguring step, the unpacking of poppler-data and the triggers. The item measures the remedies
   that address those, not the margin.
