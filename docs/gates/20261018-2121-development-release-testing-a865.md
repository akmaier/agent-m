---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f5ccda4e9bcfc8b57f49f3511909b1bb268b38dd
  - https://github.com/akmaier/agent-m/pull/937
date: 2026-10-18 21:21 UTC
---
# Development → Release testing: ITM-865, a page's own fault is shown apart from a host's failure

**REGISTER**

## Reason

ITM-865 (MOD-site-frame), pull request #937 into `sprint/team1/92`, passes on `f5ccda4e`. MOD-site-frame is accepted at
`ff84b83e`, the item's draft.

1. **The participant trailer is present** on every commit: `developer-sonnet-c`. The merge `ca7847e0` brings in the sprint
   branch.
2. **The reds are `75d4073e` and `bc2d6afe`,** which hold tests only.
   - Runs 39165742890 and 39166933770 fail the item's tests, among them TST-601005 and TST-683007 as changed.
   - `bc2d6afe` also corrects the two review-pages fixtures under 92.md's rulings. Each now builds a real `HostError`
     (`tests/review-pages-draft-world.mjs:35`, `tests/review-pages-failure-after-snapshot.test.mjs:67`), and none of their
     tests' expected results changes.
3. **The change** is `src/site-frame/index.mjs` only.
   - `readProblem` shows "This page could not be drawn: <message>" for an error that is no `HostError`, with no link to a
     token.
   - Both `startSite` and `startBridge` show `readProblem` for a failing render, and a refused token as a notice.
   - This is the accepted text, including the Bridge's window as ruled.
4. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the five files pass 58 of 58;
   - with every error read as a host's failure, the three readProblem tests of a page's fault fail.
   The developer's other counter-proof, `startBridge` unwrapped, failed TST-865007.
5. **Green.** CI run 39167185177 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/92` without a conflict (tree `ba038046`).
