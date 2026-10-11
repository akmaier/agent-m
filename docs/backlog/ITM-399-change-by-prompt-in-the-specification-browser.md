---
id: ITM-399
title: Change by prompt in the specification browser
level: module
realises:
  - UC-019
  - EDITS ARE PREPARED ON THE DASHBOARD
modules:
  - MOD-trace-pages
builds_on:
  - ITM-360
  - ITM-398
tests:
  - unit
origin:
  - UC-019 step 1
---
# ITM-399 Change by prompt in the specification browser

**REGISTER**

## Outcome

In MOD-trace-pages' specification view, as its file states it, on the default branch only: *Change by prompt* on a
requirement, leading to the review pages' `requirement/<name>/prompt`, and on a group, handing the names it holds to
`requirements/prompt` (ITM-398). *Arrange* (UC-021) is not part of this item.

## Acceptance

- Unit tests that name MOD-trace-pages state, before the code exists: the two controls on the default branch and on no
  tag; the group's names handed on in its order.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.
