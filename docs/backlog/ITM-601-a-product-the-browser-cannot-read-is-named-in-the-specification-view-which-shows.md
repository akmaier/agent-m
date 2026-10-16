---
id: ITM-601
title: A product the browser cannot read is named in the specification view, which shows nothing
level: module
realises:
  - UC-020
modules:
  - MOD-trace-pages
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-601 A product the browser cannot read is named in the specification view, which shows nothing

**REGISTER**

## Outcome

UC-020 2a: "the browser says so and shows nothing". `flow.mjs:126-136` handles no failed read.

## Acceptance

- A refused or missing read is named by the host's error, and no tree is shown.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
