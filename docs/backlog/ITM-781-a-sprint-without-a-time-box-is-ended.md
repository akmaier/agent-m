---
id: ITM-781
title: A sprint without a time box is ended
level: module
realises:
  - UC-032
  - A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
  - ONE CLICK PER DECISION
modules:
  - MOD-work-plans
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-781 A sprint without a time box is ended

**REGISTER**

## Outcome

UC-032 6b. MOD-work-plans states `endSprint` and does not build it (`src/work-plans/index.mjs:6`). The sprint's schema
already reads `## Ended` with its day (`src/work-plans/sprint.schema.md:13`), and `progressIn` already ends a burn-down
there (`src/progress-measures/measures.mjs:47`). This item builds `endSprint` as the module's file states it: `## Ended`
with the date appended to the sprint's file, in one commit on the head that was read.

## Acceptance

- A running sprint without a time box gets `## Ended` with the day of `now`, which `planSchemas.sprint` reads back.
- `NotEndable` for a sprint with a time box, and for one already ended; nothing is written then.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
