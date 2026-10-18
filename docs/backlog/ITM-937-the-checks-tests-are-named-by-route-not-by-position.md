---
id: ITM-937
title: The look and accessibility checks name their tests by route, not by position
level: unit
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-site-frame
builds_on:
  - ITM-905
tests:
  - unit
origin:
  - team 2's findings for team 1 in team2/93.md (cade4b79), by po-opus-b
---
# ITM-937 The look and accessibility checks name their tests by route, not by position

**REGISTER**

## Outcome

`tests/site-usability.d/routes.mjs` numbers the generated TST-904 and TST-905 tests by their position in the route table.
A route added to MOD-review-pages (#896, ITM-910) shifted the identifiers of every test after it, so a test's identifier
does not name the same check from one commit to the next. A test identifier is meant to name one test (MOD-identifiers).

## Acceptance

- Each generated test's identifier is derived from its route's address and its check, and stays the same when a route is
  added before it. A test adds a route at the front of a copy of the table and finds every other identifier unchanged,
  with a counter-proof (numbering by position).
- The first commit holds only the tests. No stub is committed.
