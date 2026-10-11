---
id: ITM-356
title: Review all use cases
level: module
realises:
  - UC-008
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
  - ONE CLICK PER DECISION
modules:
  - MOD-review-pages
builds_on:
  - ITM-355
tests:
  - unit
origin:
  - UC-008 3e
---
# ITM-356 Review all use cases

**REGISTER**

## Outcome

MOD-review-pages' route `use-case/all`, as its file states it: every open or changed use case in sequence, a changed one
as its difference and a new one in full; *Accept all N shown* writes one `acceptShown` commit (ITM-333); a use case
changed after the page was built is left out and named. `viewReviewAll` and `acceptAllPanel` in
`docs/assets/dashboard/review-views.mjs` are the model and stay.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists: five use cases, three of them open or changed,
  shown as three, and *Accept all 3 shown* giving one commit with three records; one changed after the page was built
  left out and named; an accepted use case not on the page.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
