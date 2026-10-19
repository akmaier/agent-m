---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 3c48f495c30c14467cfd92629fbdcafdd267dfb5
  - https://github.com/akmaier/agent-m/pull/1016
date: 2026-10-19 11:06 UTC
---
# Development → Release testing: ITM-1029, passed — a job that needs the product's resources names their pinned states

**REGISTER**

## Reason

ITM-1029 (MOD-resource-list, MOD-job-catalogue), pull request #1016 into `sprint/team1/93`, passes on `3c48f495`. It was
rejected on the same head (20261019-1049) for its missing red on CI.

- **The red is on CI.** Run 39240455498 on `563995f7` alone, through the CI-only draft #1021, has `# cancelled 0`:
  - `# fail 4`: the `kindOf` test of the work kinds and TST-102901 to 102903;
  - `# fail 1`: the `kindOf` test of every shipped definition. That job's 32 todo are known findings.
- **What held at the rejection still holds.** That covers the commits, the recipe against MOD-resource-list.md:118-122, the
  test changes as the item's output, and the counter-proofs.
- **CI:** run 39239900490 passed on the head.
- **Merge-tree:** `git merge-tree --write-tree` onto `sprint/team1/93` (`738fe3ef`) is clean.
- **Replayed in a clean worktree at the head:**
  - `resource-list-pins-recipe`, `job-catalogue` and `job-catalogue-instruction` pass 15 of 15.
  - Counter-proof: without the route's filter (`strategies.mjs:90`), exactly "resource-pins leaves out a resource the job's
    route does not reach" fails.
- **Still open, as recorded at the rejection.** How the runner names the part among a start record's `inputs`, and where
  `params.route` comes from.
