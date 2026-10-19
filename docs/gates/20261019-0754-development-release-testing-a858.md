---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d27c829e85dbb0fc337634bec4a4dfc3662e12d9
  - https://github.com/akmaier/agent-m/pull/980
date: 2026-10-19 07:54 UTC
---
# Development → Release testing: ITM-858, the main page pauses its readings while the tab is hidden

**REGISTER**

## Reason

ITM-858 (MOD-main-page), pull request #980 into `sprint/team1/93`, passes on `d27c829e`.

1. **Both commits carry the trailer** `developer-sonnet-b`, with no merge.
2. **The red is `b0e8a07d`.** Run 39218266451 fails exactly TST-858001, 858002, 858004, 858005 and 858006. TST-858003 holds
   on the base as a guard.
3. **The change follows the accepted texts:**
   - UC-046 step 4, "while the page is shown", and MOD-main-page's Data (`48bde975`, accepted);
   - `src/main-page/reread.mjs` starts no reading and sets no timer while the tab is hidden;
   - on `visibilitychange` it reads at once the cards that fell due, never cancels a reading in flight, and removes its
     listener once the cards are gone.
   Measured on the base: a hidden tab with a running job sends 9 requests in three minutes. The head sends none.
4. **The harness** (`tests/main-page-home-harness.mjs`) gains the tab's visibility. Its importers are the two main-page
   test files, and no counter-proof harness copies it: searched for its name in `tests/`, the known positive being
   `main-page-home.test.mjs`.
5. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the two files pass 38 of 38;
   - with the hidden check removed, TST-858001 fails.
6. **Green.** CI run 39218571506 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/93` without a conflict (tree `b5665c43`).
