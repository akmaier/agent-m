---
id: ITM-203
title: The modules view draws one arrow per used module
level: module
realises:
  - UC-025
modules:
  - MOD-trace-pages
builds_on:
tests:
  - unit
origin:
  - UC-025
---
# ITM-203 The modules view draws one arrow per used module

**REGISTER**

## Outcome

The component diagram of the modules view, in `src/trace-pages/diagram.mjs`, the part MOD-trace-pages names for it, is
drawn as UC-025 step 5 says: one box per module inside the box of its subsystem, one arrow per used module, and a used
module that has no file drawn as a box marked missing. For an architecture of Agent M's size, its text stays below
Mermaid's limit of 50,000 characters. Its model is `componentDiagram` in `docs/assets/traceability.mjs`.

## Acceptance

- Unit tests that name MOD-trace-pages state, before the code exists: one box per module; one box per subsystem holding
  its modules, the subsystem being the first decision the module follows; one arrow per pair of a module and a module it
  uses, however many of its interfaces it uses; a used module that has no file drawn as a box marked missing; and the
  text for 52 modules with 400 uses below Mermaid's limit of 50,000 characters.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.
