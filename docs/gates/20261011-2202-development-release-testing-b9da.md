---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 05bebe9e9d1912c41cb8f22297cee27e2b7d1b9c
  - https://github.com/akmaier/agent-m/pull/437
date: 2026-10-11 22:02 UTC
---
# Development → Release testing: ITM-389, a draft refined by a follow-up instruction

**REGISTER**

## Reason

ITM-389, pull request #437 by developer-sonnet-c into `sprint/team1/22`, head `05bebe9`. The first commit `8e55431`
holds only `tests/job-runner-refine.test.mjs`, and CI was red on it (run 38178365252): two of its tests fail, and no
other test does. CI is green on `05bebe9` (run 38178594630, 2008 tests, 0 failures). The code changes only
`src/job-runner/loop.mjs`; the new test names MOD-job-runner and its guards, and 11 faults are recorded, two more dropped
as equivalent. The Acceptance holds: the first input carrying the draft as `previous` and no finding; the instruction
among the parts; the loop running on the refined draft; without `refine`, the first input as before.

The readings weighed: the person's follow-up instruction needs no code of the runner, since MOD-job-runner's file has it
"among the job's parts", which the kind's `instruction` recipe gives; `refine: null` is read as a draft of `null`,
`undefined` as no refinement — `runJob`'s `refine?: unknown` admits both.
