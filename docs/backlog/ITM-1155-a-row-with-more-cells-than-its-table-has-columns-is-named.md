---
id: ITM-1155
title: A row with more cells than its table has columns is named
level: module
realises:
  - A DATA FORMAT IS DEFINED ONCE
modules:
  - MOD-documents
builds_on:
  - ITM-1143
tests:
  - unit
origin:
  - ITM-1143's Acceptance (sprint team1/97), checked by developer-sonnet-c on pull request #1200
---
# ITM-1155 A row with more cells than its table has columns is named

**REGISTER**

## Outcome

ITM-1143's Acceptance asked whether a row with more cells than its table has columns gives a finding, and made it a new
item where it does not. developer-sonnet-c checked it on #1200: it gives none. The extra cell is dropped without a word
(`cellsOf`, `src/documents/checks.mjs`).

**First task:** read what MOD-documents' text says of a row's cells. Where it names no finding for a cell the header does
not name, the item stops for a draft.

## Acceptance

- A register row with one cell more than its header names gives a finding at that row, naming the cell. Counter-proof:
  a row with exactly the header's cells gives none.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Stopped at its first task (sprint team1/97, developer-sonnet-c):** MOD-documents' text says nothing of a cell beyond
the last column (:168, :248, :275). The draft of MOD-documents.md, by developer-sonnet-c, adds it to the findings at
:275, and is on `main` as `09e796d8`. The item waits for its acceptance.
