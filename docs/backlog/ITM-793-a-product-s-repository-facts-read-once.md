---
id: ITM-793
title: A product's facts read once with the scope all, from its repository
level: module
realises:
  - UC-035
  - UC-031
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-793 A product's facts read once with the scope all, from its repository

**REGISTER**

## Outcome

UC-035 step 1. ITM-536 builds `productFacts` with the scope `work` and leaves `all` to a later item; a call for `all`
is refused (`src/progress-measures/facts.mjs:123`). This item builds the scope `all` for what the product's files give,
as MOD-progress-measures' file states it, each read once: the trace graph, the accepted `requirements`, `modelSince`
from the declaration's history, the test declarations, the test schedule or its default, the branch `test-results`,
`ci.configured`, `ci.drift` and `ci.jobWorkflow`, and `resourceNeeds` — beside everything the scope `work` reads.

The facts only a server or a runtime gives — `info`, `ci.runs`, `tags`, and the live state of jobs — stay
`"unknown"` here, as the module's file allows for a host that gives them not; ITM-794 adds them.

## Acceptance

- Against a fixture product and instance, the scope `all` reads each of these facts once and gives them; the scope
  `work` gives what it gave before.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
