---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 991d01002da9f97dc1e831fd81b3589a9757dbfe
  - https://github.com/akmaier/agent-m/pull/1103
date: 2026-10-19 17:08 UTC
---
# Development → Release testing: ITM-1092, an issue's marks name items of four or more digits

**REGISTER**

## Reason

ITM-1092, pull request #1103 into `sprint/team2/97`, passes on `991d0100`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `9d3fa994` holds only the test, and CI failed on it.
2. **The fix.** The three patterns of `src/mail-records/issue-marks.mjs` (:6, :75, :76) read `ITM-\d{3,}`. Only those lines
   and the test change.
3. **The test.** Marks naming ITM-100, ITM-999 and ITM-1000 are read with their item, and one naming `ITM-99` is not.
