---
id: ITM-354
title: A change to a participant that products use
level: module
realises:
  - UC-017
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
  - PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
modules:
  - MOD-settings-pages
builds_on:
  - ITM-352
tests:
  - unit
origin:
  - UC-017 7a
---
# ITM-354 A change to a participant that products use

**REGISTER**

## Outcome

On the participants page (ITM-352), before a changed participant is saved: the products of this browser's list whose
role assignments name it, with their roles; a capability removed that a role needs shown, through MOD-product-process'
`roleAssignmentFindings`, as the assignments it makes invalid until they are reassigned. Nothing in a product changes.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, with two fixture products: the products and
  roles that name the participant listed; *write to the repository* removed from a Developer showing that assignment
  invalid and naming the capability; a participant no product uses saved without the list.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
