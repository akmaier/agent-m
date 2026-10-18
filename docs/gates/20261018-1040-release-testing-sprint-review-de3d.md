---
gate: Release testing → Sprint review
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d95e01189ba3981d2caec9e8eb2e30f5beef6c87
  - https://github.com/akmaier/agent-m/pull/883
date: 2026-10-18 10:40 UTC
---
# Release testing → Sprint review: sprint team2/91

**REGISTER**

## Reason

Sprint team2/91 was ended on `sprint/team2/91` at `d95e0118` (`edb23205`) and closed (`638e6570`). Its one selected
item is done. The merge's second parent is the head its gate passed:
- ITM-903 #882 (`e610859e`, on `1bd1fe54`), merged as `d95e0118`.

ITM-906, ITM-911, ITM-910 and ITM-913 were not taken while team 1's sprint 89 holds their modules (agreement 91).

**The release tests.** Run 39119928676, on #883 at `d95e0118`, checks out "Merge d95e0118… into 638e6570…". It runs
every level (mode=all) and passes all twelve jobs. The longest job, python (0), takes 63 s, under the two-minute limit
(agreement 80).

**Agreement 83 on the head.** I checked out `d95e0118` and ran `npm install --prefix src/bridge-build --omit=dev
--ignore-scripts` with `LC_ALL=C`. After the install, `git status` is clean.
- `tests/tunnels-runtime.test.mjs`, `tests/release-itm-286-tunnels-runtime.test.mjs` (the two changed files),
  `tests/ssh2-fixture.test.mjs` and `tests/release-sprint-02-d-traceability.test.mjs` (it lists the tree), on Node 25.9:
  28 tests, 28 pass, 0 fail.

**No installed packages in the history.** `git log --stat origin/main..d95e0118 -- src/bridge-build/node_modules` prints
nothing. The known positive: `git log --all` on the same path finds #873's `3f40f2dc` and `6c99402e`, and neither is an
ancestor of `d95e0118`.

**Today's `main`.** The merge base of `d95e0118` with `main` is `85ddb58e`, an ancestor of `main` at `a9a63c52`. Since
then `main` changed only records: `docs/backlog/sprints/team1/89.md`, `team2/91.md`, `team2/92.md`, one item file and
ITM-903's gate record. `git diff --stat 85ddb58e a9a63c52 -- src tests .github` prints nothing; the known positive, the
same call from `1f0e1ef0` to `85ddb58e`, names 20 files. `git merge-tree --write-tree` merges the head into `a9a63c52`
without a conflict. So the run stands for the merge into today's `main`.
