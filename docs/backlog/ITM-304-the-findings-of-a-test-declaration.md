---
id: ITM-304
title: The findings of a test declaration
level: module
realises:
  - UC-026
  - EVERY TEST HAS ONE LEVEL
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
modules:
  - MOD-test-document
builds_on:
  - ITM-248
tests:
  - unit
origin:
  - the job runner's built-in check test-declarations
---
# ITM-304 The findings of a test declaration

**REGISTER**

## Outcome

MOD-test-document's `testFindings(declaration)`, as its file states it, in its part `checks.mjs`: the level missing or
unknown; the precondition, the input or the expected result missing; nothing guarded, no module, or `system` named by a
test of level `unit` or `component`; `phrasings` without `runs`, or fewer than two runs — each an error under its
requirement. The check `test-declarations` (ITM-331) calls it.

## Acceptance

- Unit tests that name MOD-test-document state, before the code exists, one per finding and one for a complete
  declaration.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/test-document/` and the tests that name MOD-test-document change.
