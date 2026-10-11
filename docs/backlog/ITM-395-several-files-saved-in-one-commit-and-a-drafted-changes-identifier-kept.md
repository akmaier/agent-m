---
id: ITM-395
title: Several files saved in one commit, and a drafted change's identifier kept
level: module
realises:
  - UC-019
  - AN EDITED FILE KEEPS ITS IDENTIFIER
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - AN ARTIFACT RECORDS THE VERSION THAT PRODUCED IT
modules:
  - MOD-artifact-edits
builds_on:
  - ITM-335
tests:
  - unit
origin:
  - UC-019 step 9, 7a, 8b, 9a
---
# ITM-395 Several files saved in one commit, and a drafted change's identifier kept

**REGISTER**

## Outcome

MOD-artifact-edits, as its file now states it: `saveFile` takes several edits, the files one instruction changed by
prompt, and saves them in one commit, each only on its own `openedBlob`, or none, returning the first refusal and else
each new blob in order; an edit's `trailers` end the commit's message — a job's provenance lines when a person saves a
change by prompt —; and `keptIdentifier(text, openedId)` sets the front matter's `id` back to the one the file was
opened with, every other byte unchanged. The prompt pages (ITM-363) call them.

## Acceptance

- Unit tests that name MOD-artifact-edits state, before the code exists, with a fixture host: two files in one commit;
  one changed meanwhile refusing both; the trailers at the end of the message and none in the files; a changed `id`
  restored; a kept one unchanged; a single edit saved as before.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/artifact-edits/` and the tests that name MOD-artifact-edits change.
