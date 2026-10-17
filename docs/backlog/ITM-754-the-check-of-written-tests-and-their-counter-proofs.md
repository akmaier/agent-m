---
id: ITM-754
title: The check of written tests and their counter-proofs
level: module
realises:
  - UC-026
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-result-records
builds_on:
  - ITM-753
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-754 The check of written tests and their counter-proofs

**REGISTER**

## Outcome

The second use of the check `test-proposals`, for the kind `write-tests`, as MOD-result-records' file states it. It
looks at the files the draft adds for its pull request:
- **an error** for a new automated test without its record in the schema `counter-proof` (`counter-proof.schema.md`,
  built), or with one that does not record it failing with its fault planted (UC-026 8b);
- **no error** where the draft reports the test failing on the current code: it awaits implementation (8a);
- **an error** for a written test whose identifier, level, guarded identifiers or expected result differ from the
  reviewed case it implements.

## Acceptance

- On fixture drafts, each case above is stated: a test with a valid counter-proof passes, and a level `user` case,
  which takes no counter-proof (1a), gives no error.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/result-records/` and the tests that name MOD-result-records change.
