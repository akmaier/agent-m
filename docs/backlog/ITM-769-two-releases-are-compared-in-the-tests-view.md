---
id: ITM-769
title: Two releases are compared in the tests view
level: module
realises:
  - UC-029
  - THE TRACEABILITY MATRIX IS DERIVED
  - THE NAME IS THE ID AND IT SURVIVES
modules:
  - MOD-trace-pages
builds_on:
  - ITM-766
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-769 Two releases are compared in the tests view

**REGISTER**

## Outcome

The comparison of the `tests` view (UC-029 step 6), through the template method's second version. Between two release
tags it shows the tests:
- added and removed;
- changed in what they guard or expect;
- changed in outcome.

These are derived from both versions' declarations and the records of both tagged commits.

## Acceptance

- On two fixture tags, one test in each of the four classes is listed in its class, and an unchanged test in none.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.
