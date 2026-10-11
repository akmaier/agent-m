---
id: ITM-386
title: The checks document-schema and test-declarations as the runner's file now states them
level: module
realises:
  - UC-007
  - UC-026
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - DON'T REPEAT YOURSELF
modules:
  - MOD-job-runner
builds_on:
  - ITM-328
  - ITM-331
  - ITM-378
  - ITM-380
tests:
  - unit
origin:
  - MOD-job-runner, Data: the built-in strategies
---
# ITM-386 The checks document-schema and test-declarations as the runner's file now states them

**REGISTER**

## Outcome

In MOD-job-runner's `builtins.mjs`, as its file now states them: `document-schema` reads each drafted document with the
schema `artifactSchemaOf` names for its path (ITM-378) and drops its own copy of the path patterns; `test-declarations`
adds an error under `A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS` for a file the reported branch adds that
`isTestFile` calls a test file (ITM-380) and that declares none, and a branch the host does not hold is a finding sent
back, not a throw. `prepareJob` lists among `blocking` a kind whose check needs what the context lacks —
`test-declarations` without the product's host.

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists: a drafted use case and a backlog item judged by
  their schemas and a path no pattern matches not judged; an added test file without a declaration reported; an unknown
  branch sent back as a finding; a job of `write-tests` without a host blocked before it starts; the existing cases of
  #328 and #334 asserting the same as before.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
