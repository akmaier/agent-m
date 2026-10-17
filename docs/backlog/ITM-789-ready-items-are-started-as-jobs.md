---
id: ITM-789
title: Ready items are started as implementation jobs
level: module
realises:
  - UC-034
  - AGILE IMPLEMENTATION STARTS FROM THE BACKLOG
  - NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
  - NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT
  - A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - THE PAGE NAMES WHERE IT SENDS
  - ONE CLICK PER DECISION
modules:
  - MOD-implementation-pages
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-789 Ready items are started as implementation jobs

**REGISTER**

## Outcome

UC-034 steps 1 to 4, 2a, 3a and 4a. MOD-implementation-pages states the route `implement` and does not build it. This
item builds its start, as the module's file states it:
- the ready items — or, with *Start sprint work*, every ready item of the team's sprint —, each with its state and, if it
  cannot start, every reason `startable` gives, from `productFacts` with the scope `work`;
- per item, the participants that hold the implementing role in the item's role assignment and can write and run tests
  (`eligible`), each with where it processes data, its routes from `routesFor`, the attempt limit, who merges, the
  target branch, and the gates the job will meet with who decides them; the run panel of `prepareJob` names what is sent;
- *Start jobs*, one click, which writes each job's start record and queues it on its participant's route with
  `queueJob` — handed to a Bridge at once where the route is one; a route that does not answer leaves the job queued
  and is named.

## Acceptance

- An item not selected for the team's sprint, with a requirement not accepted, with an item it builds on not done, or
  above the limit, is not started, and its reasons are named; with no startable item nothing starts.
- A started item has one start record under `docs/jobs/` naming a holder of the implementing role.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
