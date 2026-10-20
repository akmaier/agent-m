---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - e3565da6379823e99e7a82150fe96607040816a0
  - https://github.com/akmaier/agent-m/pull/1079
date: 2026-10-19 13:59 UTC
---
# Development → Release testing: ITM-746, a schedule proposed in one pull request, and the nightly pipeline schedule on GitLab

**REGISTER**

## Reason

ITM-746, pull request #1079 into `sprint/team2/96`, passes on `e3565da6`, after its rejection on `8e5e7595`. CI is green on
the head, run 39263722645, 20 of 20 jobs.

1. **Red first, on CI.** Run 39263259075 ran on exactly `9a7899aa`, the tests-only commit, and failed. The new tests came in
   tests-only pushes, each red on CI:
   - `cf48be76`: run 39263310241;
   - `e746d7e7`: run 39263383448.
   I checked each run's commit and conclusion. `9a7899aa` stays in the branch's history; nothing was rewritten.
2. **No error outside the accepted text.** `proposeSchedule` no longer throws `GitlabCiNotList`. An `include:` written as a
   string, a quoted string, a map, a flow map or a flow list is written as a list holding the existing entry and Agent
   M's. One that already names Agent M's file gets no commit. Five new counter-proofs each fail TST-746003; the 13 earlier
   ones stand.
3. **Run here.** The MOD-test-schedule tests pass, 52 of 52.
4. **Scope.** `src/test-schedule/` and its test, as at the first gate. The readings accepted then stand.
5. **Left for ITM-747, in the same file.** The doc comment of `proposeSchedule` (`src/test-schedule/propose.mjs:68`) still
   names `GitlabCiNotList`, which the code no longer throws. g corrects that line in ITM-747's first code commit. It is a
   comment, not a behaviour.
