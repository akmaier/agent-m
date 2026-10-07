---
id: ITM-240
title: The page shows what UC-002 states
level: module
realises:
  - UC-002
  - THE MODEL DETERMINES THE PHASES AND THE GATES
  - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
  - A PRACTICE IS NOT A MODEL
  - A PROCESS REQUIREMENT ADDS TO THE MODEL
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-222
tests:
  - unit
origin:
  - UC-002
---
# ITM-240 The page shows what UC-002 states

**REGISTER**

## Outcome

MOD-implementation-pages' route `process`, as its file states it, in `src/implementation-pages/`, shows what ITM-223's
tests find missing (F1 to F6):
- the table that keeps the process model and the rules to be met apart, unfolded at the page's first opening and folded
  at every later one; this is kept in memory only, never in the browser's storage, so it is no setting (step 1);
- the model's transitions and its verification pairs, beside its phases and gates (step 5);
- beside a branch, the gate at its end: for a phase, the model's gate that leaves that phase; for the sprint, the model's
  gate back to its first phase (step 5);
- for each practice, what it adds — its `## Adds`, read from the practice's file in the instance's snapshot with the
  catalogue's practice schema — beside the models it fits (step 6);
- for each gate the process requirements add, the phases it stands between (7, 7b);
- in 4b, the link to the participants' page, `#participants` (UC-017).

## Acceptance

- Unit tests that name MOD-implementation-pages state, before the code changes, each of the six through the route with
  fixture repositories.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- ITM-223's tests of F1 to F6 pass against the route; their files do not change in this item, and the release tester
  removes their todo marks (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).
- The existing tests stay green, with no expected result changed.
- Only `src/implementation-pages/` and the new tests that name MOD-implementation-pages change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
