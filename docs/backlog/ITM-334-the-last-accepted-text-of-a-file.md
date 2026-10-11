---
id: ITM-334
title: The last accepted text of a file
level: module
realises:
  - UC-008
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-approvals
builds_on:
  - ITM-233
  - ITM-309
tests:
  - unit
origin:
  - UC-008 2a, 3e
---
# ITM-334 The last accepted text of a file

**REGISTER**

## Outcome

MOD-approvals' `lastAcceptedText(id, host)`, as its file states it, in `status.mjs`: the text that the most recent
approval record of an identifier names — most recent by the order of the commits that added the records (ITM-309) —,
also when the file has been renamed since; `null` when no record names it; the host's failures passed on. The review
pages (ITM-355, ITM-356) call it. `lastAccepted` in `docs/assets/dashboard/reads.mjs` and `docs/assets/review-core.mjs`
is the model and stays. `statusOf` is not part of this item.

## Acceptance

- Unit tests that name MOD-approvals state, before the code exists, on a fixture history: two records of one use case
  give the newer one's text; a file renamed after its record is still found; no record gives `null`; `TokenRefused` is
  passed on.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/approvals/` and the tests that name MOD-approvals change.
