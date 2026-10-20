---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 5881a4c54cce5e7dd6cc7baa80964fac5c063478
  - https://github.com/akmaier/agent-m/pull/1185
date: 2026-10-19 23:42 UTC
---
# Development → Release testing: ITM-1147, a participant's price per million tokens is applied per million

**REGISTER**

## Reason

ITM-1147, pull request #1185 into `sprint/team2/97`, passes on `5881a4c5`. CI is green, on 20 of 20 jobs.

1. **Red first.** `e2ba858c` holds only the corrected unit test of `jobCost`, whose price comes from a register row "3 / 15
   USD per million tokens", as MOD-participant-list.md:53 declares it. Its CI failed.
2. **The fix** divides by a million in `src/job-ledger/cost.mjs` (`TOKENS_PER_PRICE`), and only there.
   - f planted 3 faults.
   - I repeated one: a divisor of 1 fails `tests/test_job_cost.py` again.
3. **Callers.** `jobCost`'s callers — the job ledger's rows, the tab's end of a job and the Bridge's end
   (`src/bridge-jobs/watch.mjs:146`) — keep its type. Only the amount for a declared price changes, which is the defect.
   The merge on the sprint branch passes, apart from the known 4.
4. **The mark.** developer-sonnet-i, who did not implement ITM-1147, removed TST-1136004's `expectedFailure` in `5881a4c5`,
   a commit of its own. P2 (ITM-1148) stays marked.
