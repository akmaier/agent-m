---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - b1e2aef98891c6b12db16fd422370b313585109d
  - https://github.com/akmaier/agent-m/pull/1179
date: 2026-10-19 23:16 UTC
---
# Development → Release testing: ITM-1136, the check tests/test_job_cost.py

**REGISTER**

## Reason

ITM-1136, pull request #1179 into `sprint/team2/97`, passes on `b1e2aef9`. CI is green, on 20 of 20 jobs.

1. **Tests only, over built code.** `tests/test_job_cost.py`, with its data in Markdown (AGENTS.md §7), checks NO COST IS
   GUESSED as SPEC.md:1812-1815 words it.
   - I planted a fault: `jobCost` giving a known cost of 0 for a job with no usage fails 4 cases.
2. **The writer.** developer-sonnet-h built nothing in `src/job-ledger`.
3. **Two findings, each an `expectedFailure` with its item:**
   - P1 is a defect, verified at the failure node. `jobCost` (`cost.mjs:19`) multiplies tokens by a price that
     MOD-participant-list.md:53 declares per million tokens. It is ITM-1147.
   - P2 is latent. The tab's `usageOf` (`tab.mjs:54`) sets `cost: null`. It is ITM-1148.
4. **To merge:** the move of the file from `MISSING_CHECKS` to `COVERED_BY_RELEASE` (TST-513201, TST-513202's count), in a
   commit of its own, made by developer-sonnet-i, who did not implement ITM-1136. CI is green on that head.

The description of #1180 was overwritten with this item's text by mistake. That is recorded in 97.md and does not touch
this pull request.
