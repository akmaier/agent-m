---
id: ITM-752
title: The recipe test-selection
level: module
realises:
  - UC-026
  - TEST GENERATION SEES THE EXISTING TESTS
  - COMMIT TESTS CALL NO PAID SERVICE
modules:
  - MOD-result-records
builds_on:
  - ITM-462
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-752 The recipe test-selection

**REGISTER**

## Outcome

MOD-result-records' `resultStrategies` with its recipe `test-selection`, in `strategies.mjs`, as its file states it.
The kinds `propose-tests` and `write-tests` name it (`src/job-catalogue/kinds/`). It gives:
- the text of each requirement, use case and module the job's parameters select;
- every existing test that guards any of them, with its declaration and code, found through MOD-trace-graph's
  `tracesTo`;
- the product's external services, each marked paid or free by `paidServices` (ITM-462, built).

UC-026 step 3. ITM-586 adds `commit-and-levels` and `result-record` to the same set. Whichever item comes second adds
to `strategies.mjs` and does not replace the set.

## Acceptance

- On a fixture product, a selection of one requirement gives its text and the two existing tests that guard it, by their
  declarations and code, and a test guarding another requirement is not included.
- An endpoint is marked paid and a free data source free.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/result-records/` and the tests that name MOD-result-records change.
