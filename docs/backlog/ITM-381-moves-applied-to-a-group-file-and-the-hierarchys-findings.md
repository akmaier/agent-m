---
id: ITM-381
title: Moves applied to a group file, and the hierarchy's findings
level: module
realises:
  - UC-021
  - AN ITEM HAS ONE PLACE IN ITS HIERARCHY
  - A GROUP CARRIES NO IDENTIFIER
  - A GROUP HOLDS ONE KIND OF ARTIFACT
  - REGROUPING LEAVES THE GROUPED FILE UNCHANGED
modules:
  - MOD-group-document
builds_on:
  - ITM-300
tests:
  - unit
origin:
  - UC-021 steps 2 and 3, 1b, 2a, 2b, 3a, 3c
---
# ITM-381 Moves applied to a group file, and the hierarchy's findings

**REGISTER**

## Outcome

MOD-group-document's `GroupMove`, `applyMoves(tree, moves)` and `hierarchy(tree, items)`, as its file states them, in
its part `hierarchy.mjs`: the moves applied in order to a new tree, the given one unchanged; a move that would put an
item of another kind into the tree, delete a group that is not empty, create a group titled by an identifier or name a
group that does not exist refused with its reason; no move deletes an item or renames an identifier. `hierarchy` gives
an error for a member named twice and for a group titled by an identifier, and lists a member that matches no item as
unknown. The check `group-rules` (ITM-388) calls both; `groupFileText` and the arrangement page (UC-021) are not part of
this item.

## Acceptance

- Unit tests that name MOD-group-document state, before the code exists, on the example group file: each kind of move
  applied; each refusal with its reason; the given tree unchanged; a member twice, a group titled by an identifier and
  an unknown member as `hierarchy` reports them.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/group-document/` and the tests that name MOD-group-document change.
