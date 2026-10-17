---
id: ITM-764
title: Generate tests — review the cases and write them
level: module
realises:
  - UC-026
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - WHAT A PERSON DECIDES IS NOT SENT BACK
  - THE ROUNDS ARE COUNTED AND SHOWN
  - ONE CLICK PER DECISION
modules:
  - MOD-test-pages
builds_on:
  - ITM-763
  - ITM-754
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-764 Generate tests — review the cases and write them

**REGISTER**

## Outcome

The rest of the route `generate` (UC-026 steps 5 to 8, 5a, 6a, 8b, 1a):
- **The proposed cases** come from the attended job, or from a CI agent's job record through `listJobs`. They are
  grouped by level and by what they guard, each beside the existing tests of the same identifier, with the flags left
  after the rounds and the number of rounds.
- **The person** removes, edits or reclassifies cases.
- **Every case a duplicate**: the page says so and writes nothing (6a).
- **A case that needs a paid call** is marked for the nightly or release run only (5a).
- **A test the participant reports green with its fault** is shown again (8b).
- **Level `user`** is written as manual instructions, and the page says why no counter-proof is taken (1a).
- **Write tests** queues one job of kind `write-tests` with the cases as the person left them, on the participant's
  route.

## Acceptance

- With fake runtimes and a fixture proposal, the tests state:
  - the grouping beside the existing tests;
  - an edit carried into the `write-tests` job's parameters;
  - 6a with nothing queued;
  - one queued job per click.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
