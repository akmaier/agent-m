---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 1c91c98e61313e601982560c2a2e9ecdd63cb39e
  - https://github.com/akmaier/agent-m/pull/1187
date: 2026-10-20 00:06 UTC
---
# Development → Release testing: ITM-1148, a cost an endpoint reports reaches the job's record from the tab (second gate)

**REGISTER**

## Reason

ITM-1148, pull request #1187 into `sprint/team2/97`, passes on `1c91c98e`, after its rejection on `cc968b45`. CI is green,
on 20 of 20 jobs.

1. **The rejection's point is met.** `usageOf` (`src/runtimes/tab.mjs`) counts a cost only when every exchange that
   reported usage reported one, all in one currency. Otherwise the cost is null, and `jobCost` takes the declared price,
   or gives unknown.
   - The mixed case is TST-1148005, red first alone at `1bd0044a`, whose CI failed.
   - The old rule, of only the reporting exchanges, fails it as a planted fault.
2. **The mark.** P2's `expectedFailure` was removed by developer-sonnet-i, a non-implementer, and `tests/test_job_cost.py`
   now runs with no expected failure.
3. **Named in the pull request:** MOD-endpoint-calls' `usageOf` and `addUsage` (`index.mjs:114-119`, `:153-158`) still
   give `cost: null`. MOD-job-runner.md:200-201 asks for exactly what a runtime reported. It is ITM-1151, which first reads
   which endpoint kinds report a cost."
