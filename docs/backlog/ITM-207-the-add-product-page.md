---
id: ITM-207
title: The add-product page
level: module
realises:
  - UC-001
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
  - THE REPOSITORY CHOICE IS SPELLED OUT
  - A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
  - NO PRODUCT IS NAMED IN THE INSTANCE REPOSITORY
  - THE PAGE STATES WHAT IT SENDS WHERE
modules:
  - MOD-settings-pages
builds_on:
  - ITM-204
  - ITM-205
  - ITM-206
tests:
  - unit
origin:
  - UC-001
---
# ITM-207 The add-product page

## Outcome

The view `add-product` of MOD-settings-pages, as UC-001 and the module's file describe it: the address recognised as
GitHub or GitLab; Step A with the token's names filled in, or GitLab's project access token; Step B, *Check*; Step C,
*Add product*, one click, which writes the missing review layout with `reviewLayoutCommit` and adds the address to this
browser's list; UC-001's alternative flows; and each step with its folded explanation. The code that does this now,
`docs/assets/dashboard/add-product-view.mjs`, moves into `src/settings-pages/` on the modules of ITM-204 to ITM-206; the
old file re-exports its route, so that the dashboard's product selector keeps opening it.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, with the store and the hosts replaced by fakes,
  for UC-001's main flow and each of its alternative flows what the page shows and what it writes: the layout and the
  product's address on step C's one click, nothing in the instance repository, nothing written where UC-001 says
  nothing is.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests of the add-product flow stay green, with no expected result changed.
- Only `src/settings-pages/`, the tests that name MOD-settings-pages and the re-export in
  `docs/assets/dashboard/add-product-view.mjs` change.
