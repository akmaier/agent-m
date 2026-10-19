---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - b2609e53c281f5f9c0cbecf47afd757c5f4469be
  - https://github.com/akmaier/agent-m/pull/1161
date: 2026-10-19 21:28 UTC
---
# Development → Release testing: ITM-1032, CI starts an agent's sprint close when the sprint ends

**REGISTER**

## Reason

ITM-1032, pull request #1161 into `sprint/team2/97`, passes on `b2609e53`. CI is green, on 20 of 20 jobs.

1. **Red first.** The tests-only commit `9f31942e` was pushed together with the rest and has no run of its own. Its red run
   39320837075 is on the merge `f2f64206`, which adds to `sprint/team2/97` only the two new test files (`git diff
   f2f64206^2 f2f64206`). So it is the tests over the base without the implementation, and it counts. It fails on the
   missing export `sprintsToClose` and on "There is no entry onSchedule". After red, the tests were made stricter, never
   weaker: a person closer whose row names a CI route, and a closer who is no participant.
2. **Accepted text.** `MOD-work-plans.md` (blob `ee571b6be5a5`) and `MOD-workflow-entries.md` (blob `49316ce92c74`) at the
   head each have their approval record. Scope: the two modules and their tests only.
3. **Planted faults, three of them repeated by me on the head:**
   - `end <= today` → `<`: TST-1032001 fails.
   - Queueing for a person closer: three of the four schedule tests fail.
   - `onSchedule` taken out of `main.mjs`' table: four tests fail. So the new branch of `main.mjs` is tested, which #1121
     lacked.
4. **Readings.** h's six readings are within the texts. `sprintsToClose` follows MOD-work-plans.md:191 as worded: a time
   box ended, or, without one, `## Ended` or every selected item done. `onSchedule` follows MOD-workflow-entries.md:165-168.
   `A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF` (SPEC.md:1901) holds.
5. **Callers.** `main.mjs` gains the entry, which the job workflow already runs (pinned by
   `tests/runtimes-workflow.test.mjs`). No release test changed.
