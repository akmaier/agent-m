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

MOD-spec-document's `parseSpec`, as its file states it, in `src/spec-document/` beside `specSkeleton`: a SPEC's
sections and requirements with their name, source, rule and check, and whether each constrains the product or the
development process — which MOD-product-process reads as the process requirements and their sources.

## Acceptance

- Unit tests that name MOD-spec-document state, before the code exists, the requirements of a fixture SPEC with their four fields and their section; a process requirement told from a
product requirement; and a requirement whose field is missing named as a finding, not guessed.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-document/` and the tests that name MOD-spec-document change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
