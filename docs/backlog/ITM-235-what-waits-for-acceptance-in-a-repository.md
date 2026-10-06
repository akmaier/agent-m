---
id: ITM-235
title: What waits for acceptance in a repository
level: module
realises:
  - UC-047
  - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
modules:
  - MOD-progress-measures
builds_on:
  - ITM-233
  - ITM-234
tests:
  - unit
origin:
  - UC-047
---
# ITM-235 What waits for acceptance in a repository

**REGISTER**

## Outcome

MOD-progress-measures' `waitingForAcceptance`, as its file states it, in `src/progress-measures/`: what waits for the
person's acceptance in one repository — the open SPEC change entries, and the open or changed use cases, decisions and
modules —, each with its identifier, path and blob. A release test report that waits is not part of this item: no release
candidate exists before UC-013's release is built; ITM-239 adds it. Nothing else of the module is part of this item.

## Acceptance

- Unit tests that name MOD-progress-measures state, before the code exists, on a fixture snapshot: each kind that waits,
  with its identifier, path and blob, and nothing for what is accepted.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/progress-measures/` and the tests that name MOD-progress-measures change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
