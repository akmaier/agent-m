---
id: ITM-784
title: The board pulls an item only below the work-in-progress limit
level: module
realises:
  - UC-032
  - NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT
  - A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-681
  - ITM-789
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-784 The board pulls an item only below the work-in-progress limit

**REGISTER**

## Outcome

UC-032 step 7 and 7a. MOD-implementation-pages states the route `board` and does not build it. For a model with a
work-in-progress limit, the board shows the model's columns with each item in the column of its derived state, and the
limit — per team in a model with sprints. *Pull* on a ready item is refused at the limit, naming the items in progress
and those waiting for review; in a model with sprints only selected items can be pulled.

**Reading.** The module's file does not say what *Pull* writes. State is derived (`PROGRESS AND JOB STATE ARE DERIVED,
NOT STORED`), and an item is *in progress* once a job runs or a pull request is open. So *Pull* opens the route
`implement` (ITM-789) with the item selected, whose *Start jobs* starts its job; `startable` gives the refusal.

## Acceptance

- At the limit, *Pull* is unavailable and the panel names the items in progress; below it, *Pull* leads to *Start jobs*
  for that item.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
