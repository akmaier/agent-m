---
id: ITM-389
title: A draft refined by a follow-up instruction
level: module
realises:
  - UC-019
  - A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
  - THE ROUNDS ARE COUNTED AND SHOWN
modules:
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - UC-019 step 8
---
# ITM-389 A draft refined by a follow-up instruction

**REGISTER**

## Outcome

MOD-job-runner's `runJob` with `refine`, as its file states it: the drafter's first exchange carries that draft as
`previous` with no finding, beside the job's parts with the person's follow-up instruction among them, and the drafter
changes it as the instruction says; the correction loop then runs as for any draft. The page's *Refine* (ITM-363,
ITM-398) calls it.

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists, with a fixture driver: the first input carrying the
  draft as `previous` and no finding; the instruction among the parts; the loop running on the refined draft; without
  `refine`, the first input as before.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
