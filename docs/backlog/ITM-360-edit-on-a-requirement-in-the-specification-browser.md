---
id: ITM-360
title: Edit and + Requirement in the specification browser
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
  - UC-018 step 1, 3d
---
# ITM-360 Edit and + Requirement in the specification browser

**REGISTER**

## Outcome

In MOD-trace-pages' specification view, as its file states it, on the default branch only: *Edit* beside each
requirement, leading to the review pages' `requirement/<name>/edit` (ITM-359), and *+ Requirement* in each section,
which opens `requirements/new` for that section (UC-018 3d). *Change by prompt* (ITM-399) and *Arrange* (UC-021) are not
part of this item.

## Acceptance

- Unit tests that name MOD-trace-pages state, before the code exists: *Edit* beside each requirement and *+ Requirement*
  in each section on the default branch, neither on a tag; each leading to its route with the requirement or the
  section.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.
