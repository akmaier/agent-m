---
id: ITM-438
title: The whole SPEC as a recipe
level: module
realises:
  - UC-022
  - THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT
  - NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY
modules:
  - MOD-spec-changes
builds_on:
  - ITM-337
tests:
  - unit
origin:
  - UC-022 steps 3 and 6
---
# ITM-438 The whole SPEC as a recipe

**REGISTER**

## Outcome

MOD-spec-changes' `specStrategies` gain the recipe `whole-spec`, as its file states it: the SPEC as it stands, as one
part. The kinds `derive-architecture`, `review-architecture` and `change-architecture` name it.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists: the part holding the fixture SPEC's bytes as they
  stand; its size counted against a participant's context as the job runner counts every part.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
