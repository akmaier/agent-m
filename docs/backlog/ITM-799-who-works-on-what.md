---
id: ITM-799
title: Who works on what
level: module
realises:
  - UC-035
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-progress-measures
builds_on:
  - ITM-881
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-799 Who works on what

**REGISTER**

## Outcome

UC-035 step 5 and 1b. MOD-progress-measures states `whoWorksOnWhat` and does not build it. This item builds it on the
facts: each participant of the product with its roles, its teams in a product with several, and its current jobs; what
each team's sprint holds; and each source of jobs that could not be read.

## Acceptance

- For a fixture product with two teams, each participant is listed with its roles, teams and jobs, the held items with
  their modules, and an unreachable Bridge with its reason.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): its missing input is a bug, ITM-881

Sprint 89's first Selection did not take it: `listJobs` reports a job's source as reachable when its runtime is not
(`src/job-ledger/index.mjs:426`, against MOD-job-ledger.md:173-175). That is a defect, registered as ITM-881; this item
builds on it.
