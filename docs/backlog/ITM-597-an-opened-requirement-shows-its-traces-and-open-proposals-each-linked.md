---
id: ITM-597
title: An opened requirement shows its traces and open proposals, each linked
level: module
realises:
  - UC-020
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
  - OPEN PROPOSALS ARE SHOWN IN THE BROWSER
modules:
  - MOD-trace-pages
builds_on:
  - ITM-594
tests:
  - unit
  - component
  - system
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-597 An opened requirement shows its traces and open proposals, each linked

**REGISTER**

## Outcome

UC-020 step 5 (traces and proposals), step 6 (links), 2b, 5a, 5b and 5c. `tracesTo`, `statuses`, `queues` and `linkedVersion` are built, but the view does not call them.

## Acceptance

- The opened requirement lists, each as a link: its sources with version and part, its use cases with their review status, the decisions, modules and tests that name it, and its open proposals.
- *none*, *none yet*, unknown names and stale proposals are shown as the use case says.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
