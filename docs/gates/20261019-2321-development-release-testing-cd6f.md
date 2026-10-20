---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 3442b97d77862e95d81561b26aa67e6721ea233b
  - https://github.com/akmaier/agent-m/pull/1180
date: 2026-10-19 23:21 UTC
---
# Development → Release testing: ITM-1145, the desktop shell's Quit test waits for its agents (second gate)

**REGISTER**

## Reason

ITM-1145, pull request #1180 into `sprint/team2/97`, passes on `3442b97d`, after its rejection on `f4142dc3`. CI is green,
on 20 of 20 jobs. Only `tests/mod-desktop-shell-quit-jobs.test.mjs` changes.

1. **The rejection's point is met.** `until` keeps the rule of progress (30 s without a git call or a started agent), and
   adds a total limit of 60 s.
   - Past either limit it fails with a message naming the agents started and the git calls made.
   - The test's worst case, 60 s, stays below the job's two minutes (SPEC.md:1523), with the slowest job at 23 s today.
2. **Counter-proofs.**
   - `QUIT_TEST_GIT_DELAY=2` ends at 60 s with the total message.
   - A delay of 1 passes at 59.9 s.
   - With `jobs.start()` off, the test fails after 30.8 s with the stall message.
   - 20 of 20 runs are green. Locally it passes in 5.9 s.
3. **The rest stands as accepted at the first gate:** the cause as a path through `watch.mjs`, and the red reproduced with
   the delay.
