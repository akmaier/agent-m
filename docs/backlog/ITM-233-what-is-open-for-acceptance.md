---
id: ITM-233
title: What is open for acceptance
level: module
realises:
  - UC-047
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-approvals
builds_on:
  - ITM-232
tests:
  - unit
origin:
  - UC-047
---
# ITM-233 What is open for acceptance

**REGISTER**

## Outcome

MOD-approvals' `approvalSchema` and `statuses`, as its file states them, in `src/approvals/`: the status — `open`,
`accepted` or `changed` — of every reviewed file of a snapshot, from one pass over `docs/approvals/`. Nothing else of the
module is part of this item.

## Acceptance

- Unit tests that name MOD-approvals state, before the code exists, on a fixture snapshot: a use case, a decision and a
  module that are open, accepted and changed, each with its kind; and a record read with `approvalSchema`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/approvals/` and the tests that name MOD-approvals change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
