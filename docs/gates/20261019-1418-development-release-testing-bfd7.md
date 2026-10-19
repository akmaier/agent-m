---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 1adfa0c7470f3a0864269014fd92a52b32f9bac2
  - https://github.com/akmaier/agent-m/pull/1082
date: 2026-10-19 14:18 UTC
---
# Development → Release testing: ITM-763, Generate tests — choose the selection and run the proposal

**REGISTER**

## Reason

ITM-763, pull request #1082 into `sprint/team2/96`, passes on `1adfa0c7`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `d2211153` holds only the tests, and CI run 39264144252 failed on it.
   - The fix commit also changed the test's fixture and three expectations: MOD-a has no test, so it is uncovered at every
     level and all five levels are preselected, and the 3a count is 2.
   - The first fixture gave a test whose header names MOD-a but whose `guards` does not, and expected MOD-a covered.
     "Guard" in MOD-test-pages.md:123-124 is what a test's `guards` names, as `test-selection` counts it. So the first
     expectation was wrong, and the correction follows the text.
   - The corrected tests fail on the red commit too, since `generate.mjs` did not exist.
2. **Scope.** `src/test-pages/generate.mjs` (new), `index.mjs` and the test.
3. **Run here.** The MOD-test-pages tests pass, 51 of 51.
4. **Readings accepted.**
   - Combinations by kind and level.
   - "Uncovered" as `test-selection` counts it.
   - The implementer from `implement` jobs (4a).
   - Run queues one job on the first route.
   - The level's explanation is the page's own `details`, since `explanations.md` is MOD-site-frame's.
5. **Counter-proofs.** One of the nine is not caught: the double-click guard duplicates `runPanel`'s own. That is redundant
   code, not a gap.
6. **A gap in the text, registered as ITM-1083.** `propose-tests` needs `sourceStrategies`, which MOD-test-pages' Uses do not
   name. The live page has it where another view of the page hands it. ITM-1083 needs a draft.
