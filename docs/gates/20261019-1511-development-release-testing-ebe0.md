---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 6b08b53ac7709f014c5819c4a922741c7fc70332
  - https://github.com/akmaier/agent-m/pull/1075
date: 2026-10-19 15:11 UTC
---
# Development → Release testing: ITM-682, the release panel is the test pages' route on the live page

**REGISTER**

## Reason

ITM-682, pull request #1075 into `sprint/team2/96`, passes on `6b08b53a`. CI is green on the head, on 20 of 20 jobs.

1. **Scope.** MOD-site-frame is among the item's modules, and its Acceptance names the three files the head changes.
   `release-view.mjs` is removed.
2. **Red first.** `bf67696e` holds only the tests. Run 39274913065, through the helper #1095, ran on that commit and ended
   `failure`. Node (6) failed in exactly TST-682001 to TST-682003; the other 19 jobs passed. The run is complete, not
   cancelled.
3. **The release test.** `6b08b53a`, by developer-sonnet-i, changes only `tests/release-sprint-02-a-dashboard-app.test.mjs`:
   `HANDED` and the built-in allowlist get `release`, and a dispatch assertion is added. i is not the implementer
   (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). It was 17 passed and 1 failed before, and 18 passed after. On the
   merge it passes, 18 of 18.
4. **Counter-proofs.** f's were run again on the merged head.
5. **For both teams** (agreement 94). In this head's CI, the Electron test "#backlog in a browser" in node (0) failed once
   and passed when run again on the same commit. Sprint 96's record names it.
