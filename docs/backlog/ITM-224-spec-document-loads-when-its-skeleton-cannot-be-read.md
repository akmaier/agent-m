---
id: ITM-224
title: MOD-spec-document loads when its skeleton cannot be read
level: module
realises:
  - UC-001
  - ADDING A PRODUCT CREATES ITS LAYOUT
modules:
  - MOD-spec-document
builds_on:
  - ITM-214
tests:
  - unit
origin:
  - UC-001
---
# ITM-224 MOD-spec-document loads when its skeleton cannot be read

**REGISTER**

## Outcome

MOD-spec-document reads its own `skeleton.md` as its file states it (Files): if the read fails while the module loads,
the module still loads, and `specSkeleton` fails with the reason when it is called. So no page that loads the module
fails with the read — neither UC-001's page, nor a page that loads MOD-spec-document for `parseSpec` through
MOD-product-process (UC-002). `src/spec-document/index.mjs` throws while it loads when the read fails.

The item builds on ITM-214: its tests use `parseSpec`, and it changes the folder ITM-214 changes, so it never runs beside
ITM-214.

## Acceptance

- Unit tests that name MOD-spec-document state, before the code changes:
  - with `skeleton.md` unreadable, the module loads, `parseSpec` reads a SPEC, and `specSkeleton` fails with the reason;
  - with `skeleton.md` readable, `specSkeleton` gives the same text as before.
- The module keeps its one fetch as `tests/test_no_backend.py` permits it: `fetch(url)` of
  `new URL("./skeleton.md", import.meta.url)` in `src/spec-document/index.mjs`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-document/` and the tests that name MOD-spec-document change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
