---
id: ITM-226
title: A section under the title, and a section's table found by its header
level: module
realises:
  - UC-002
modules:
  - MOD-documents
builds_on:
  - ITM-227
tests:
  - unit
origin:
  - UC-002
---
# ITM-226 A section under the title, and a section's table found by its header

**REGISTER**

## Outcome

MOD-documents reads two things as its accepted file states them (Data, *Sections and their tables*), in `src/documents/`,
where ITM-213 built them otherwise:
- A section `{ "underTitle": true }` is the text under the document's title, read with the title line as its heading. A
  schema names at most one, as its first section, and then no section of level one.
- A section's table is the first table in it whose header row names exactly the table's columns, in their order. A
  table without a header row is the section's first table.

`loadSchema`, `readDocument`, `writeDocument`, `readRegister` and `documentFindings` follow both. A product's links file
(ITM-228) is the first format that needs a section under its title.

## Acceptance

- Unit tests that name MOD-documents state, before the code changes, on fixture schemas and documents:
  - a section under the title, read with the title line as its heading and written back byte for byte;
  - a second such section, or one that is not the first, refused by `loadSchema` with `SchemaError`;
  - a required section under the title that is missing, named by `documentFindings`;
  - a section's table found by its header among other tables, and a table without a header row as the section's first.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- An existing test whose table is no longer its section's table changes with it, named in the pull request with the
  expected result it changes. Every other test stays green with no expected result changed.
- Only `src/documents/` and the tests that name MOD-documents change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
