---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 9b3b7a75984f914d7bcd597eaaaf9fb575365f5a
  - https://github.com/akmaier/agent-m/pull/1156
date: 2026-10-19 20:23 UTC
---
# Development → Release testing: ITM-1107, an answer received shows the new mail in full

**REGISTER**

## Reason

ITM-1107, pull request #1156 into `sprint/team2/97`, passes on `9b3b7a75`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `a158471c` holds only tests, and CI failed on it.
2. **The fix.** One line in `mailItem`: a mail marked new shows its whole text, as UC-039 1b asks. TST-1107001, with 3 planted
   faults.
3. **The finding's mark.** developer-sonnet-g, not the implementer, removes TST-969014's todo mark in its own commit
   `9b3b7a75`, and changes nothing else. TST-969014 passes with the fix, and h checked that it fails without it. The merge test
   shows one todo fewer.
