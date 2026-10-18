---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 59a55036ffb0bc52c4cf5bf6511c7404121378b6
  - https://github.com/akmaier/agent-m/pull/893
date: 2026-10-18 12:38 UTC
---
# Release testing → Sprint review: sprint team1/89

**REGISTER**

## Reason

Sprint team1/89, pull request #893 of `sprint/team1/89` into `main`, on head `59a55036`. **Nine items are merged, each on the
head its gate passed:**

| Item | Pull request | Gated head |
|---|---|---|
| ITM-705 | #884 | `d5f7c9e0` |
| ITM-904 | #886 | `7fb0f7cf` |
| ITM-914 | #887 | `9e4b69ec` |
| ITM-898 | #885 | `364d1fe6` |
| ITM-905 | #888 | `2f4f37c2` |
| ITM-900 | #890 | `56f7a468` |
| ITM-692 | #889 | `20a406ff` |
| ITM-924 | #891 | `5fc8e004` |
| ITM-878 | #892 | `ca001935` |

ITM-897 stopped at its count and went back to the backlog.

**The release tests.** Run 39127567347 ran on `59a55036` in mode=all: its log holds the step "Run mode=all" for each job.
- **The first attempt** failed only node (4), job 117675817449: one test, "release · gates: the replaced section is
  reachable in git history and kept nowhere in the tree" (`tests/release-sprint-02-c-review-core.test.mjs:204`).
  - It failed in its own cleanup with "ENOTEMPTY: directory not empty, rmdir '…/.git/objects/pack'".
  - No item of this sprint touches that test or what it tests.
  - The rerun of the failed job, 117676472073, passed.
- **The node logs of the passing attempt:**
  - node (0) to (4), (6) and (7) from the run's log, node (5) from its job's raw log (`r893-n5.log`);
  - each ends with `# fail 0`: 4651 tests and 48 todos in all;
  - the todos are the known findings, among them ITM-904's and ITM-905's.
- **The release tests named every sprint pass:** `ok 199 - TST-418104`, `ok 132 - TST-276901`, `ok 528 - TST-377012` and
  `ok 529 - TST-377013`.
- **The release test changed this sprint passes:** UC-006 4d in `release-sprint-01-dashboard-app`, changed by
  developer-sonnet-b, who built none of ITM-878.
- **The two Electron checks did not share a shard.** `tests/site-usability.test.mjs` ran in node (2) and
  `tests/site-accessibility.test.mjs` in node (5). Every job finished within two minutes, the slowest node (2) in 1 min 18 s
  (`A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES`). Should the two ever share a shard, that job is the one to watch.

**The flaky cleanup is not this sprint's to fix.** `tests/release-sprint-02-c-review-core.test.mjs` names `MOD-review-core`,
which is no module. MOD-approvals.md:58 names it as taken over, so only MOD-approvals' job that moves it may change it
(`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`). The race is noted in ITM-690, that job.
