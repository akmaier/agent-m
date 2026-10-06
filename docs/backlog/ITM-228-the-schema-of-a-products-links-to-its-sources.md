---
id: ITM-228
title: The schema of a product's links to its sources
level: module
realises:
  - UC-002
  - A PRODUCT LINKS THE SOURCES THAT APPLY
  - A LINK NAMES THE PART THAT APPLIES
modules:
  - MOD-source-register
builds_on:
  - ITM-217
  - ITM-226
tests:
  - unit
origin:
  - UC-002
---
# ITM-228 The schema of a product's links to its sources

**REGISTER**

## Outcome

MOD-source-register's `sourceSchemas` gives `links` beside `entry`, as the module's file states it, in
`src/source-register/`. `links` is the schema of a product's `docs/sources.md`, whose table stands under the product's
own title and is named `{ "underTitle": true }` (MOD-documents). Its rows are one per linked source: `Source` (the `SRC-`
identifier), `Version`, `Hash` (the version's hash) and `Part`. The schema names the requirements the module's file gives
its parts, `A PRODUCT LINKS THE SOURCES THAT APPLY` and `A LINK NAMES THE PART THAT APPLIES` among them.

The item builds the module's file as it is accepted when the item starts.

## Acceptance

- Unit tests that name MOD-source-register state, before the code changes:
  - `sourceSchemas()` giving `entry` and `links`;
  - a product's links file read with the links schema, rows with and without a part, and written back byte for byte;
  - a row without its version or its hash refused by `writeDocument` with `DocumentError` naming the row and the column;
  - this instance's `docs/sources.md` read with it: its row naming `SRC-vibe-coding` at the version `2026-10-05`. A finding
    on that file's own form goes to the review; the file does not change.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- One existing expected result changes: the reads that `tests/source-register.test.mjs` expects when the module loads
  gain `links.schema.md`, the second schema file the module's file names. Every other test stays green with no expected
  result changed.
- Only `src/source-register/` and the tests that name MOD-source-register change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
