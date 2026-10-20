---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - b569ecf6271da49fee4932fa7e8bd763dd86ca1e
  - https://github.com/akmaier/agent-m/pull/1124
date: 2026-10-19 18:06 UTC
---
# Development → Release testing: ITM-1063, the system and release tests of UC-048

**REGISTER**

## Reason

ITM-1063, pull request #1124 into `sprint/team2/97`, passes on `b569ecf6`. CI is green on the head, on 20 of 20 jobs.

1. **Tests only.** `src/` is unchanged. Added:
   - `tests/system-uc-048-fill-the-roles.test.mjs`, TST-1063001 to 011;
   - `tests/release-uc-048-fill-the-roles.test.mjs`, TST-1063101 and 102.
2. **Red evidence is planted faults,** as the Acceptance allows for tests of built code (as at ITM-959 and ITM-994).
   - There are 16. f's first pass missed three, and f strengthened the tests until each is caught. The pull request lists
     them.
3. **The Acceptance.**
   - The system test walks UC-048's main flow and its alternative flows through `#roles`.
   - TST-1063101 checks that each requirement UC-048 realises with an automatic check has its named check file, and that
     the system test covers every flow ("existing or new"). TST-1063102 adds a release test for A ROLE NAMES HOW MANY FILL IT
     and A ROLE NAMES THE CAPABILITIES IT NEEDS over the shipped models.
   - No disagreement between page and UC-048 was found; the pull request names one difference of wording.
4. **The writer.** developer-sonnet-f implemented none of the items these tests cover: the Roles page, and ITM-1064, by
   developer-sonnet-d of team 1 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).
