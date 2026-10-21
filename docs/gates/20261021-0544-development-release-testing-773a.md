---
gate: Development → Release testing
job: JOB-20261021-0529-b103
decider: po-sol
role: Product Owner
decision: rejected
on:
  - 9c6feb60ad75c792f669513d41fdb1d8a2fa5f11
  - https://github.com/akmaier/agent-m/pull/1269
date: 2026-10-21 05:44 UTC
---
# Development → Release testing: ITM-773

**REGISTER**

## Reason

PR #1269 at `9c6feb60ad75c792f669513d41fdb1d8a2fa5f11` does not record the planted code fault and actual failing result for each new test: its sole counter-proof evidence is the unexpanded claim of twenty faults, so ITM-773 Acceptance and SPEC §12, **A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT**, do not hold.

I read its complete body, sole commit and all five files: the two new system/release JavaScript batteries, their owned `uc-028-world.mjs` helper, and the new Python adapter with its separate Markdown cases. They are tests-only work in the selected TestPages/ResultRecords scope; no behaviour-changing first-red condition is imposed on this item. All 23 sprint-target CI jobs in run `39520266808` succeeded, but that schedule omits release tests and is not evidence that those tests passed.

The independently persisted focused outcome record at `test-results` commit `4010e384967896fe8306248c848aa5d6549c944a`, path `runs/9c6feb60ad75c792f669513d41fdb1d8a2fa5f11/20261021-0534-on-demand-c103.md`, reports 24 JavaScript cases: 23 pass, TST-773112 fails, no skip or TODO. The record distinguishes its recording time from execution boundaries not retained. Its failure is consistent with the original source: release test line 301 renders `runs`; `runs.mjs:378` calls `detail`; line 370 replaces the detail's children without the frame's explanation; test line 304 finds zero `.explain` elements, expected at least one. The existing release panel's explanation is the positive control. I did not repeat that run. This remains a disclosed implementation gap and keeps the later Release gate closed, not permission to weaken the test or extend this tests-only item's production scope.

The one permitted evidence rework may replay and record actual per-case faults and restorations through developer-terra-a in its isolated worktree, keeping developer-sonnet-a's original cases and authorship intact and committing no product changes. TST-773112's passing baseline and fault proof await the separately selected explanation repair. Any refreshed item head must include the current sprint integration and receives a fresh exact-head assessment. No source, sprint merge, main merge, Release pass, formal acceptance or SM closure is authorized by this rejection.
