---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - a4a462ae974d71b7045b7f300d89460f319875c4
  - https://github.com/akmaier/agent-m/pull/1127
date: 2026-10-19 18:21 UTC
---
# Development → Release testing: ITM-1100, MOD-product-process' productWorkflow gives a product's declared workflow

**REGISTER**

## Reason

ITM-1100, pull request #1127 into `sprint/team2/97`, passes on `a4a462ae`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `d4ae24c3` holds only the tests, and CI run 39300350615 failed on it.
2. **The accepted text.** MOD-product-process.md:166-170 at blob `f7517e3c`, read from `main`, since the sprint branch holds the
   older text.
   - The workflow is read at the commit `model_version` names. The known positive: the fixture's later commit gives another
     workflow.
   - `null` where the model is missing.
   - A failure of `instanceAt` is passed on.
   - g planted 5 faults, each caught.
3. **Scope.** `src/product-process/` and its test. `declaredModel` in `src/progress-measures/facts.mjs` stays until ITM-1096.
