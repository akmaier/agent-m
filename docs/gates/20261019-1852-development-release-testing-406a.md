---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 2ab7cc1bf8a9d0d49da0002321a46e88437380be
  - https://github.com/akmaier/agent-m/pull/1134
date: 2026-10-19 18:52 UTC
---
# Development → Release testing: ITM-1096, the workflow's composers take it from productWorkflow

**REGISTER**

## Reason

ITM-1096, pull request #1134 into `sprint/team2/97`, passes on `2ab7cc1b`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `fed199af` holds only the test, and CI run 39305126084 failed on it. Its red case, TST-1096001, finds the
   participants page reading each product's model at its `model_version`. That is the Acceptance's named test, and the old
   page read the current instance.
2. **The accepted text** (`1c46340b`, accepted `027034d0`).
   - `src/progress-measures/facts.mjs` drops `declaredModel` and takes the workflow from `productWorkflow`. A small adapter,
     `declaredWorkflow`, keeps `"unknown"` for a commit that cannot be read and `null` for a missing model, so the Facts
     are unchanged.
   - `src/settings-pages/participants.mjs` calls `productWorkflow` at the declared `model_version`.
   - MOD-trace-pages and MOD-workflow-entries compose no workflow in code: `git grep workflowOf` finds none, and they take it
     through `productFacts`. So only their texts changed, with the accepted draft.
3. **The named untested case, accepted.** Removing the participants page's guard for a `null` workflow fails no test. It was
   untested before, and the Acceptance does not ask for it.
4. **Scope.** The two files and the participants test. The modules' own tests pass in the merge test.
