---
id: ITM-209
title: The backlog's order read as the table MOD-work-plans states
level: module
realises:
  - THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
  - UC-032
modules:
  - MOD-work-plans
  - MOD-documents
  - MOD-text-tools
builds_on:
  - ITM-212
  - ITM-213
tests:
  - unit
origin:
  - THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
---
# ITM-209 The backlog's order read as the table MOD-work-plans states

**REGISTER**

## Outcome

`docs/backlog/order.md` read as MOD-work-plans' file states it: a table `Item` that names every backlog item by its
identifier, in its order. MOD-work-plans gives the `backlog-order` schema in `planSchemas`; MOD-documents reads the order
by that schema with `loadSchema` and `readDocument`, and `documentFindings` names a row that does not fit it, each
finding in MOD-text-tools' one form. The parts of MOD-documents and MOD-text-tools that this needs are built as their
files state them.

## Acceptance

- Unit tests that name MOD-work-plans state, before the code exists: an order whose table `Item` names items is read as
  those items in the table's order; a row whose cell is no item's identifier is named as a finding of that row; and the
  order of this repository's own backlog is read as the items of its table, in their order.
- Unit tests that name MOD-documents or MOD-text-tools state, before the code exists, what their files say of each part
  of those modules that this needs.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- Only `src/work-plans/`, `src/documents/`, `src/text-tools/` and the tests that name their modules change.
