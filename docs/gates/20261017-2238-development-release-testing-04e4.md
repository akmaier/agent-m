---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 708359eca5080b82ddbdccd48d27373de5345b7e
  - https://github.com/akmaier/agent-m/pull/799
date: 2026-10-17 22:38 UTC
---
# Development → Release testing: ITM-791, CI resumes a job whose gate is recorded

## Reason
ITM-791 (MOD-workflow-entries). The first commit `d4c3bfbe` holds only `tests/workflow-entries-resume-gate.test.mjs`,
and CI run 39074904843 is red on it, on TST-479151. CI is green on the head (run 39075659188, on `sprint/team2/81`). The
change is `src/workflow-entries/product.mjs` and the new test, whose header names the module; the later test change only
prepares the fixture (`w.product` is the origin), no expected result changed. The three counter-proofs replay as
recorded. `onRecordsChanged` appends `Resumed` to each job of its route whose reached gate `gateStates` passes, unless
the deciding record's `decider` is the job's participant; it calls nothing the module's Uses do not name.
