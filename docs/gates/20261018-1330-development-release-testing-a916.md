---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7cee7361357e85cff55ea2f2f9878d059df68d94
  - https://github.com/akmaier/agent-m/pull/898
date: 2026-10-18 13:30 UTC
---
# Development → Release testing: ITM-916, readHistory reads no commit's changes when told not to

**REGISTER**

## Reason

ITM-916 (MOD-repository-hosts), pull request #898 into `sprint/team1/90`, passes on `7cee7361`.

1. **Red first.** `6d3d4ed4` holds only `tests/repository-hosts-history.test.mjs`. Run 39131190183 is red on exactly TST-916001
   to 916003.
2. **The change** is in `src/repository-hosts/github.mjs` (`history`): with `changes: false`, no commit's changes are read,
   and each entry's `changes` is `[]`. `index.mjs` gains the option in two comments. That is MOD-repository-hosts.md:179-182:
   "With `changes: false`, each entry's `changes` is empty and the history costs one request per page of commits".
3. **Green.** CI on `7cee7361` passes all twelve jobs. node (6) passed on a rerun, job 117687925729, after the
   `Page.navigate` failure outside the item that ITM-930 now fixes. `git merge-tree --write-tree` merges the head into
   `sprint/team1/90` without a conflict (tree `3e22b7c3`).
4. **The Acceptance holds.**
   - I replayed a counter-proof in a clean checkout of the head: with the commit's changes always read, TST-916001 to
     916003 fail. Restored, `src/` is clean.
   - The developer's three counter-proofs each fail their tests.
   - **Measured on a counting fake:** `src/test-pages/runs.mjs:167` goes from 2 requests to 1, and `:217` from 21 to 1.
5. **The reading is accepted:** only `false` skips the changes, and an entry keeps `changes: []`. The readers of `.changes`
   (`review-pages/flow.mjs:288`, `spec-changes/propose.mjs:340`, `workflow-entries/product.mjs:100`,
   `artifact-edits/strategies.mjs:116`) do not pass `false`, so they are unchanged.
6. **Tests (agreement 83).** I ran on the head, with the Bridge packages installed as CI does: the callers' and history
   tests, and `release-uc-042-token-failures`, the release test that imports `src/repository-hosts/`. That was 93 of 93.
   The developer's full local suite has identical failing names on base and head.

**developer-sonnet-c's next item is ITM-928, the same for GitLab.**
