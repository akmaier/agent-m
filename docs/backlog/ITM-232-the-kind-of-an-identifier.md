---
id: ITM-232
title: The kind of an identifier
level: module
realises:
  - UC-047
  - EVERY ARTIFACT HAS AN IDENTIFIER
modules:
  - MOD-identifiers
builds_on:
tests:
  - unit
origin:
  - UC-047
---
# ITM-232 The kind of an identifier

**REGISTER**

## Outcome

MOD-identifiers' `IdentifierKind` and `kindOfIdentifier`, as its file states them, in `src/identifiers/`: the kind of a
string by the scheme, which MOD-approvals' `statuses` needs (ITM-233). Nothing else of the module is part of this item.

## Acceptance

- Unit tests that name MOD-identifiers state, before the code exists, the kind of an identifier of each kind of the
  scheme, and `null` for a string that is none.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/identifiers/` and the tests that name MOD-identifiers change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
