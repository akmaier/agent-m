---
id: ITM-763
title: Generate tests — choose the selection and run the proposal
level: module
realises:
  - UC-026
  - EVERY TEST HAS ONE LEVEL
  - TEST GENERATION SEES THE EXISTING TESTS
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
  - THE PAGE NAMES WHERE IT SENDS
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
  - A TEST JOB RECEIVES THE CHAPTER ON TESTING
modules:
  - MOD-test-pages
builds_on:
  - ITM-753
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-763 Generate tests — choose the selection and run the proposal

**REGISTER**

## Outcome

MOD-test-pages' route `generate`, up to the proposal (UC-026 steps 1 to 4, 3a, 4a). It shows:
- **What can be tested**: the requirements, use cases and modules, each with the levels whose tests already guard it,
  through `testDeclarations`, `traceGraph` and `tracesTo`. Uncovered combinations are preselected.
- **The levels** chosen, with a folded *What is this?* per level that names the book's chapter.
- **The participants** that fill the test-writing role. For release tests the implementer is left out, through
  `listJobs`, and the page says so (4a).
- **The run panel**, whose **Run** queues one job of kind `propose-tests`.
- **A selection whose existing tests do not fit the context**: nothing is sent, and the page offers a smaller selection
  (3a).

The view hands `resultStrategies` and `approvalStrategies` to the frame.

**The reading of "accepted".** MOD-test-pages' Uses name no status function, but `propose-tests`' precondition
`rests-on-accepted` refuses a selection that names an unaccepted use case or requirement. So the page lists what the
graph holds, and the precondition names what is not accepted before anything is sent.

## Acceptance

- With fake hosts and runtimes, the tests state:
  - the uncovered combinations preselected;
  - the implementer left out for `release` and named;
  - one queued `propose-tests` job per click;
  - 3a, with nothing sent.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
