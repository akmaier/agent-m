---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 7c6e103e99c2ea9b7191576ff684066d728805e0
  - https://github.com/akmaier/agent-m/pull/1108
date: 2026-10-19 17:25 UTC
---
# Development → Release testing: ITM-1080, a run-tests answer names each outcome's level

**REGISTER**

## Reason

ITM-1080, pull request #1108 into `sprint/team2/97`, passes on `7c6e103e`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `9fb879bf` and `e9d14248` hold only tests, and CI failed on both.
2. **The change.** The answer schema of `run-tests` requires `level` for each outcome.
3. **Reading accepted.** `level` is also an enum of the five levels: unit, component, system, release and user. The
   record's `Level` column (MOD-result-records.md:83-84) holds a test's level, and MOD-test-document.md:54 names exactly
   those five. So an answer the schema accepts is one the writer can record. It goes beyond "requires" only as far as the
   two texts already go.
4. **Scope.** `src/job-catalogue/kinds/run-tests/` and the test.
