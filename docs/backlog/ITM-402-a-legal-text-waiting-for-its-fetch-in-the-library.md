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
built_by:
  - c821814103e4e6959e7d085ae3a32688f8414fb7
  - 72e83c5afd6b49039c124034847fc5a5aa519bc2
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

**Done (sprint team2/98, po-opus-b):** read against its Acceptance on `main` at `3436203a`: TST-402001 (`tests/settings-pages-library.test.mjs:530`) states waiting, fetched and failed from the entry and the runs, and *Fetch again* starting `fetch-sources.yml` once with nothing committed by the page; it passes on `main`; built in team 2's sprint 50 (`72e83c5a`). No pull request names it, since it predates the pull-request flow or was built by another item. No code changes.
