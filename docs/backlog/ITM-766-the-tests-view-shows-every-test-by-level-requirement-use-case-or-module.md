---
id: ITM-766
title: The tests view shows every test by level, requirement, use case or module
level: module
realises:
  - UC-029
  - EVERY TEST HAS ONE LEVEL
  - THE TRACEABILITY MATRIX IS DERIVED
  - UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
  - THE NAME IS THE ID AND IT SURVIVES
modules:
  - MOD-trace-pages
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-766 The tests view shows every test by level, requirement, use case or module

**REGISTER**

## Outcome

MOD-trace-pages' descriptor `tests` (`views.mjs` holds only `specification` and `gaps`), the tree and its filters
(UC-029 steps 1 to 3, 1a, 1b, 2a):
- **The tree**: by level, test file and test case. Each test shows its `TST-` identifier, a title, and its outcome on the
  latest commit of the default branch, through `testDeclarations`, `resultsAt` and `flakyTests`.
- **The groupings**: by requirement, by use case and by module. Each group shows the levels that guard it, and a missing
  level is shown empty.
- **The filters**: failed, flaky, not run, model-dependent (`runs`), calls a paid service (`paid`), without
  counter-proof, and guards nothing.
- **Incomplete**: the tests whose declaration lacks its identifier, level or guards, with what is missing.
- **A guarded name that matches nothing**: shown as a broken link, and the test stays in its group.
- **A private repository without a token**: the view says so and shows nothing.

**A reading.** *Without counter-proof* means no file `docs/tests/counter-proofs/<TST>.md` at the version. That is the
path MOD-result-records' file fixes. MOD-trace-pages reads it through `readSnapshot` and does not parse it.

## Acceptance

- On a fixture product with a fixture `test-results` branch, the tests state each grouping, each filter, the empty
  level, the Incomplete group, the broken link, and 1b.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.
