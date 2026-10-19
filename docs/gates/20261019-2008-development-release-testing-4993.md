---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - d8cdbb179a5413687b854ca23544772fbd9fe356
  - https://github.com/akmaier/agent-m/pull/1142
date: 2026-10-19 20:08 UTC
---
# Development → Release testing: ITM-969, the system and release tests of UC-039

**REGISTER**

## Reason

ITM-969, pull request #1142 into `sprint/team2/97`, passes on `d8cdbb17`. CI is green on the head, on 20 of 20 jobs.

1. **Tests only, over built code.**
   - The red evidence is 18 planted faults.
   - The Bridge's are shown on CI through the closed draft pull requests #1146 to #1154, since their packages run only on CI.
2. **The finding.** TST-969014 (UC-039 1b) is marked `{ todo: "FINDING UC039-1b … — ITM-1107" }`, the repository's form for a
   release test that finds a defect. The defects of i's findings 2 and 4 are ITM-1108 and ITM-1109, and finding 5 is a
   reading (97.md).
3. **The writer.** developer-sonnet-i implemented none of ITM-953, ITM-954 and ITM-966 to ITM-968
   (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).
