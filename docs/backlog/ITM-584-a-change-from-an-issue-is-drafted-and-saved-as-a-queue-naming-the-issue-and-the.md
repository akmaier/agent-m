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

**Rests on queue `2026-10-17d` (2026-10-17, po-opus).**
- akmaier rejected the path this item counts on: code no module owns, changed by a pull request between jobs.
- Under the draft of queue `2026-10-17d`, the module whose file names that code as taken over changes it in its own
  implementation job, moving it into the module or removing it. A workflow or a page whose place the platform fixes
  is named in that module's parts.
- This item waits for akmaier's acceptance of that draft, and its fix is read again then.
