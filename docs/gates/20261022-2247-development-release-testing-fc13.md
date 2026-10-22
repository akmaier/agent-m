---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - a12031e15f6e9838cd7684d882914061905e4551
  - https://github.com/akmaier/agent-m/pull/1310
date: 2026-10-22 22:47 UTC
---
# Development → Release testing: ITM-1183, the download bound against the heaviest shard, rejected a second time

**REGISTER**

## Reason

#1310 (ITM-1183) is rejected a second time, on `a12031e1`. The first point is fixed. The second holds only where the
mirror serves.

**Point 1 is fixed.**
- On a miss, the shard runs `update`, then `timeout 45 apt-get install --download-only` with the mirror switch, then
  an install with no bound. That is the pattern of `apt-archives` and `nightly.yml`.
- The counter-proofs TST-1183009 and 010 fail a bound around the full install.
- Red: job 120130239798 at the tests-only commit `a4c9b283` has `not ok 347` and `not ok 349`.
- Run 39866805148 is green.

**Point 2 holds where the mirror serves.**
- Job 120131973607: node (11), the heaviest shard by run 39866805148, rerun alone after its ref's cache was deleted.
  - line 157: "Cache not found";
  - line 236: the update, "Fetched 36.9 MB in 3s";
  - line 294: the download, "Fetched 23.8 MB in 1s";
  - line 324: "Need to get 0 B";
  - `# fail 0`, in 81 s: install 14 s, tests 50 s.

**Where it does not hold yet: a miss with a stalled first mirror.**
- ITM-1183's Acceptance, "a node shard whose restore finds no cache still installs xvfb and openbox, within its two
  minutes", names no condition on the mirror.
- A stalled azure mirror is no rare case. It happened twice this sprint: job 120073106497, and job 120127801673 of this
  pull request.
- With the 45 s bound, node (11)'s 81 s becomes about 126 s, over the limit. f names this, read from the times.

**Wanted:**
- A download bound short enough for the heaviest shard. The download took 1 to 3 s wherever a mirror served it, so
  15 s leaves room, and gives node (11) about 96 s on a stall.
  - Use the same value in the three places: the node shard, `apt-archives` and `nightly.yml`. One bound, not three.
  - A slow mirror that is not stalled then also gives way to archive.ubuntu.com, whose download has no bound.
- The test pins the value.
- **Shown on CI:** node (11), or whichever shard is heaviest then, rerun alone on a miss with the first download made to
  stall, by an experiment commit reverted after, as #1306 did with `7b334cd0`. It must finish within two minutes, with
  its time from the jobs API.
