---
id: ITM-584
title: A change from an issue is drafted and saved as a queue naming the issue, and the issue moves to the backlog
level: module
realises:
  - UC-012
modules:
  - MOD-maintenance-pages
  - MOD-issue-handling
builds_on:
  - ITM-582
tests:
  - unit
  - component
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-584 A change from an issue is drafted and saved as a queue naming the issue, and the issue moves to the backlog

**REGISTER**

## Outcome

UC-012 step 6 and its second postcondition. `backlogItemFrom` and `moveToBacklog` are not built. `itemFromIssue` stands in code no module owns (`docs/assets/work-items.mjs:204`). Once the module is built, a pull request between jobs replaces that code with it.

## Acceptance

- The change of requirements is drafted against the existing ones with the issue as its origin, and saved as a change queue that names the issue.
- *Move to backlog* writes the item, and the issue's comment and label.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
