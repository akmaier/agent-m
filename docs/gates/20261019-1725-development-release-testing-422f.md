---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 348e5a26ee25d555a72180fa969245c9e3fb751f
  - https://github.com/akmaier/agent-m/pull/1107
date: 2026-10-19 17:25 UTC
---
# Development → Release testing: ITM-1083, the test pages hand the frame the strategies of propose-tests, sourceStrategies among them

**REGISTER**

## Reason

ITM-1083, pull request #1107 into `sprint/team2/97`, passes on `348e5a26`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `da504879` holds only tests, and CI run 39290368035 failed on it.
2. **The accepted text.** MOD-test-pages.md:104-105, with `e51447bf` and `99cb48bd` accepted. `view.strategies` now hands
   `sourceStrategies` and `resourceStrategies`.
3. **Tests.** `tests/test-pages-generate.test.mjs` no longer registers the two sets itself. That is the item's point: the
   view hands them.
4. **Scope.** f left `scheduleStrategies` out as outside this Acceptance, which is right. The text names it in the view
   too, so it is registered as ITM-1094.
