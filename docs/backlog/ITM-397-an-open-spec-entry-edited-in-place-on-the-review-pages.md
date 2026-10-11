---
id: ITM-397
title: An open SPEC entry edited in place on the review pages
level: module
realises:
  - UC-006
  - UC-018
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - A REFUSED SAVE KEEPS THE EDIT
  - EDITS ARE PREPARED ON THE DASHBOARD
modules:
  - MOD-review-pages
builds_on:
  - ITM-357
  - ITM-359
  - ITM-394
tests:
  - unit
origin:
  - UC-006 3a
  - UC-018 1a
---
# ITM-397 An open SPEC entry edited in place on the review pages

**REGISTER**

## Outcome

MOD-review-pages' editing of an open SPEC entry, as its file states it, with the SPEC-entry descriptor's `save` being
`entry`: *Edit* on an open entry opens the editor on its proposal, the blob noted, and *Save* goes through `saveEntry`
(ITM-394) into the entry's own queue; a refused save keeps the edit beside the newer text; an entry no longer open is
named with its state; without a token, GitHub's pages as for any SPEC edit.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, with a fixture host: an open entry edited and
  saved in place, no new queue made; a changed entry's refusal with the edit kept; an accepted entry offering no *Edit*;
  nothing written without the click.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
