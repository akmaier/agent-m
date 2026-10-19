---
id: ITM-1019
title: Where a CI agent's workflow file is kept
level: unit
realises:
  - UC-017
modules:
  - MOD-settings-pages
builds_on:
  - ITM-352
tests:
  - unit
origin:
  - ITM-352's pull request #951 (sprint team1/93), from developer-sonnet-d's finding
---
# ITM-1019 Where a CI agent's workflow file is kept

**REGISTER**

## Outcome

UC-017 step 3 asks for "which workflow and model" of a CI agent, but the schema's route (MOD-participant-list.md:56) has no
place for a workflow file. Since ITM-352, the page keeps a *Workflow* field that it does not write.

**First task:** a draft for akmaier: either the register keeps the workflow file, and where, or UC-017 step 3 no longer
asks for it.

## Acceptance

- After the accepted draft, the participants route saves what UC-017 asks and the schema holds, and no field is drawn that
  is not saved. A test checks it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
