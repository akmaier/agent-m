---
id: ITM-1098
title: MOD-settings-pages' text names the role assignments its participants page reads
level: module
realises:
  - UC-017
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - the review of ITM-1096's draft (architecture-reviewer-opus-b), on main at 1c46340b
built_by:
  - 87d440a2868674b297093ec97cd8268ff16e0594
---
# ITM-1098 MOD-settings-pages' text names the role assignments its participants page reads

**REGISTER**

## Outcome

`src/settings-pages/participants.mjs:14` and `:291` use MOD-product-process' `roleAssignmentSchema` and `roleAssignmentFindings`.
MOD-settings-pages' text names neither (`uses:` and Uses). Its line "the products and roles that use a participant" rests on
the role assignments, since the declaration names roles, never participants.

## Not ready: a draft for akmaier

The draft adds `MOD-product-process.roleAssignmentSchema` and `roleAssignmentFindings` to MOD-settings-pages' `uses:` and to its
Uses line. If the code uses them for something no use case asks, the draft says so instead.

## Acceptance

- Once the draft is accepted, the architecture check finds no use of MOD-settings-pages' code that its text does not name,
  for these two.

**The draft is on `main` as `87d440a2`** (MOD-settings-pages), written in sprint team1/98. The item is built once it is accepted.

**Done (sprint team1/98, po-opus):** akmaier accepted the draft (`614f164b`), and the accepted blob is the draft's. No code changes.
