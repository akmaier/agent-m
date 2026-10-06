---
id: ITM-234
title: The entries of the change queues
level: module
realises:
  - UC-047
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-spec-changes
builds_on:
  - ITM-233
  - ITM-226
tests:
  - unit
origin:
  - UC-047
---
# ITM-234 The entries of the change queues

**REGISTER**

## Outcome

MOD-spec-changes' `Queue` and `queues`, as its file states them, in `src/spec-changes/`: every queue of a snapshot with
its entries, read from each queue's `index.md` and `entscheidungen.md` and from the approval records, each entry in the
state `open`, `approved` or `in SPEC`. The states `stale` and `waiting for its anchor` are not part of this item: they need
a SPEC section's text, and for a notification an entry in either waits for acceptance as an open one does; such an
entry reads as `open`. Nothing else of the module is part of this item.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists, on a fixture snapshot: a queue with an open, an
  approved and an accepted entry, newest first, and the entry table found in an `index.md` that holds an impact table
  before it.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
