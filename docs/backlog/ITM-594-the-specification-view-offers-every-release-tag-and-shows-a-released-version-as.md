---
id: ITM-594
title: The specification view offers every release tag and shows a released version as of its tag
level: module
realises:
  - UC-020
  - THE BROWSER SHOWS ANY RELEASED VERSION
modules:
  - MOD-trace-pages
builds_on:
tests:
  - unit
  - component
  - system
  - release
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-594 The specification view offers every release tag and shows a released version as of its tag

**REGISTER**

## Outcome

UC-020 steps 1, 1a and 1c. `src/trace-pages/flow.mjs:126-135` takes the ref from its caller. MOD-trace-pages' descriptor names "branch and tags".

## Acceptance

- The view offers the default branch and every release tag, newest first.
- A tag is shown read-only, *as of* it, with open proposals hidden.
- A product without tags is offered only *current*.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
