---
id: ITM-210
title: The component diagram marks modules with a gap and interfaces no module provides
level: module
realises:
  - UC-025
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
modules:
  - MOD-trace-pages
builds_on:
  - ITM-203
tests:
  - unit
origin:
  - UC-025
---
# ITM-210 The component diagram marks modules with a gap and interfaces no module provides

**REGISTER**

## Outcome

The component diagram of the modules view, `src/trace-pages/diagram.mjs`, shows what UC-025 step 5 and 5a ask beyond a
used module that has no file: each module with a gap of step 4 is marked, and a used interface that its module does not
provide is drawn as an arrow ending in a box marked *missing*. The diagram is given the gaps as MOD-trace-graph's
`moduleRows` returns them.

## Acceptance

- Unit tests that name MOD-trace-pages state, before the code exists: a module with a gap is marked, and a module without
  one is not; a used interface that an existing module does not provide is drawn as an arrow ending in a box marked
  missing; and the text for 52 modules with 400 uses stays below Mermaid's limit of 50,000 characters.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.
