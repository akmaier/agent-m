---
id: ITM-315
title: Requirements that name no linked source
level: module
realises:
  - UC-006
  - A REQUIREMENT HAS A REGISTERED SOURCE
modules:
  - MOD-source-register
builds_on:
  - ITM-228
  - ITM-214
tests:
  - unit
origin:
  - UC-006 step 6
---
# ITM-315 Requirements that name no linked source

**REGISTER**

## Outcome

MOD-source-register's `sourceFindings(requirements, links, register)`, as its file states it: an error under `A
REQUIREMENT HAS A REGISTERED SOURCE` for each requirement none of whose source items names a source the product links —
an item names the register entry whose identifier, title or standard's designation it begins with, the longest match,
followed by its end or by `, ` and the part —, naming the requirement, its line and its items. MOD-spec-changes'
`acceptEntries` and `applyApproved` (ITM-340) call it. Nothing else of the module is part of this item.

## Acceptance

- Unit tests that name MOD-source-register state, before the code exists, on a fixture links file and register: `Vibe
  Coding, ch. 9` names the entry titled `Vibe Coding`; `SRC-x, Art. 13` names `SRC-x`; a requirement whose only item
  names an entry the product does not link, and one whose item names no entry, each yield the error with its line and
  items; a requirement with one linked item among others yields none.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/source-register/` and the tests that name MOD-source-register change.
