---
id: ITM-360
title: Edit on a requirement in the specification browser
level: module
realises:
  - UC-018
  - EDITS ARE PREPARED ON THE DASHBOARD
modules:
  - MOD-trace-pages
builds_on:
  - ITM-277
  - ITM-359
tests:
  - unit
origin:
  - UC-018 step 1
---
# ITM-360 Edit on a requirement in the specification browser

**REGISTER**

## Outcome

In MOD-trace-pages' specification view, as its file states it, *Edit* stands beside each requirement on the default
branch only, and leads to the review pages' `requirement/<name>/edit` (ITM-359). *Change by prompt* (UC-019) and
*Arrange* (UC-021) are not part of this item.

## Acceptance

- Unit tests that name MOD-trace-pages state, before the code exists: on the default branch, *Edit* leads to the route
  with the requirement's name; at a tag, no *Edit*.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.
