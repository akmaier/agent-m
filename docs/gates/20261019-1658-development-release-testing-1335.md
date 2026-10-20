---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 9be483dc8cb0775b43f2ce15598a6cddb707d103
  - https://github.com/akmaier/agent-m/pull/1099
date: 2026-10-19 16:58 UTC
---
# Development → Release testing: ITM-1088, the main page's progress bar counts items of four or more digits

**REGISTER**

## Reason

ITM-1088, pull request #1099 into `sprint/team2/97`, passes on `9be483dc`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `6cf8ca02` holds only the test, and CI run 39288820764 failed on it.
2. **The fix.** `src/home/progress.mjs:27` reads `ITM-\d{3,}` for plan steps and backlog items, as MOD-identifiers.md:54
   states and as MOD-progress-measures' own readers do (`src/progress-measures/facts.mjs:39-40`). Only that line and the new
   test change.
3. **The tests.** TST-1088001 to 003 cover ITM-100, ITM-999 and ITM-1000 counted, and `ITM-99` not. g gives 5 planted
   faults.
4. **Run here.** The test passes, 3 of 3. With `\d{3}` put back, 2 fail.
