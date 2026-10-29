---
id: ITM-1308
title: The move tests guard UC-033 by identifier
level: module
realises:
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
modules:
  - MOD-maintenance-pages
builds_on: []
tests:
  - unit
origin:
  - po-opus-c's gate of ITM-1284 (PR #1428), docs/gates/20261029-0957-development-release-testing-acd2.md, the reader on the changed tests
---
# ITM-1308 The move tests guard UC-033 by identifier

**REGISTER**

## Outcome

`tests/maintenance-pages-move-1250.test.mjs` holds five guards entries that name a step of UC-033:
- "UC-033 2" (`:161`);
- "UC-033 1a" (`:202` and `:267`);
- "UC-033 4b" (`:230`);
- "UC-033 4a" (`:299`).

MOD-test-document's reader reports each under A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION, on
`sprint/team1/115` as on ITM-1284's head. A guards entry is "the requirements it guards by name, or use cases by
identifier" (MOD-test-document.md:60). The entries name UC-033.

## Acceptance

- The reader reads the file with no finding, shown against a known positive.
- No expected result changes, and CI is green on every commit (refactoring).
- Only `tests/maintenance-pages-move-1250.test.mjs` changes.
- Tests of other modules this Outcome changes: none.
- It removes no test.
