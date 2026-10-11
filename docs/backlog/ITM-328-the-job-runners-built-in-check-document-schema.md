---
id: ITM-328
title: The job runner's built-in check document-schema
level: module
realises:
  - UC-007
  - UC-019
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - A FINDING READS LIKE A COMPILER MESSAGE
  - A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION
  - AN ARCHITECTURE DECISION STATES CONTEXT, DECISION, ALTERNATIVES AND CONSEQUENCES
modules:
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - MOD-job-runner, Data: the built-in strategies
  - UC-007 step 5
---
# ITM-328 The job runner's built-in check document-schema

**REGISTER**

## Outcome

The check `document-schema`, registered by the runner itself in `builtins.mjs`, as MOD-job-runner's file states it:
MOD-documents' `documentFindings` on every drafted document, each read by the artifact schema whose path it matches
(`artifactSchemas`, `readDocument`). Every kind that names it — `derive-use-cases`, `change-use-case`,
`derive-architecture`, `change-architecture` — then runs it in its correction loop.

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists: a fixture kind naming the check and a fixture
  driver whose first draft lacks a required section is asked once more with the finding in the compiler form, and its
  corrected draft ends the loop.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
