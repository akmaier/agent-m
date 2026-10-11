---
id: ITM-298
title: The identifiers a text writes and its references by position
level: module
realises:
  - UC-007
  - UC-019
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
  - AN INSTANCE IS A FORK OF AGENT M
modules:
  - MOD-identifiers
builds_on:
  - ITM-232
tests:
  - unit
origin:
  - UC-007 step 5
  - UC-019 step 7
---
# ITM-298 The identifiers a text writes and its references by position

**REGISTER**

## Outcome

MOD-identifiers' `identifiersIn`, `positionalReferences` and `pagesAddress`, as its file states them, in
`src/identifiers/` beside `kindOfIdentifier`: every identifier a text writes, with its line — prefixed identifiers
wherever they stand, requirement names in backticks, as front-matter list items or as a requirement's bold head —; a
warning for each reference to a part of an artifact by its section, step or line number, a book's chapter not among
them; and an instance's dashboard address from `owner/name`. MOD-trace-graph calls them (ITM-305, ITM-306).
`nextIdentifier` is not part of this item.

## Acceptance

- Unit tests that name MOD-identifiers state, before the code exists: every kind of the scheme found with its line,
  and a name written in prose not taken for a requirement; a step number reported, a book's chapter not;
  `pagesAddress` for `owner/name`, and a `TypeError` for a string that is not of that form.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/identifiers/` and the tests that name MOD-identifiers change.
