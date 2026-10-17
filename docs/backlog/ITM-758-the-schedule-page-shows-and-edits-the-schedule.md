---
id: ITM-758
title: The schedule page shows and edits the schedule
level: module
realises:
  - UC-027
  - THE TEST SCHEDULE IS DECLARED PER PRODUCT
  - THE DEFAULT SCHEDULE FOLLOWS THE BOOK
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - COMMIT TESTS CALL NO PAID SERVICE
  - NO SECRET IN THE REPOSITORY
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-test-pages
builds_on:
  - ITM-742
  - ITM-743
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-758 The schedule page shows and edits the schedule

**REGISTER**

## Outcome

MOD-test-pages' route `schedule`, the part before *Save*, as its file states it (UC-027 steps 1 to 4, 3b). It shows:
- the table of levels by occasion, from a form of the schedule's schema, with each row's number of tests;
- the book's default, marked as such until one is saved;
- a folded *What is this?* per row and column, naming the book's chapter;
- the *release candidate* column, which cannot be cleared, and the commit and pull request cells of `paid`, which
  refuse, each with its reason (`scheduleFindings`);
- the nightly time and the test command;
- the runner per row, among the participants with *run code and tests*, and the registration page of an unregistered
  self-hosted runner (3b);
- the secrets needed, by name (`secretsNeeded`), with the server's secrets page and its explanation, never asking for
  a value.

`src/test-pages/index.mjs` builds only `release`. Saving is ITM-759.

## Acceptance

- With fake hosts, the tests state what the page shows for a product without a schedule and for one with a schedule.
- They state the refused cells with their reasons, the runners offered, and the secrets by name.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
