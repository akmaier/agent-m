---
id: ITM-798
title: What is blocked, each with its reason
level: module
realises:
  - UC-035
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-798 What is blocked, each with its reason

**REGISTER**

## Outcome

UC-035 step 4. MOD-progress-measures states `blocked` and does not build it. This item builds it on the facts: every
item or plan entry that cannot move, with its reason — a failed job; a job waiting at a gate, with the role or check
that decides it; a requirement not yet accepted; the work-in-progress limit of its team; another team's sprint that
holds what it needs, with the sprint and the module.

## Acceptance

- A fixture product with one case of each reason lists each with its reason and detail, and nothing else.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
