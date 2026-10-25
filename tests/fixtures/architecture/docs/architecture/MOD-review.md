---
id: MOD-review
title: Derives the status of reviewed files
folder: src/review/
realises:
  - THE READER'S RULE
  - UC-002
follows:
  - ARC-001
uses:
  - MOD-reader.readFile
  - MOD-reader.listTree
  - MOD-store.load
provides:
  - status
---
# MOD-review Derives the status of reviewed files

## Responsibility

Derives open, accepted or changed from the approval records.

## Parts

- `index.mjs` — the interface.

## Data

It keeps nothing: the status is derived.

## Interfaces

- `status(path) -> "open" | "accepted" | "changed"`
  — derived, never stored.

## Files

It reads the approval records.

## Uses

- `MOD-reader.readFile` and `MOD-reader.listTree` — the files and the records.
- `MOD-store.load` — what was stored.
