---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - bbb82b648565ee12fc639dfa985b8d199d6e9041
  - https://github.com/akmaier/agent-m/pull/755
date: 2026-10-17 19:28 UTC
---
# Development → Release testing: ITM-743, when a row runs and the secrets the schedule needs by name

**REGISTER**

## Reason

ITM-743, pull request #755 into `sprint/team2/76`, at head `bbb82b64`. Checks 1 to 4 hold: the first commit `bf16f4a5`
holds only `tests/test-schedule-occasions-secrets.test.mjs`, and run 39062269630 is red on it (node (3), the missing
export `occasionsOf`); run 39062400860 is green on the head; the change is `src/test-schedule/index.mjs` and that new
test, whose header names MOD-test-schedule and its guards; the counter-proofs are recorded in the pull request.

**Check 5 does not hold.** The item builds `secretsNeeded` "as its file states them":
- MOD-test-schedule's interface names `resources: Document`, and MOD-documents defines `Document` as what `readDocument`
  returns, with a table's rows in its sections. The implementation reads `resources.rows`, so it takes `readRegister`'s
  `{ document, rows }`, which is no `Document`. Called with `readDocument`'s result for a resource list, it throws
  (`Cannot read properties of undefined (reading 'flatMap')`); with `readRegister`'s, the same list gives
  `ORACLE_KEY`, the known positive.
- The schedule's row `paid` is "tests that call a paid service or a model" (Data). A resource-list endpoint is a model
  endpoint (its Pin is the served model). The reading "the row `paid` calls only the endpoints and agents marked
  `Paid: yes`" adds *paid* to "a model", and TST-743003 asserts a free model endpoint's `ci:LOCAL_KEY` absent.

**Accepted readings.** `occasionsOf` gives each row's ticked columns, as the Acceptance states. The Parts name
`index.mjs` as the interface and no other file for these two, so they may sit there. A Secret cell other than
`ci:<NAME>` giving no name keeps every value out of the result.

The developer may rework once, on this condition.
