---
id: MOD-review
title: Derives the status of reviewed files
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

## Interfaces

- `status(path) -> "open" | "accepted" | "changed"`
  — derived, never stored.
