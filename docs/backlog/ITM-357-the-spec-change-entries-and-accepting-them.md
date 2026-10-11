---
id: ITM-357
title: The SPEC change entries and accepting them
level: module
realises:
  - UC-006
  - NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN
  - A QUEUE IS ACCEPTED IN ITS ORDER
  - A STALE APPROVAL IS NOT APPLIED
  - A REQUIREMENT HAS A REGISTERED SOURCE
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - ONE CLICK PER DECISION
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
modules:
  - MOD-review-pages
builds_on:
  - ITM-333
  - ITM-339
  - ITM-340
  - ITM-342
  - ITM-355
tests:
  - unit
origin:
  - UC-006 steps 1 to 7, 3b, 4b, 4c, 4d, 5a
---
# ITM-357 The SPEC change entries and accepting them

**REGISTER**

## Outcome

MOD-review-pages' SPEC-entry descriptor and its two routes, as its file states them:

- `spec-entry` lists every queue, newest first, with each entry's state and a tick for an open one.
- `spec-entry/spec-<queue>-<NN>` shows one entry (ITM-339): the current section beside the proposal, with their
  difference (ITM-342); the rationale, the impact list, and other open proposals on the same section; the queue's
  order and anchors.
- *Accept* and *Accept ticked* go through `acceptEntries` (ITM-340), with the product's links and the instance's
  register. Its refusals are shown: a stale entry shows its new state, to decide again; an entry is offered only with
  or after the entry that creates its anchor, which is named; a requirement that names no linked source is named.
- Without a token, for the instance's own SPEC, GitHub's page carries the record (ITM-333), and the instance's
  workflow writes the section; for a product's SPEC, *Accept* is not offered and the token's step is linked.

`viewSpec` and `viewSpecEntry` in `docs/assets/dashboard/spec-changes-view.mjs` are the model and stay. Editing an entry
in place (UC-006 3a) is not part of this item.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, on a fixture repository behind a Host of the
  tests' own: the list with the entries' states; one entry with section, proposal, difference, rationale and impact
  list; *Accept* writing one commit, after which the entry is in the SPEC; two ticked entries accepted in index order;
  06 not offered alone, 05 named; a stale entry: nothing written, its new state shown; the instance without a token: a
  link holding the record and no text; a product without a token: no *Accept*.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
