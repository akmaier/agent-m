---
id: ITM-776
title: The release test that the catalogue is data
level: system
realises:
  - UC-031
  - THE CATALOGUE IS DATA
modules:
  - MOD-model-catalogue
builds_on:
tests:
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-776 The release test that the catalogue is data

**REGISTER**

## Outcome

`tests/test_catalogue_is_data.py`, the check SPEC.md names for `THE CATALOGUE IS DATA`, does not exist. MOD-model-catalogue
reads its shipped models and practices from `shipped.md` and the files it lists, and its code names none of them
(`src/model-catalogue/index.mjs`'s header). The test checks that no name of a shipped model or practice appears in the
code of Agent M's modules under `src/`, and that a model added as a data file is read by `catalogue` without a change
to code.

## Acceptance

- No model or practice name appears in a code file under `src/`; a model file added to a fixture instance's
  `docs/process-models/` appears in `catalogue`'s result.
- Each test names the requirement it guards, the module it exercises and its level `release`; its cases stand in a
  Markdown data file beside it, and the Python file only loads them (AGENTS.md §7).
- It is written by a participant who implemented none of the behaviour it tests; each test's counter-proof — a model
  name planted in a code file, and the test failing on it — is recorded in the pull request.
- Only the new test file and its data file change.
