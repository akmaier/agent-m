---
id: ITM-797
title: The workflow's gates, passed, pending and not reached
level: module
realises:
  - UC-035
  - THE GATE IS RECORDED
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-797 The workflow's gates, passed, pending and not reached

**REGISTER**

## Outcome

UC-035 step 3 and 3a. MOD-progress-measures states `gateOverview` and does not build it. This item builds it on the
facts' `workflow` and `gateStates`: the gates in their order; passed with who decided, when, on which text and the
record; pending with what it needs; not reached; passed on an earlier text, with the difference, not counted as passed;
each gate a process requirement adds, with its requirement and source.

## Acceptance

- Each state of a fixture workflow's gates is given as the module's file names it; a record on a changed text gives
  *passed on an earlier text*.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
