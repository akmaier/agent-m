---
id: ITM-796
title: The board and the cumulative flow of a model with a work-in-progress limit
level: module
realises:
  - UC-035
  - PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-796 The board and the cumulative flow of a model with a work-in-progress limit

**REGISTER**

## Outcome

UC-035 step 2, third row of its table. `progressIn` gives `flow` as null. This item builds it as MOD-progress-measures'
file states it: the board with the model's columns, each item in one, the limit — per team in a model with sprints —,
and the items per state per day, each state dated by the records and the pull requests.

## Acceptance

- For a fixture Kanban product, the columns hold the items of their states and the cumulative counts follow the dated
  records day by day.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
