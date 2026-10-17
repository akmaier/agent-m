---
id: ITM-673
title: A late render does not replace a newer editor
level: module
realises:
  - UC-018
modules:
  - MOD-review-pages
builds_on:
  - ITM-603
tests:
  - unit
origin:
  - ITM-603's gate on pull request #712 (docs/gates/20261017-0907-development-release-testing-c71d.md), from developer-sonnet-e's finding
---
# ITM-673 A late render does not replace a newer editor

**REGISTER**

## Outcome

A lead from ITM-603's developer, unmeasured. An edit page's render reads before it draws. A render that ends after a
newer one started might set its editor as the route's, so `leave` would ask an editor no longer shown. The start first
writes the test that shows whether it happens: two renders, the first resolving last. The item is built only if that test
is red on the base (sprint 67's agreement: the measurement in a form the developer can make).

## Acceptance

- Two renders of an edit route, the first resolving last, leave the newer editor as the one `leave` asks.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
