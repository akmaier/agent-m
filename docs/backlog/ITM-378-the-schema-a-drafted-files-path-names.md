---
id: ITM-378
title: The schema a drafted file's path names
level: module
realises:
  - UC-007
  - UC-019
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
  - DON'T REPEAT YOURSELF
modules:
  - MOD-documents
builds_on:
tests:
  - unit
origin:
  - UC-007 step 5
  - MOD-job-runner, Data: the check document-schema
---
# ITM-378 The schema a drafted file's path names

**REGISTER**

## Outcome

MOD-documents' `artifactSchemaOf(path)`, as its file states it: the one of the four schemas that `artifactSchemas` gives
whose path pattern the path matches, with the placeholders as the schema language defines them and as `documentFindings`
matches a path, or `null`. It reuses the pattern matching the module already has; no second copy of a pattern is made.
The check `document-schema` (ITM-386) calls it.

## Acceptance

- Unit tests that name MOD-documents state, before the code exists: a use case, a decision, a module file and a backlog
  item path each give their schema; a plan step's path gives the item schema; a path under `docs/` that no pattern
  matches, and a pattern's near miss, give `null`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/documents/` and the tests that name MOD-documents change.
