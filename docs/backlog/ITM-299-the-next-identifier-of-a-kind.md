---
id: ITM-299
title: The next identifier of a kind
level: module
realises:
  - UC-007
  - UC-019
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - THE NAME IS THE ID AND IT SURVIVES
modules:
  - MOD-identifiers
builds_on:
  - ITM-232
tests:
  - unit
origin:
  - UC-007 step 5
---
# ITM-299 The next identifier of a kind

**REGISTER**

## Outcome

MOD-identifiers' `nextIdentifier`, as its file states it, in `src/identifiers/` beside `kindOfIdentifier`: for a
numbered kind, one more than the highest number of that kind ever used; for a slug kind, `<kind>-<slug>`;
`IdentifierTaken` for an identifier ever used, and `TypeError` for a slug kind without a slug or with a slug that breaks
the scheme. The writer `open-files` (ITM-336) calls it. `identifiersIn`, `positionalReferences` and `pagesAddress` are
not part of this item.

## Acceptance

- Unit tests that name MOD-identifiers state, before the code exists: `UC` after `UC-001`, `UC-022` and a withdrawn
  `UC-031` gives `UC-032`; a slug kind gives `<kind>-<slug>`; a used slug throws `IdentifierTaken`; a missing or
  broken slug throws `TypeError`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/identifiers/` and the tests that name MOD-identifiers change.
