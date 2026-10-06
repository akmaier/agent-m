---
id: ITM-223
title: The system and release tests of UC-002
level: system
realises:
  - UC-002
modules:
  - MOD-implementation-pages
  - MOD-product-process
  - MOD-model-catalogue
  - MOD-participant-list
builds_on:
  - ITM-222
tests:
  - system
  - release
origin:
  - UC-002
---
# ITM-223 The system and release tests of UC-002

**REGISTER**

## Outcome

The system and release tests of UC-002 through the route *How this product is developed*, as the dashboard reaches it:
the main flow and every alternative flow UC-002 names, each test stating its expected result, written from UC-002 and the
requirements it realises by the release tester, who implements none of the items it tests (`RELEASE TESTS ARE NOT WRITTEN
BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-002 realises has a release test; each new test's counter-proof is recorded in the pull request.
- Where the page and UC-002 disagree, the test follows UC-002 and the disagreement is named as a finding.
- Only tests change.
