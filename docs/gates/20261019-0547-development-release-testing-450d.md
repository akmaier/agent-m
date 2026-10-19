---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 8e0056ec3adbd50135dac1275061193aa42a2c8d
  - https://github.com/akmaier/agent-m/pull/952
date: 2026-10-19 05:47 UTC
---
# Development → Release testing: ITM-958, the shard test's counter-proof builds its own colliding list

**REGISTER**

## Reason

ITM-958, pull request #952 into `sprint/team2/94`, passes on `8e0056ec`. Team 1 registered the item and asked team 2 to
build it first (team1/92.md, `87b12316`). I checked it in a clone of my own.

1. **Red first.** The first commit, `8d06cbe9`, changes only the test file. On it, TST-945005 and the new TST-958001 fail,
   2 of 12. I replayed this.
2. **Green.** CI run 39206127203 is green on the head, on 20 of 20 jobs. The shard holding the file takes 12 to 63 s, under
   the two-minute limit (`A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`). The file alone takes 30 s locally.
3. **Scope.** Only `tests/test-schedule-ci-shards.test.mjs` changed, a test file whose header names MOD-test-schedule.
   Nothing was renamed or moved. TST-945001 to TST-945004 keep their inputs and expected results.
4. **The Acceptance holds:**
   - TST-945005 builds its own list of SHARDS + 1 files, the first and last needing the Electron. Plain modulo puts them in
     one shard, and the workflow's partition keeps them apart. No file of the repository enters it.
   - TST-958001 adds files to the real list through a mirror of links, both ways, and finds the outcome unchanged.
   - TST-958002 is the counter-proof: the old counter-proof over the repository's list flips on the shifted lists.
   - Replayed: with `counterProof` run over the repository's files again, TST-945005 fails on this head.
5. **`writeDocument` not used:** right. MOD-test-schedule's Uses name it for the schedule's text, and the test writes only
   scratch test files.

**For the review, not a condition:** the developer says SPEC.md and the book chapters 9, 11, 12 and 13 were not read in
full, against the brief. The work does not show it. It is a test-only change that holds to the item's Acceptance, and every
case states its input, expected result and guarded requirement.
