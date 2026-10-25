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
built_by:
  - b55367bc349a81a576b6f1cdcede4796e33f021c
  - a32729088da45552c449c21a526f4d2eac617ef7
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

**Read at sprint team1/93 (developer-sonnet-b): built.** `a3272908` built it ("Team2 sprint43 ITM-354 participant product
use"), with `productUseFor`, `renderProductUse` and `updateProductUse` in `src/settings-pages/participants.mjs`. TST-354001
and TST-354002 in `tests/settings-pages-participants.test.mjs` check each Acceptance line and pass unchanged. It is done.

**Done (sprint team2/98, po-opus-b):** read against its Acceptance on `main` at `3436203a`: TST-354001 and TST-354002 (`tests/settings-pages-participants.test.mjs`) pass on `main`; built by `a3272908`. No pull request names it, since it predates the pull-request flow or was built by another item. No code changes.
