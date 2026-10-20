---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 16a2e17473968e5d9c1c6e8ce3666f4b69ed3931
  - https://github.com/akmaier/agent-m/pull/1162
date: 2026-10-19 21:36 UTC
---
# Development → Release testing: ITM-513, the system and release tests of UC-049

**REGISTER**

## Reason

ITM-513, pull request #1162 into `sprint/team2/97`, passes on `16a2e174`. CI is green, on 20 of 20 jobs.

1. **Tests only, over built code.** New test files, and the check the SPEC names, `tests/test_conversation_not_recorded.py`
   with its data in Markdown (AGENTS.md §7). No file in `src/` changes.
   - The red evidence is 20 planted faults and a changed map.
   - I repeated one on `3d20fdc1`: the conversation recorded with recording off turns 13 JavaScript tests and 2 Python
     cases red. Restored, 32 pass and 6 are todo.
2. **The findings carry their items.** `16a2e174` changes only the `todo` marks and comments of `3d20fdc1`:
   - TST-513002: ITM-1126.
   - TST-513023: ITM-1127.
   - TST-513025: ITM-1128.
   - TST-513024: ITM-1123, the privacy defect, built first.
   - TST-513027: ITM-1129.
   - The seven missing checks of TST-513202: ITM-1131 to ITM-1137.
   - i's observation on *Send* is ITM-1139.
3. **The writer.** developer-sonnet-i implemented none of UC-049's items (`RELEASE TESTS ARE NOT WRITTEN BY THE
   IMPLEMENTER`).
