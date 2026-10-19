---
id: ITM-1124
title: Check on a resource saved in the same visit reads the list as saved
level: module
realises:
  - UC-040
  - A PRODUCT DECLARES ITS RESOURCES
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-f's release tests of UC-040 (ITM-1041, pull request #1164, head aec01f83)
---
# ITM-1124 Check on a resource saved in the same visit reads the list as saved

**REGISTER**

## Outcome

TST-1041019: *Check* on a runner resource right after *Save* fails with `ResourceNotFound: no list of resources holds
gpu-box`. `src/settings-pages/resources.mjs:136` keeps the snapshot it opened, replacing only its commit, and the recipe
`resource-check` (`src/resource-list/strategies.mjs:56`) reads the list from that snapshot. Opening the page again works
(TST-1041004). After a save, the page's snapshot holds the saved text.

## Acceptance

- TST-1041019 passes and its `todo` is removed. Counter-proof: a Check on a resource the saved list does not hold is
  still refused.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
