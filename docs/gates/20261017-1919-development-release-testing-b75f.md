---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 34fc68d6d0007da2acc1d72841daa3780cb10f90
  - https://github.com/akmaier/agent-m/pull/753
date: 2026-10-17 19:19 UTC
---
# Development → Release testing: ITM-777, the release test that a plan covers the whole specification

## Reason

ITM-777 is an item of release tests; only `tests/test_plan_coverage.py` (loader) and its data file
`tests/test_plan_coverage.md` change. CI run 39061780549 is green on the head; since it skips release-level Python
files on a sprint base, the test was run on the head: 4 tests pass. TST-777001..004 each name A PLAN COVERS THE WHOLE
SPECIFICATION, MOD-model-catalogue and level `release`; each counter-proof is recorded in the pull request, and one
(phases sliced to 6) was reproduced. The cases cover the item's Acceptance; the author implemented none of
`src/model-catalogue/`.
