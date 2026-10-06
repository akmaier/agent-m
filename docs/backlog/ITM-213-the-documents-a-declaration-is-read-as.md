---
id: ITM-213
title: The documents a declaration is read as
level: module
realises:
  - UC-002
  - THE CATALOGUE IS DATA
modules:
  - MOD-documents
builds_on:
  - ITM-212
tests:
  - unit
origin:
  - UC-002
---
# ITM-213 The documents a declaration is read as

**REGISTER**

## Outcome

MOD-documents' interface, as its file states it, for what UC-002's modules need: the schema language with
`Schema`, `Document`, `Row`, `loadSchema`, `readDocument`, `writeDocument`, `documentFindings` and `readRegister`, in
`src/documents/`. `appendSection`, `classifyCandidates`, `artifactSchemas` and the schemas of use cases, decisions, modules
and items are not part of this item.

## Acceptance

- Unit tests that name MOD-documents state, before the code exists, a schema read and checked; a document read by its schema — front matter, tables, lists, free sections — and
written back byte for byte; the findings a schema decides, each in the one text form of a finding; and a register read
row by row.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/documents/` and the tests that name MOD-documents change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
