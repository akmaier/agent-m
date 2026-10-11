---
id: ITM-339
title: A SPEC change entry beside the section it replaces
level: module
realises:
  - UC-006
  - UC-018
  - NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
  - A STALE APPROVAL IS NOT APPLIED
  - A QUEUE IS ACCEPTED IN ITS ORDER
modules:
  - MOD-spec-changes
builds_on:
  - ITM-234
  - ITM-302
  - ITM-307
tests:
  - unit
origin:
  - UC-006 steps 1, 2 and 7, 3b, 4d, 5a
  - UC-018 step 7
---
# ITM-339 A SPEC change entry beside the section it replaces

**REGISTER**

## Outcome

MOD-spec-changes, as its file states it: `queues` derives the states `stale` and `waiting for its anchor`, and
`createdBy`; and `entryView(queue, entry, snapshot)` gives what the reviewer sees — the current section (ITM-302),
`null` for a new one, beside the proposal with their blobs and their difference, the rationale's text, the impact list
(ITM-307) of every name the proposal changes, withdraws or adds with what references it, the state and `createdBy`. The
SPEC-entry pages (ITM-357, ITM-359) call them. `deriveSpecStatus` and `sectionForEntry` in `docs/assets/review-core.mjs`
and `entryImpact` in `docs/assets/dashboard/spec-changes-view.mjs` are the model and stay.

## Acceptance

- Unit tests that name MOD-spec-changes state, before the code exists, on fixture queues: an entry whose section
  changed after it was shown reads `stale`; an entry whose anchor an earlier entry creates reads `waiting for its
  anchor`, `createdBy` naming it; `entryView` of a changed requirement gives its impact list; of a renamed
  requirement, the old name withdrawn and the new one added; of a new section, `current` as `null`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-changes/` and the tests that name MOD-spec-changes change.
