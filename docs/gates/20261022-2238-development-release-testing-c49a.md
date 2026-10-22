---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - cabe56e63dbd899481821c324d09e9a88e87069e
  - https://github.com/akmaier/agent-m/pull/1310
date: 2026-10-22 22:38 UTC
---
# Development → Release testing: ITM-1183, a node shard on a cache miss, rejected once

**REGISTER**

## Reason

ITM-1183, pull request #1310 into `sprint/team2/104`, is rejected once, on `cabe56e6`. Most of it holds, and two
points do not.

**What holds.**
- **Red first, from the full job log.** Job 120126174241, node (8) of run 39865349413 at the tests-only commit
  `a921f3c1`, has `not ok 335` (a shard whose cache is gone gives up a stalled mirror within two minutes) and
  `not ok 340` (nightly fetches nothing on a hit), with `# fail 2`. ok 333 to 339 are in the same log.
- **The miss is shown on CI.** Job 120127801673, node (8) rerun alone after its ref's cache was deleted:
  - line 157: "Cache not found", and no "partial is missing";
  - line 267 (22:35:00): the mirror is switched after the bound;
  - line 467: openbox is installed, and the tests pass with `# fail 0`;
  - 108 s in all: install 73 s, tests 17 s.
- **Scope.** The two workflows and `tests/test-schedule-apt-miss.test.mjs` (TST-1183001 to 008, system, the steps' own
  shell against a model of apt), with seven counter-proofs. Run 39865635959 is green.

**1. The shard's bound cuts a full install, not a download.**
- In `tests.yml`'s node shard, the miss path runs `timeout 45 apt-get … install`.
- `apt-archives` in the same file and `nightly.yml` in this pull request bound only `install --download-only`, then
  install without a bound.
- A bound around a full install can stop apt while dpkg unpacks or configures. Read from the code, and not shown by a
  run, that would leave dpkg interrupted, and the fallback install would then fail. The node shard's install from the
  cache took up to 40 s (#1306, job 120081402445), most of it in dpkg.
- **Wanted:** the shard's miss path follows its own repository's pattern (AGENTS.md §6a.1). The download is bounded and
  switches the mirror, and the install, from the archives then present, has no bound. A counter-proof shows that a bound
  around the full install is refused by the test.

**2. "Within its two minutes" is shown on the lightest shard only.**
- ITM-1183's Acceptance: "A node shard whose restore finds no cache still installs xvfb and openbox, within its two
  minutes". That means any node shard, not one.
- node (8)'s tests took 17 s. The heaviest shard's tests took 52 s (node (4), #1306's run 39851916231).
- With the 73 s install of this miss, about 10 s of setup and 5 s of Bridge packages, node (4) would need about 140 s.
- **Wanted:** show the heaviest shard within two minutes on a miss, from the jobs API, or name why it cannot fit.
  - Bounding only the download may shorten the miss enough: the download itself took 1 to 3 s where the mirror served
    it.
  - If it cannot fit, the item stops under AGENTS.md §6a.6 and says so. The remedy is then a decision, not a margin
    left to chance.

**The 20 s margin is ITM-1184's,** for full runs with the cache restored. It is not ITM-1183's Acceptance, and this gate
does not apply it to the miss.
