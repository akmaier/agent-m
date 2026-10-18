---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4dc1a472c8021e189f78b98b967c6ba34718828c
  - https://github.com/akmaier/agent-m/pull/900
date: 2026-10-18 13:42 UTC
---
# Development → Release testing: ITM-928, GitLab's readHistory reads no commit's changes when told not to

**REGISTER**

## Reason

ITM-928 (MOD-repository-hosts), pull request #900 into `sprint/team1/90`, passes on `4dc1a472`.

1. **Red first.** `14027bbc` holds only tests. Run 39132190068 is red on exactly TST-928001 to 928003.
2. **The change** is in `src/repository-hosts/gitlab.mjs` (`history`): with `changes: false`, no commit's diff is read, and
   each entry's `changes` is `[]`. That is the same shape as ITM-916, under the same sentence, MOD-repository-hosts.md:179-182.
3. **Green.** Run 39132392770 on `4dc1a472` passes all twelve jobs. `git merge-tree --write-tree` merges the head into
   `sprint/team1/90` without a conflict (tree `fdb24535`).
4. **The Acceptance holds.**
   - I replayed a counter-proof in a clean checkout of the head: with the diff always read, 3 of 12 tests fail. Restored,
     `src/` is clean.
   - The developer's three counter-proofs each fail their tests.
5. **Tests (agreement 83).** I ran on the head the history tests, `test-pages-runs` and `release-uc-042-token-failures`,
   with the Bridge packages installed as CI does: 50 of 50. The developer's full local suite has identical failing names on
   base and head.
