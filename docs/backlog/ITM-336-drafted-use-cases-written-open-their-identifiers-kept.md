---
id: ITM-336
title: Drafted use cases written open, their identifiers kept
level: module
realises:
  - UC-007
  - UC-019
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - A GENERATED ARTIFACT IS A PROPOSAL
  - ONE USE CASE, ONE FILE
  - THE NAME IS THE ID AND IT SURVIVES
  - AN EDITED FILE KEEPS ITS IDENTIFIER
  - A CI AGENT'S DRAFT ENTERS AS OPEN
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
modules:
  - MOD-artifact-edits
builds_on:
  - ITM-219
  - ITM-299
  - ITM-309
tests:
  - unit
origin:
  - UC-007 steps 5 and 6
  - UC-019 step 7, 8b
---
# ITM-336 Drafted use cases written open, their identifiers kept

**REGISTER**

## Outcome

MOD-artifact-edits' `editStrategies`, as its file states them, with the check `identifier-kept` — an error finding when
a drafted change of an existing file carries another identifier, naming the one to keep — and the writer `open-files`:
the drafted use cases or architecture files in one commit on the default branch as open files; a change to an existing
identifier written into that file; a new one under the next free identifier of its kind (ITM-299), never one the history
holds (ITM-309); a drafted module whose identifier the history holds refused and named; `DueDiligenceMissing` while the
result's step findings hold the mark of a reuse decision whose registry could not be read; the provenance lines on the
commit, none in the files. The recipe `items-of-kind` (UC-021) is not part of this item.

## Acceptance

- Unit tests that name MOD-artifact-edits state, before the code exists, with a fixture host: two new use cases
  written in one commit as `UC-<n+1>` and `UC-<n+2>` past a number only the history holds; a change of `UC-004`
  written into its file; `identifier-kept` naming a changed identifier and passing a kept one; a module whose
  identifier the history holds refused; the due-diligence mark writing nothing; the provenance lines in the commit
  message and none in the files.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/artifact-edits/` and the tests that name MOD-artifact-edits change.
