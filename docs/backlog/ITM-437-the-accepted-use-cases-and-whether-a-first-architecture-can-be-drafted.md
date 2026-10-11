---
id: ITM-437
title: The accepted use cases, and whether a first architecture can be drafted
level: module
realises:
  - UC-022
  - ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES
  - THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE
  - THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT
modules:
  - MOD-approvals
builds_on:
  - ITM-332
tests:
  - unit
origin:
  - UC-022 steps 1 and 3, 1a, 1b, 1c
---
# ITM-437 The accepted use cases, and whether a first architecture can be drafted

**REGISTER**

## Outcome

MOD-approvals' `approvalStrategies` gain, as its file states them, the recipe `accepted-use-cases` — every use case
whose current text a record names, one part per file — and the precondition `architecture-ready` — an error finding
naming each open or changed use case, an error finding that points to UC-023 when the product already has an
architecture, and a warning finding naming every open SPEC change. The kinds `derive-architecture` and
`review-architecture` name them. The recipe `whole-architecture` and the architecture's part of `rests-on-accepted`
(UC-023) are not part of this item.

## Acceptance

- Unit tests that name MOD-approvals state, before the code exists, on a fixture repository behind a Host of the tests'
  own: the recipe's parts for two accepted use cases and none for an open one; the precondition's error naming the open
  use case; with an architecture file present, the error that points to UC-023; an open SPEC change's warning; no
  finding for a product that is ready.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/approvals/` and the tests that name MOD-approvals change.
