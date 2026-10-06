---
id: ITM-214
title: The process requirements of a SPEC
level: module
realises:
  - UC-002
  - A REQUIREMENT NAMES WHAT IT CONSTRAINS
  - A REQUIREMENT HAS FOUR FIELDS
modules:
  - MOD-spec-document
builds_on:
  - ITM-212
tests:
  - unit
origin:
  - UC-002
---
# ITM-214 The process requirements of a SPEC

**REGISTER**

## Outcome

MOD-spec-document's `parseSpec`, with `Spec`, `SpecSection` and `Requirement`, as its file states it, in
`src/spec-document/` beside `specSkeleton`. It reads a SPEC's sections and its requirements, each with its name, its
source and that source's items (`sources`), its rule, its check, its section and its line.

What a requirement constrains follows from the SPEC it stands in, and no field of `Requirement` holds it (the module's
file, Data): the requirements of the instance's SPEC constrain the development process, those of a product's SPEC the
product. MOD-product-process takes the requirements of the instance's SPEC as the process requirements, with their
sources.

`requirementFindings`, `sectionText`, `replaceSection`, `requirementNamesIn` and `renamedRequirements` are not part of
this item.

## Acceptance

- Unit tests that name MOD-spec-document state, before the code exists, on fixture SPECs only — no test opens Agent M's
  own `SPEC.md` (`KEIN SPEC-ZUGRIFF AUS PRODUKT-CODE`, `SOFTWARE_MAINTENANCE.md`):
  - the requirements of a fixture SPEC with their four fields, their section and their line;
  - a source over several lines, and several sources split at `;` into `sources`, with and without the part each draws
    on;
  - a check naming several tests split at ` · `, and one at review naming none;
  - a requirement missing a field, read with that field `null`, not guessed;
  - the text of one section, such as a change queue's proposal, read as a SPEC is read.
- `src/spec-document/index.mjs` keeps its one read of `skeleton.md` as `tests/test_no_backend.py` permits it.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-document/` and the tests that name MOD-spec-document change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
