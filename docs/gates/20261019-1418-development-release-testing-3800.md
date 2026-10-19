---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 810603aed7650e70b45b61a515551de98b0cced8
  - https://github.com/akmaier/agent-m/pull/1084
date: 2026-10-19 14:18 UTC
---
# Development → Release testing: ITM-747, the writer that sets up CI in a run

**REGISTER**

## Reason

ITM-747, pull request #1084 into `sprint/team2/96`, passes on `810603ae`. CI is green on the head, run 39265829909, 20 of 20
jobs.

1. **Red first.** `fb7a769c` holds only the tests, and CI run 39265509074 failed on it. The one expectation changed after it
   (TST-747001 compares the files sorted) only drops an order the text does not state.
2. **The accepted text.** MOD-test-schedule.md:159-161: the writer `ci-configuration` writes "the product's schedule, or the
   default where there is none, through `proposeSchedule` with the job's provenance lines". `strategies.mjs` is new.
   `filesOf` is taken out of `proposeSchedule` with no change of behaviour, so that nothing is committed where the files
   already stand.
3. **Scope.** `src/test-schedule/` and its tests. The fake host moves to `tests/test-schedule.d/host.mjs`. The leftover
   `GitlabCiNotList` comment is gone: no line of `src/test-schedule/` names it.
4. **Run here.** The MOD-test-schedule tests pass, 57 of 57.
5. **Readings accepted:**
   - where `proposeSchedule`'s context comes from;
   - the choice of schedule;
   - participant `none`;
   - the outcome's fields.
   Registration of the strategies is ITM-755.
