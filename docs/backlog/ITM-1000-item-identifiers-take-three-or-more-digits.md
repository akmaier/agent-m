---
id: ITM-1000
title: Item identifiers take three or more digits
level: module
realises:
  - EVERY ARTIFACT HAS AN IDENTIFIER
modules:
  - MOD-work-plans
builds_on: []
tests:
  - unit
origin:
  - the plan "Item identifiers with four digits" in docs/backlog/sprints/team2/94.md, by po-opus-b, 2026-10-18
  - akmaier's decision of 2026-10-18 ("Sure, they can have more digits"), accepted in MOD-identifiers' Data, which reads "`ITM-<nnn>`, three or more digits"
---
# ITM-1000 Item identifiers take three or more digits

**REGISTER**

## Outcome

MOD-identifiers' Data lets `ITM` take three or more digits. Team 1 took ITM-995 to ITM-999, so no three-digit number is
left. An item `docs/backlog/ITM-1000-*.md` today fails four of MOD-work-plans' taken-over checks: the item file name, the
item read without a problem and the build order in `tests/test_backlog_layout.py`, and the item that names what it
realises in `tests/test_backlog_item_fields.py`. They read through `docs/assets/work-items.mjs`, whose `ITEM_PATH` and
`ITEM_ID` take `ITM-\d{3}` (:29-30), and the build order sorts the identifiers as text, so `ITM-1000` comes before
`ITM-203`.

This item makes MOD-work-plans' taken-over reader and checks take `ITM-<nnn>` with three or more digits, and orders items by
their number, so that ITM-1000 follows ITM-999. This item is the first item with four digits.

## Acceptance

- `docs/assets/work-items.mjs` and `docs/assets/work-items/flow.mjs` take `ITM-<nnn>` with three or more digits, in the
  item file name, the item's id, a sprint's selection and the pull requests that hold a slot of the WIP limit.
- Items are ordered by their number: ITM-203, then ITM-999, then ITM-1000.
- `tests/test_backlog_layout.py`, `tests/test_backlog_item_fields.py`, `tests/test_time_box_selection.py` and
  `tests/parallel_sprints_fixture.py` take three or more digits.
- Counter-proofs: a three-digit item is still read; an `ITM-99` of two digits is still refused.
- The first commit holds only the tests and this item file, and CI is red on it.
- Only the files named above change. The other readers of the three-digit form are later items, one per module.
