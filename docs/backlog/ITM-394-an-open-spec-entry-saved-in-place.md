---
id: ITM-394
title: An open SPEC entry saved in place
level: module
realises:
  - UC-006
  - UC-018
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - A REFUSED SAVE KEEPS THE EDIT
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
modules:
  - MOD-spec-changes
builds_on:
  - ITM-339
  - ITM-341
tests:
  - unit
origin:
  - UC-006 3a
  - UC-018 1a
---
# ITM-394 An open SPEC entry saved in place

**REGISTER**

## Outcome

MOD-spec-changes' `saveEntry(host, edit)`, as its file states it: an edited entry saved in its own queue, in one commit
under the person's account, its proposal replaced and its rationale's impact list computed anew; no second queue.
Refused when the proposal's blob differs from the one it was opened on, with the newer text, and when the entry is no
longer open, naming its state; without a token as `proposeSection`. The review pages (ITM-397) call it.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists, with a fixture host: an open entry saved in place
  in one commit with its new impact list; no new queue; a changed proposal refused with its text; an accepted entry
  refused naming its state; GitHub's pages without a token.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
