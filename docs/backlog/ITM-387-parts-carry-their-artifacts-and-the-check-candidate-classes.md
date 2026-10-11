---
id: ITM-387
title: Parts carry their artifacts, and the check candidate-classes
level: module
realises:
  - UC-005
  - UC-007
  - UC-019
  - A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
  - EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
  - CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
  - A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT
modules:
  - MOD-job-runner
builds_on:
  - ITM-303
tests:
  - unit
origin:
  - UC-005 step 6
  - UC-007 step 5, 6a
  - UC-019 step 7
---
# ITM-387 Parts carry their artifacts, and the check candidate-classes

**REGISTER**

## Outcome

MOD-job-runner, as its file now states it: `Part` carries `artifacts`, each existing artifact a recipe's part shows with
its identifier and its format's key values; the check `candidate-classes` in `builtins.mjs` runs MOD-documents'
`classifyCandidates` (ITM-303) each round against the artifacts the job's parts carry — an error for a candidate the
rule finds a duplicate of an existing artifact while its drafter classed it otherwise, naming that artifact, and for a
change, a duplicate or a conflict that names no artifact a part carries —; and `JobResult` carries `classes`, the last
round's classes, which the page shows and the writer reads, `null` for a kind without that check. A draft whose parts
carry no artifact has nothing to classify. The recipes that fill `artifacts` are their modules' (ITM-332, ITM-337).

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists, with a fixture recipe whose part carries two
  requirements: an exact duplicate classed new sent back naming the existing one; a change naming no carried artifact
  sent back; two candidates of one key merged in `classes` naming both; a fixed draft passing; a kind without the check
  giving `classes: null`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
