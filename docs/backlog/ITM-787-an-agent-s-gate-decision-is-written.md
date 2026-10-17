---
id: ITM-787
title: An agent's gate decision is written, never on its own work
level: module
realises:
  - UC-034
  - THE GATE IS RECORDED
  - A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
modules:
  - MOD-product-process
builds_on:
  - ITM-785
  - ITM-786
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-787 An agent's gate decision is written, never on its own work

**REGISTER**

## Outcome

UC-034 step 7 and 7b. The writer `gate-record` of `processStrategies`: the decision of an agent written through
`recordGateDecision` (ITM-785), with the job's provenance lines; refused, with nothing written, when the agent did the
work the gate checks. It adds its strategy to `processStrategies` (ITM-786) and changes no registration.

## Acceptance

- A `decide-gate` job of an agent holding the deciding role writes one gate record; the implementing agent's own
  decision is refused.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
