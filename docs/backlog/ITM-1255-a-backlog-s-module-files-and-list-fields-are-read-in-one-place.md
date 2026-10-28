---
id: ITM-1255
title: A backlog's module files and list fields are read in one place
level: module
realises:
  - A BACKLOG ITEM NAMES THE MODULES IT CHANGES
modules:
  - MOD-work-plans
  - MOD-issue-handling
  - MOD-maintenance-pages
builds_on:
  - ITM-1250
tests:
  - unit
origin:
  - the review of ITM-1250 (PR #1380) by reviewer-sonnet, against AGENTS.md §2 principle 2, "Nothing twice"
---
# ITM-1255 A backlog's module files and list fields are read in one place

**REGISTER**

## Outcome

The architecture's module files are found and read three times: `MODULE_FILE` and its loading line in
`src/work-plans/strategies.mjs`, `src/issue-handling/backlog.mjs` and `src/maintenance-pages/issues.mjs`. A list field is
read twice, `listOf` (`backlog.mjs`) and `namesOf` (`issues.mjs`), and an item's identifier and file have two near-equal
patterns (`ITEM_IDENTIFIER`, `ITEM_FILE`). Each is defined once, in the module the others already use for the backlog, and
used from there; where that needs a function the module files do not name, the item stops and names it.

## Acceptance

- The existing tests of the three modules pass unchanged; a unit test pins the one definition. No behaviour changes.
- Only `src/work-plans/`, `src/issue-handling/`, `src/maintenance-pages/` and the tests that name these modules change.
