---
id: ITM-402
title: A legal text waiting for its fetch in the library
level: module
realises:
  - UC-004
  - AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - ITM-350
  - ITM-400
  - ITM-401
tests:
  - unit
origin:
  - UC-004 step 7, 7a
---
# ITM-402 A legal text waiting for its fetch in the library

**REGISTER**

## Outcome

In MOD-settings-pages' route `library`, as its file states it: an EU legal text that waits for its fetch shown as
waiting, a failed fetch shown with the failure the instance's run of `onSourcesCommitted` reports, and *Fetch again*,
one click, starting that workflow with `startWorkflow` (ITM-400); nothing of the fetch's state is written into the
entry.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, with fixture runs: waiting, fetched and failed
  shown from the runs and the entry; *Fetch again* starting the workflow once; nothing written on the page's own
  account.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
