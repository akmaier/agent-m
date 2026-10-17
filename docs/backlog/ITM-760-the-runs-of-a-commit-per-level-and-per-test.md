---
id: ITM-760
title: The runs of a commit, per level and per test
level: module
realises:
  - UC-028
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-test-pages
builds_on:
  - ITM-743
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-760 The runs of a commit, per level and per test

**REGISTER**

## Outcome

MOD-test-pages' routes `runs` and `runs/<commit>`, the reading part (UC-028 steps 1 to 4, 2a, 2b, 6a, 7a):
- **The commit** is chosen from the default branch's history, an open pull request or a release tag, and shown by its
  SHA, message and date.
- **One line per level** gives passed, failed, flaky and not run, through `resultsAt` and `flakyTests`. A level without
  a record reads *not run on this commit*, with the occasion from `occasionsOf`.
- **A level's tests** show their outcomes, rates with their runs, what each guards as a link, and the participant and
  date.
- **A failed test** shows its expected result beside the observed one, with its log through `ciRunLog`. A log the
  server no longer keeps is marked unavailable (2a).
- **A worse rate** is shown with both rates (7a).
- **Records that cannot be read from the browser** (2b), for example a private repository without a token: the page
  says so, from the failure of reading `test-results`, and links the server's page of runs, `webLinks().actions`. The
  link to the branch `test-results` and to the run itself is ITM-855.
- **A record marked `uncommitted`** is shown and not counted (6a).

Running on the commit is ITM-761.

## Acceptance

- With fake hosts and a fixture `test-results` branch, the tests state each part above.
- A level without a record never reads *passed*.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
