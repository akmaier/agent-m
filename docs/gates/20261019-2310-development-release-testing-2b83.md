---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - f4142dc39e5ca8f56c01b02a009e74143a3377e2
  - https://github.com/akmaier/agent-m/pull/1180
date: 2026-10-19 23:10 UTC
---
# Development → Release testing: ITM-1145, the desktop shell's Quit test waits for its agents

**REGISTER**

## Reason

ITM-1145, pull request #1180 into `sprint/team2/97`, is rejected on `f4142dc3`. This is its first rejection. CI is green,
only `tests/mod-desktop-shell-quit-jobs.test.mjs` changes, and the cause is named as a path: the Bridge reaches its second
agent only after about 84 git child processes (`watch.mjs` :256 → :230 → :123 → :144). The red is reproduced with
`QUIT_TEST_GIT_DELAY=0.4`. The counter-proof, with `jobs.start()` off, fails after 30.8 s, and 20 runs are green.

**The wait has no total bound, and the job it runs in has one.**
- SPEC.md:1523, A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES: "Every job that the CI of Agent M's own repository runs on a
  pull request finishes within two minutes". `tests/test_ci_budget.py` gives every job a limit of two minutes, after
  which GitHub stops it and the run fails.
- The new `until` ends only when the state holds, or after 30 s without progress. A run that keeps making slow progress
  waits as long as it progresses: f measured 71 s at a delay of 0.8 s per git call.
- Such a test can spend most of its shard's two minutes alone. Then the job is stopped by GitHub, and no test names the
  cause, which is the unreadable red that ITM-1145 exists to remove.

**What changes.** Beside the rule of progress, `until` keeps a total ceiling, well below the job's two minutes. The
slowest job is 23 s today, so 60 s leaves room for the shard's other tests. Past the ceiling, the test fails with a message
that names the state it reached: how many agents had started, and how many git calls were made. A counter-proof shows the
ceiling ends a run that progresses too slowly, for example `QUIT_TEST_GIT_DELAY` set high enough.

**Accepted as named:** f could not prove from the CI log, which holds no timings, that the flip was exactly this slowness.
The reproduction with the delay is the closest evidence the log allows.
