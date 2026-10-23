---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 886110b626c17a2efe6c8aa26564597164388fd7
  - https://github.com/akmaier/agent-m/pull/1321
date: 2026-10-23 12:29 UTC
---
# Development → Release testing: ITM-1196, a merged item stays done before acceptance and prerequisites

**REGISTER**

## Reason

ITM-1196, pull request #1321 into `sprint/team2/105`, passes on `886110b6`. CI is green on 28 of 28.

1. **Red first, from the full job log.** Job 120412316925 (run 39953106616) at the tests-only commit `71475b6c` has
   `not ok 397` and `398` with `# fail 2`:
   - TST-1196001: a merged item stays done when a use case it realises is changed;
   - TST-1196002: a merged item stays done when an item it builds on is not done.

   `ok 399`, TST-1196003, is the known positive: an item without a merged pull request still waits.
2. **The change at the failure node.** `src/work-plans/states.mjs`, `derivedState`: `mergedPullRequest` is asked first.
   A merged item is no longer asked `acceptanceReasons` or `unfinishedPrerequisites`, and is `done`.
3. **The effect, counted by g from the repository** (productFacts' scope `work`, `main` at `54a044c9`): done goes from
   645 to 771 of 985. 126 items turn done, and no done item turns otherwise.
4. **Within the accepted text, so narrower than the item's first Acceptance line.**
   - The item asked for the merge to be checked "before acceptance, prerequisites, gates and jobs".
   - The accepted MOD-work-plans.md:125-128 still holds ITM-864's newest-job rule, so g keeps it. That is right while the
     text stands.
   - Over jobs and later pull requests, the draft `19a16c1c` and its follow-up decide, and ITM-1198 builds it once they
     are accepted. 41 merged items stay not done until then.
5. **The mark is left out.** `ItemState` has only `reason`, and the implementation pages show it as "Waits for"
   (`plan.mjs:131`, :138). A done item's `reason` stays null until the draft's mark is accepted. That is the minimal
   scope the brief named.
6. **Scope:** `states.mjs` and one test file of MOD-work-plans.

## Process

g pushed the implementation before CI had run on the tests-only commit. g then force-pushed its own branch back with
`--force-with-lease`, before any pull request existed, so that the tests-only commit stood alone. The permission system
flagged the force-push as destructive.
- The red was then shown on CI, so the gate holds.
- **A force-push is not the way:** the tests-only commit is pushed and its CI awaited before the next commit is made
  (sprint 101's brief, point 3). This goes to the retrospective.
