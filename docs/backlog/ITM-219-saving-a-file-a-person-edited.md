---
id: ITM-219
title: Saving a file a person edited
level: module
realises:
  - UC-002
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - AN EDITED FILE KEEPS ITS IDENTIFIER
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
modules:
  - MOD-artifact-edits
builds_on:
  - ITM-213
tests:
  - unit
origin:
  - UC-002
---
# ITM-219 Saving a file a person edited

**REGISTER**

## Outcome

MOD-artifact-edits' `saveFile`, as its file states it, in `src/artifact-edits/` beside `reviewLayoutCommit`: one
file a person edited, saved in one commit on the default branch only on the blob it was opened on, with the refusals the
file names. `docs/assets/dashboard/writes.mjs` is the model where it does the same.

## Acceptance

- Unit tests that name MOD-artifact-edits state, before the code exists, with a repository server replaced by a fixture: a save on the blob that was opened, in one commit; a refusal,
with nothing written, when the file changed meanwhile, with the current text; and a refusal when the identifier changed.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/artifact-edits/` and the tests that name MOD-artifact-edits change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
