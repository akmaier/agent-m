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
`Schema`, `Document`, `Row`, `loadSchema`, `readDocument`, `writeDocument` and `readRegister`, in `src/documents/`.
`appendSection`, `classifyCandidates`, `artifactSchemas` and the schemas of use cases, decisions, modules and items are not
part of this item.

`loadSchema` reads a schema data file in the form its owners keep it. MOD-model-catalogue, MOD-participant-list,
MOD-source-register and MOD-product-process keep theirs as `*.schema.md`, and no module file says how such a file holds
the schema's JSON object. This item's tests state the form `loadSchema` reads; ITM-215 to ITM-218 write their schema files
in that form, so none of them changes MOD-documents.

`documentFindings` is not part of this item. Each of its findings names the requirement it applies (the module's file),
and MOD-text-tools' `finding` refuses a finding whose rule is not a requirement's name. Two gaps in MOD-documents' file
stand in the way, each a change request to akmaier:
- The schema language does not carry the requirement that a section, key, column or condition applies, so a format
  finding has no requirement to name.
- As the file stands, the marks of history would make every date of a `noHistory` document an error. The SPEC forbids
  only a withdrawal note, an edit stamp and the date of a change (`A DOCUMENT HOLDS NO HISTORY`), and it requires dates
  elsewhere (`DUE DILIGENCE IS FETCHED, NOT RECALLED`).

An item of its own builds `documentFindings` once akmaier has decided both.
- ITM-215 and ITM-216, whose findings come from it, start after that item.
- ITM-217 and ITM-218 use no `documentFindings`.

A schema's `noHistory` is read and kept, so the schemas that carry it load.

## Acceptance

- Unit tests that name MOD-documents state, before the code exists:
  - a schema read from the text of a `*.schema.md` file, in the form this item settles, and checked, and a schema that
    breaks the language refused with `SchemaError`, naming the key and the owner;
  - a document read by its schema — front matter, tables, lists, free sections — and written back byte for byte;
  - the values that depend on other values — `requiredWhen`, `forbiddenWhen` and `variants` — in a row of a table: read
    by the variant that holds, and refused by `writeDocument` with `DocumentError` naming the row and the column where they
    do not fit. An example is a register row without a `Model` whose `Type` is not `person`, as MOD-participant-list's
    register has it;
  - a register read row by row, and a schema with `noHistory` read and kept.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/documents/` and the tests that name MOD-documents change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
