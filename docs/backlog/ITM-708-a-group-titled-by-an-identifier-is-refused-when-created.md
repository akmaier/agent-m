---
id: ITM-708
title: A group titled by an identifier is refused when created
level: unit
realises:
  - A GROUP CARRIES NO IDENTIFIER
modules:
  - MOD-group-document
builds_on:
  - ITM-695
tests:
  - unit
origin:
  - ITM-695's gate on pull request #726 (sprint team1/72), from developer point 1
---
# ITM-708 A group titled by an identifier is refused when created

**REGISTER**

## Outcome

`docs/architecture/MOD-group-document.md` says that `applyMoves` refuses a move that would "create a group whose title
is an identifier". `src/group-document/moves.mjs:40` (`titleOf`) gives that refusal, but no test drives it, neither on
ITM-695's head `b2e2e371` nor on the base. Every `create` in `tests/test_groups.py` names a title that is no identifier.

A test in `tests/test_groups.py` creates a group titled `UC-007` and asserts the refusal and its reason. The tree it is
given stays as it was.

## Acceptance

- A `create` titled by an identifier is refused, with the reason `"UC-007" is an identifier, and a group carries none`.
  The resulting file text is the canonical text it was given.
- Its counter-proof: the line removed from `titleOf` makes the test fail.
