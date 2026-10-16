---
id: ITM-578
title: A flagged candidate is split into entries of its own
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
# ITM-578 A flagged candidate is split into entries of its own

**REGISTER**

## Outcome

UC-005 6a: "The author splits a flagged candidate. Each part becomes an entry of its own." ITM-361's Outcome names the split, but no code or test exists.

## Acceptance

- On the review panel, a flagged candidate is split into parts, and `queue-entries` writes each part as an entry of its own.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
