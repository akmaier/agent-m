---
id: ITM-792
title: A CI check that a gate names decides it
level: module
realises:
  - UC-034
  - A GATE NAMES WHO DECIDES IT
  - THE GATE IS RECORDED
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-785
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-792 A CI check that a gate names decides it

**REGISTER**

## Outcome

UC-034 step 7, "an automated check runs in CI; its result is the decision". MOD-workflow-entries states
`onCheckCompleted` and does not build it (`src/workflow-entries/main.mjs:15` registers four entries). This item builds
it: on a completed check that a gate of the product's workflow names as `check: <name>`, the gate's record — decided by
that check, passed or not, on which commit — written through `recordGateDecision` (ITM-785), whose push resumes the job.

## Acceptance

- A completed check named by a gate writes one gate record with its result and commit; a check no gate names writes
  nothing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
