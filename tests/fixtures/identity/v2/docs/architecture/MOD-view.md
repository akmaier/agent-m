---
id: MOD-view
title: Shows the status of every file
realises:
  - THE STATUS IS SHOWN
  - EVERY FILE HAS A STATUS
  - UC-002
follows:
  - ARC-001
uses:
  - MOD-reader.readFile
provides:
  - showStatus
---
# MOD-view Shows the status of every file

## Responsibility

Shows the status of every file read.

## Interfaces

- `showStatus(files) -> html` — one row per file.
