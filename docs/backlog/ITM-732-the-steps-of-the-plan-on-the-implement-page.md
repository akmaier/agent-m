---
id: ITM-732
title: The steps of the plan on the implementation page
level: module
realises:
  - UC-024
  - A PLANNED MODEL IMPLEMENTS ITS IMPLEMENTATION PLAN
  - AN IMPLEMENTATION PLAN ASSEMBLES THE SYSTEM FROM ITS MODULES
  - THE MODEL DETERMINES THE PHASES AND THE GATES
  - NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-725
  - ITM-789
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-732 The steps of the plan on the implementation page

**REGISTER**

## Outcome

MOD-implementation-pages' route `implement`, in its part `implement.mjs`, for a model that plans its work (UC-024 steps
1 to 3). `src/implementation-pages/index.mjs` says `implement` is not built.

The route shows:
- the route the product's model prescribes, with UC-024's table and the folded *What is this?* (ITM-725); without a
  declared model or without a plan, nothing to start and what is missing, with links to `process` and `plan` (1b);
  for a model that works from a backlog, a link to the backlog instead (1a);
- the steps of the plan in their order, each with the state `itemStates` derives — *waiting* with the step it waits
  for, *ready*, *in progress*, *done* — and its phase from `workflowOf`;
- the ready steps of the current phase preselected; a waiting step not selectable (2a); the steps of a phase whose
  closing gate is not recorded shown and not selectable, naming the gate and its decider (2b);
- the selection narrowed by the author, down to one step.

Choosing the participants and *Start jobs* is ITM-733; pull requests and *Merge* are ITM-734.

## Acceptance

- In a small DOM with a fixture V-model product and plan: the states and phases as `itemStates` and `workflowOf` give
  them; the ready steps of the current phase ticked; 2a and 2b not selectable with their reasons; 1b naming what is
  missing.
- No request leaves the fixtures.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
