---
id: ITM-396
title: The kinds' data files follow the catalogue's table
level: module
realises:
  - UC-005
  - UC-019
  - UC-021
  - ONE DEFINITION, THREE DRIVERS
  - THE PERSON WHO PROMPTS IS A SOURCE
modules:
  - MOD-job-catalogue
builds_on:
tests:
  - unit
origin:
  - UC-005 5a
  - UC-019 step 6
  - UC-021 1b
---
# ITM-396 The kinds' data files follow the catalogue's table

**REGISTER**

## Outcome

MOD-job-catalogue's data files of the kinds, as its file's table now states them: `derive-requirements`' answer names,
for a candidate, the source of a rule it points to where that is not the job's; `propose-groups`' answer is a list of
MOD-group-document's `GroupMove`s; `change-requirements` takes the parameter `source`, the own source of the person who
starts it. The table and the data files stay equal, as the catalogue's test compares them.

## Acceptance

- Unit tests that name MOD-job-catalogue state, before the code exists: the three answer schemas and the parameter as
  the table states them; a `GroupMove` answer accepted and a `{ item, group }` answer refused; the comparison of the
  table and the data files passing.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-catalogue/` and the tests that name MOD-job-catalogue change.
