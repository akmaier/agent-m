---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - fe4b41fa5cfa2e227e7f97f78315faa7af1aa796
  - https://github.com/akmaier/agent-m/pull/1174
date: 2026-10-19 22:23 UTC
---
# Development → Release testing: ITM-1130, the check tests/test_resources.py, as the SPEC names it

**REGISTER**

## Reason

ITM-1130, pull request #1174 into `sprint/team2/97`, passes on `fe4b41fa`. CI is green, on 20 of 20 jobs.

1. **Tests only, over built code.** `tests/test_resources.py` with its data in `tests/test_resources.md` (AGENTS.md §7):
   52 cases across 13 tests, one for each Check sentence of SPEC.md:2194-2294 and its counter-proof. The red evidence is
   14 planted faults.
2. **Planted faults, repeated by me.**
   - Each kind's required columns switched off in `rules.mjs` failed no test. f names why: the schema states the same rule
     a second time. That duplication is ITM-1144, not a fault of the test.
   - A repository's pin not checked as a commit failed no test either. SPEC.md:2223's Check names only a `model` entry,
     which the test does check.
3. **The writer.** Team 1 built the resource list's items, so developer-sonnet-f implemented none of them.
4. **The finding.** TST-1130013, a list whose table carries Capabilities and Role, is accepted. That breaks
   `A RESOURCE IS USED, A PARTICIPANT DEVELOPS`. It is marked `@unittest.expectedFailure` and registered as ITM-1143.
