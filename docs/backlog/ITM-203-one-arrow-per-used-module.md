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

## Outcome

The component diagram of the modules view — the diagram on the dashboard's architecture page — is drawn as UC-025 step 5
says: one box per module inside the box of its subsystem, one arrow per used module, the modules with a gap marked. It
now draws one labelled arrow per used interface; for Agent M's 52 modules that text exceeds Mermaid's maximum, and the
page shows "Maximum text size in diagram exceeded" instead of the diagram. The diagram moves into the module's folder, to
`src/trace-pages/diagram.mjs`, the part MOD-trace-pages names for it; its old place, `componentDiagram` in
`docs/assets/traceability.mjs`, re-exports it, so that the page keeps working until the page itself moves.

## Acceptance

- Unit tests that name MOD-trace-pages state, before the code exists: one box per module; one box per subsystem holding
  its modules, the subsystem being the first decision the module follows; one arrow per pair of a module and a module it
  uses, however many of its interfaces it uses; a used module that has no file drawn as a box marked missing; and the
  text for 52 modules with 400 uses below Mermaid's limit of 50,000 characters.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The dashboard's architecture page draws Agent M's own component diagram.
- Only `src/trace-pages/`, the tests that name MOD-trace-pages and the re-export in `docs/assets/traceability.mjs`
  change.
