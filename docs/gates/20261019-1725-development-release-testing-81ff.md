---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 157c88944a6710fadd12c499a0ea7d7f7c369276
  - https://github.com/akmaier/agent-m/pull/1097
date: 2026-10-19 17:25 UTC
---
# Development → Release testing: ITM-1087, the backlog page lists items of four or more digits, in the order of their numbers

**REGISTER**

## Reason

ITM-1087, pull request #1097 into `sprint/team2/97`, passes on `157c8894`, after its rejection on `e261627b`. CI is green on
the head, on 20 of 20 jobs.

1. **The rejection's point is met.** Where `context` reads them, `ctx.items` is sorted once by `byNumber`. So every list
   built from it follows the numbers, *Start sprint*'s written selection among them.
2. **Red first.** `fa6aafa2` holds only TST-1087004, and CI run 39291280279 failed on it. TST-1087004 starts a sprint with
   ITM-101 and ITM-1000 ticked, and finds them written in that order. The text sort f planted earlier is its counter-proof.
3. **Scope.** `docs/assets/dashboard/backlog-view.mjs` and the test, as before. The first gate's accepted points stand.
