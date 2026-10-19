---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 8d297a2e7824521bc9258bc6a3f73e574c37aece
  - https://github.com/akmaier/agent-m/pull/1098
date: 2026-10-19 17:12 UTC
---
# Development → Release testing: ITM-1089, the live dashboard reads backlog items of four or more digits

**REGISTER**

## Reason

ITM-1089, pull request #1098 into `sprint/team2/97`, passes on `8d297a2e`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `0e064b13` holds only the test, and CI failed on it.
2. **The fix.** `src/site-frame/dashboard-app.mjs:270`, `ITEM_PATH` reads `ITM-\d{3,}`, as MOD-identifiers.md:54 states. Only
   that line and the test change.
3. **The test.** The files the live app reads include ITM-100, ITM-999 and ITM-1000, and not `ITM-99-x.md`. Here the
   pattern selects files to read, and orders nothing.
