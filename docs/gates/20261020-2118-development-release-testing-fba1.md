---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - a56e885af40329d867845d2b0006980fa55355e8
  - https://github.com/akmaier/agent-m/pull/1241
date: 2026-10-20 21:18 UTC
---
# Development → Release testing: ITM-587's release test (UC-014 steps 1 to 5 and 3a)

**REGISTER**

## Reason

Pull request #1241 into `sprint/team2/98` passes on `a56e885a`. CI is green on 23 of 23 checks. CI on a sprint branch leaves
release tests out.

1. **Not the implementer.** developer-sonnet-h states that it implemented none of ITM-587 or ITM-950.
   - developer-sonnet-f built ITM-587 (#1237).
   - h's work in this sprint is ITM-367's component test (#1229).
   - So the test meets `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER` (SPEC.md:1501-1503).
2. **The test.** `tests/release-uc-014-get-your-own.test.mjs`, TST-587101 to 587110, level `release`, module
   MOD-settings-pages.
   - It guards UC-014 steps 1 to 5 and 3a, `EVERY STEP EXPLAINS ITSELF`, `AN INSTANCE IS A FORK OF AGENT M`, `THE
     PAGES ROOT IS THE REPOSITORY ROOT` and `AGENT M IS MIT-LICENSED`.
   - Every expected value is quoted from UC-014 or the requirement, and the steps are found by the use case's headings.
   - Nothing reaches the network.
3. **Red evidence.** Ten faults planted in `src/settings-pages/get-your-own.mjs`, each with the case it fails, are listed
   in the pull request, and restored.
   - This gate planted one more, Step 2's link changed. The file fails it, and passes again once it is restored.
4. **The local runs.**
   - h's, on `a56e885a`: 10 of 10 pass, in 0.29 s.
   - This gate's, on `sprint/team2/98` merged with #1240 and #1241: all pass, with no case `todo`.
5. **No finding.** The two observations in the pull request are readings, not failures:
   - Step 4's minute is both visible and folded;
   - *Later* is asserted only as far as UC-014 states it.
   - So no item is registered.
