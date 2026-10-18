---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 4b31f002f776107856265509fbc6511cf22183da
  - https://github.com/akmaier/agent-m/pull/899
date: 2026-10-18 13:42 UTC
---
# Development → Release testing: ITM-921, the review pages' ticks and scrolling boxes serve a screen reader

**REGISTER**

## Reason

ITM-921 (MOD-review-pages), pull request #899 into `sprint/team1/90`, passes on `4b31f002`, under the Acceptance as amended
in `b5fbefff`.

1. **Red first.** `f0e45660` holds only tests. Run 39131760836 is red on TST-905068 and 905069 and on TST-921001 to 921004.
   - The new `tests/review-pages-accessible-names.test.mjs` checks the ticks' names and the difference boxes' `tabindex`.
   - In `tests/site-accessibility.test.mjs`, the `label` todos for `#uc`, `#arc`, `#module` and the stale one for `#spec`
     are removed, under `d995c09b`. A planted unnamed tick is its counter-proof.
2. **The change** is two lines in `src/review-pages/flow.mjs`: `aria-label` "Accept <id>" on each list tick, and
   `tabindex="0"` on each difference box in `centreFirstChange`, as ruled.
3. **Green.** Run 39132386551 on `4b31f002` passes all twelve jobs. `git merge-tree --write-tree` merges the head into
   `sprint/team1/90` without a conflict (tree `5a4c7ce7`).
4. **The Acceptance holds.**
   - I replayed a counter-proof in a clean checkout of the head: without the `tabindex`, TST-921003 and 921004 fail.
     Restored, `src/` is clean.
   - The developer's counter-proof without `aria-label` fails TST-921001 and 921002.
   - The `scrollable-region-focusable` todos that belong to other modules stay, each with its item: ITM-918, ITM-931 and
     ITM-932.
5. **Release tests (agreement 83).** I ran on the head the review pages' list tests and the release tests that load them,
   with the Bridge packages installed as CI does: `release-sprint-01` and `-02-a`, `release-uc-006` (approve),
   `release-uc-008` and `release-uc-022`. That was 126 tests, 123 pass, 0 fail, 3 todo. The Scrum Master's run of the eleven
   release files gave identical results on base and head.
