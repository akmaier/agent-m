---
id: ITM-470
title: The candidate-classes test drafts an exact duplicate by its rule
level: module
realises:
  - UC-005
  - EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
modules:
  - MOD-job-runner
builds_on:
  - ITM-387
tests:
  - unit
origin:
  - ITM-450, #483
  - tests/job-runner-candidate-classes.test.mjs, "candidate-classes — an exact duplicate not classed a duplicate of the existing requirement goes back, naming it"
---
# ITM-470 The candidate-classes test drafts an exact duplicate by its rule

**REGISTER**

## Outcome

The test "candidate-classes — an exact duplicate not classed a duplicate of the existing requirement goes back, naming
it" in `tests/job-runner-candidate-classes.test.mjs` drafts as its third candidate "Print is double-sided", the name of
PRINT IS DOUBLE-SIDED in other letters, with another rule, and expects it found an exact duplicate of PRINT IS
DOUBLE-SIDED. That holds only while MOD-documents' `classifyCandidates` takes a matching name alone for a duplicate, which
ITM-450 reverses: an exact duplicate restates an existing requirement's rule. The third candidate states instead the rule
of PRINT IS DOUBLE-SIDED, "A print is double-sided.", so that it is an exact duplicate by its rule under either
behaviour; the test's given line says so. Its expected results stay as they are. It changes how the test prepares its
fixture, nothing else, and adds no behaviour.

## Acceptance

- Only that test's third candidate and its given line in `tests/job-runner-candidate-classes.test.mjs` change; no
  expected result changes, and no other test or file changes.
- CI is green on the item's commit, and on that commit merged with ITM-450's code as #483 has it.
- The pull request records a counter-proof: `classifyCandidates` planted to find no duplicate fails the test with the
  new candidate.
- Since the item adds no behaviour, its first commit need not be red.
