---
id: ITM-795
title: The progress of a planned model as a grid, a timeline and the plan's steps
level: module
realises:
  - UC-035
  - PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
  - A PLAN COVERS THE WHOLE SPECIFICATION
  - A PLANNED MODEL IMPLEMENTS ITS IMPLEMENTATION PLAN
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-795 The progress of a planned model as a grid, a timeline and the plan's steps

**REGISTER**

## Outcome

UC-035 step 2, first row of its table, and 2a. `progressIn` gives `planned` as null (`src/progress-measures/measures.mjs`,
header). This item builds it as MOD-progress-measures' file states it, on facts handed in: every accepted requirement in
every phase (`planGrid`), each cell done, in progress or open; the phases on a timeline with their gates as milestones;
the steps of the implementation plan with their states; with no accepted requirement, the phases empty.

## Acceptance

- For a fixture V-model product, the grid has N × P cells with the states its records give, and the timeline the gates
  its records pass; with no accepted requirement, the phases are empty.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
