---
id: ITM-245
title: The system and release tests of UC-001 on the add-product view
level: system
realises:
  - UC-001
modules:
  - MOD-settings-pages
  - MOD-browser-store
  - MOD-repository-hosts
  - MOD-artifact-edits
builds_on:
  - ITM-207
  - ITM-273
tests:
  - system
  - release
origin:
  - UC-001
---
# ITM-245 The system and release tests of UC-001 on the add-product view

**REGISTER**

## Outcome

UC-001 checked as a whole through the dashboard's *+ Add product* once ITM-207 and the change between jobs after it are
merged: the dashboard then shows MOD-settings-pages' view `add-product` and keeps its product list and the products'
tokens through MOD-browser-store. That change removes `docs/assets/settings-store.mjs`'s own entries of them together with
the tests of them (`WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`), among them ITM-208's system test of UC-001 and sprint
04's release tests of UC-001, which seed and read those entries. In their place: a system test that walks UC-001's main
flow and each of its alternative flows through that view, with GitHub and a GitLab server replaced by fixture servers, and
release tests, one or more for each requirement UC-001 realises. They are written by a Developer who implemented none of
ITM-204 to ITM-207, ITM-211 nor that change (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-001 realises has a release test, and the system test walks the main flow and each alternative
  flow; each test states its input, precondition and expected result where they can be read without running it, and
  names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the view and UC-001 disagree, the test follows UC-001 and the disagreement is named as a finding.
- Only new test files change.
