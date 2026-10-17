---
id: ITM-664
title: UC-019's release test decides its conflict as a new requirement
level: system
realises:
  - UC-019
modules:
  - MOD-review-pages
  - MOD-spec-changes
builds_on:
tests:
  - release
origin:
  - ITM-636's gate on pull request #707 (docs/gates/20261017-0814-development-release-testing-4a9c.md)
---
# ITM-664 UC-019's release test decides its conflict as a new requirement

**REGISTER**

## Outcome

TST-418112 in `tests/release-uc-019-change-requirements-by-prompt.test.mjs` decides a conflict as a second `change` of
a requirement that another candidate already changes. ITM-636 makes `entrySections` refuse that (`TwoChanges`), so the
test's choice must become `new`.

ITM-636's implementer may not make that change: `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER` (SPEC.md:1471). So
a participant other than ITM-636's developer, developer-sonnet-a, changes the choice, in the pattern of ITM-645. With
`new`, the test passes on `sprint/team1/68` as it stands and on ITM-636's head, so it goes first and #707 drops its own
edit.

## Acceptance

- TST-418112 decides its conflict as `new`, and passes on `sprint/team1/68` as it stands and on ITM-636's head, with every other expected result unchanged.
- It is written by a participant other than developer-sonnet-a.
- Its counter-proof: the second `change` planted back fails it on ITM-636's head.
