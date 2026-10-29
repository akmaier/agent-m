---
id: ITM-1293
title: The move form checks builds_on against the backlog
level: module
realises:
  - UC-033
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-1257
tests:
  - unit
origin:
  - developer-sonnet-l's release tests of ITM-1257 (PR #1394), open question 4, ruled by po-opus-c in docs/backlog/sprints/team1/111.md
---
# ITM-1293 The move form checks builds_on against the backlog

**REGISTER**

## Outcome

The issue page's move form checks the drafted item with `backlogFindings([live], architecture)`
(`src/maintenance-pages/issues.mjs`), the item alone, so a `builds_on` that names an existing item of the backlog, such
as ITM-0900 in the test world, is reported as an item that does not exist and withholds *Move*. MOD-maintenance-pages.md:202
uses `backlogFindings` for "the item's marks while the person edits it": the marks are found with the backlog's items
beside the drafted one, so a named item that the backlog holds gives no mark.

## Acceptance

- A unit case types an existing item into `builds_on` and finds no mark, and types an item the backlog lacks and finds
  one; the first fails on the code as it stands.
- Only `src/maintenance-pages/` and its tests change.
