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

`loadSchema` reads a schema data file in the form its owners keep it. MOD-model-catalogue, MOD-participant-list,
MOD-source-register and MOD-product-process keep theirs as `*.schema.md`, and no module file says how such a file holds
the schema's JSON object. This item's tests state the form `loadSchema` reads; ITM-215 to ITM-218 write their schema files
in that form, so none of them changes MOD-documents.

The findings `documentFindings` makes of the marks of history, for a schema with `noHistory`, are not part of this item:
- As MOD-documents' file stands, each mark `historyMarks` finds would be an error, every date included.
- The SPEC forbids only a withdrawal note, an edit stamp and the date of a change (`A DOCUMENT HOLDS NO HISTORY`), and it
  requires dates elsewhere (`DUE DILIGENCE IS FETCHED, NOT RECALLED`).
- That gap is a change request to akmaier; an item of its own brings these findings as akmaier decides them.

A schema's `noHistory` is read and kept, so the schemas that carry it load.

## Acceptance

- Unit tests that name MOD-documents state, before the code exists:
  - a schema read from the text of a `*.schema.md` file, in the form this item settles, and checked;
  - a document read by its schema — front matter, tables, lists, free sections — and written back byte for byte;
  - the findings a schema decides, each in the one text form of a finding — the marks of history aside, as above —, and a
    schema with `noHistory` read and kept;
  - the values that depend on other values — `requiredWhen`, `forbiddenWhen` and `variants` — in a row of a table, for
    example a register row whose `Model` is required for every `Type` but `person`, as MOD-participant-list's register
    has it;
  - a register read row by row.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/documents/` and the tests that name MOD-documents change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
