---
id: ITM-762
title: The user-level checklist of a release candidate
level: module
realises:
  - UC-028
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - A RESULT RECORD IS NEVER REWRITTEN
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
modules:
  - MOD-test-pages
builds_on:
  - ITM-760
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-762 The user-level checklist of a release candidate

**REGISTER**

## Outcome

UC-028 1a and UC-026 1a: for a release candidate, the route `runs/<commit>` shows the user-level tests as a checklist
for the people assigned to them. Each test shows its expected result. Each outcome a person enters is appended as a
result record through `appendResult` (built by ITM-635), occasion `release-candidate`, and is never replaced. The
release panel's `releaseReport` stays incomplete while one is missing.

## Acceptance

- With a fake host, one entered outcome adds one record at a new path, and an existing record is never changed.
- The checklist names what is still missing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
