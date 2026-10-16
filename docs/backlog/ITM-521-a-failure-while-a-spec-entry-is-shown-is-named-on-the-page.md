---
id: ITM-521
title: A failure while a SPEC entry is shown is named on the page
level: module
realises:
  - UC-006
  - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
modules:
  - MOD-review-pages
builds_on:
  - ITM-479
tests:
  - unit
  - release
origin:
  - pull request #537 (ITM-479's release tests), TST-479203, and its gate in sprint team1/31
---
# ITM-521 A failure while a SPEC entry is shown is named on the page

**REGISTER**

## Outcome

The review pages' route catches a failure raised after the snapshot is read, as it already catches one raised while
reading it (`render` in `src/review-pages/flow.mjs`). Such a failure arises, for example, while the impact list of a
SPEC entry is built. The route draws the problem paragraph the review pages draw for a failure (`problem` in
`common.mjs`). For a used-up rate limit, that paragraph names the limit and the time it resets, and never says the token
was refused.

Today `showEntry` has no catch: a `RateLimited` raised while the impact list is built rejects `route.render`, and the
page shows nothing in its place.

## Acceptance

- A release test, written before the code by a Developer who implemented none of the review pages' behaviour, opens a
  SPEC entry's page while the account's hourly limit is used up. It finds a problem paragraph naming the used-up limit
  and its reset, and no word of the token.
- A unit test of MOD-review-pages states the same for a failure raised by the entry's view; a counter-proof without the
  catch fails it.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
