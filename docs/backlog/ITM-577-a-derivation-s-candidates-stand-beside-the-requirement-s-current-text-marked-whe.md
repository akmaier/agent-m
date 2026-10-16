---
id: ITM-577
title: A derivation's candidates stand beside the requirement's current text, marked when they constrain the process
level: module
realises:
  - UC-005
modules:
  - MOD-review-pages
builds_on:
  - ITM-361
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-577 A derivation's candidates stand beside the requirement's current text, marked when they constrain the process

**REGISTER**

## Outcome

UC-005 step 7: "each beside the existing requirement it refers to"; 5b: "It is marked as such"; 7b: "Every candidate is a duplicate. The panel says so". `candidateItem` (`src/review-pages/jobs.mjs:349`) shows only "Beside <name>.". `candidateRows` (`src/review-pages/candidates.mjs`) already renders the text for UC-019.

## Acceptance

- Each candidate shows the current text of the requirement it refers to, through the same part UC-019's page uses (nothing twice).
- A candidate that constrains the process is marked.
- When every candidate is a duplicate, the panel says that writing only adds sources.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
