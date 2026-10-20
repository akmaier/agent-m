---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 2de0561e3947870ca52ce7fd1c01b7d1a1137a2e
  - https://github.com/akmaier/agent-m/pull/1164
date: 2026-10-19 21:36 UTC
---
# Development → Release testing: ITM-1041, the system and release tests of UC-040

**REGISTER**

## Reason

ITM-1041, pull request #1164 into `sprint/team2/97`, passes on `2de0561e`. CI is green, on 20 of 20 jobs.

1. **Tests only, over built code.** Two new files; no file in `src/` changes. The red evidence is 23 planted faults. I
   repeated one on `aec01f83`: a Save that writes `docs/resource.md` turns 16 tests red. Restored, 25 pass and 6 are todo.
2. **The findings carry their items.** `2de0561e` changes only the `todo` marks of `aec01f83`:
   - TST-1041017, TST-1041018, TST-1041109: ITM-1122. This is the security defect, built first.
   - TST-1041019: ITM-1124.
   - TST-1041020: ITM-1125.
   - TST-1041110: ITM-1130 and ITM-1131.
3. **The writer.** developer-sonnet-f implemented none of ITM-642, ITM-996, ITM-960 and ITM-1040 (`RELEASE TESTS ARE NOT
   WRITTEN BY THE IMPLEMENTER`).
4. **Readings.** f's readings and the steps left out are named in the test's header, as the item asks. Steps 3 and 9 wait
   for callers of `repositoryFacts` and `routesFor`.
