---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b1135e0e125dd76c80c28447272003b23d799abb
  - https://github.com/akmaier/agent-m/pull/920
date: 2026-10-18 17:59 UTC
---
# Development → Release testing: ITM-948, the node job runs sixteen shards

**REGISTER**

## Reason

ITM-948 (MOD-test-schedule), pull request #920 into `sprint/team1/91`, passes on `b1135e0e`.

1. **The participant trailer is present** on all three commits: `developer-sonnet-a`.
2. **The red is `dd408142`.** It holds tests only, and run 39150828439 fails TST-948001 there.
3. **The change** is two lines of `.github/workflows/tests.yml`: the node matrix lists shards 0 to 15, and the count is 16.
   This follows the ruling in 91.md.
4. **The lasting check reads the real workflow,** as ruled in `7f8a2b25`. TST-948003 reads `.github/workflows/tests.yml`
   and finds that its matrix and count agree. A copy with the count at 8 and the matrix at 16 is found to disagree.
5. **Counter-proofs, replayed by me in a clean checkout of the head:**
   - the shard test passes 11 of 11;
   - with the real workflow's count put back at 8, TST-948001 and 948003 fail.
   The developer's second counter-proof, the helper without its agreement test, failed TST-948002 and 948003.
6. **Green.** CI run 39151670142 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/91` without a conflict (tree `904238a4`).
   - node (5) passed on its second attempt.
   - Attempt 1 failed TST-498005 in the test's own cleanup (ENOTEMPTY). #920 does not touch that test file, so the
     failure is not this item's. It is registered as ITM-949.
7. **Still open: the Acceptance's first line.** "Every job of a mode=all run within two minutes" can only be read on
   #919's new run, because #920 runs mode `rest`. The end gate reads that run.
