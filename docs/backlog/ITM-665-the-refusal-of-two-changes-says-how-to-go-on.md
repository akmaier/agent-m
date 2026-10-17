---
id: ITM-665
title: The refusal of two changes says how to go on
level: module
realises:
  - UC-005
  - UC-019
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-review-pages
builds_on:
  - ITM-636
tests:
  - unit
origin:
  - ITM-636's gate on pull request #707 (docs/gates/20261017-0814-development-release-testing-4a9c.md), from developer-sonnet-a's finding
---
# ITM-665 The refusal of two changes says how to go on

**REGISTER**

## Outcome

Since ITM-636, a draft in which two candidates change one requirement is refused with `TwoChanges`. The panel names
the requirement and both candidates. Nothing tells the person what to do next: give one of them the class `new`, or
merge them. The panel's refusal text says so. It is the panel's own wording of a refusal it already shows, so no use
case changes.

## Acceptance

- The refusal of two changes of one requirement names it, both candidates, and that one of them can be made `new` or the two merged.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
