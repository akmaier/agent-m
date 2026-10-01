---
id: MOD-reader
title: Reads a file whole
realises:
  - A FILE IS READ WHOLE
  - UC-001
follows:
  - ARC-001
uses: []
provides:
  - readFile
---
# MOD-reader Reads a file whole

## Responsibility

Reads a file from its first byte to its last.

## Interfaces

- `readFile(text) -> text` — the whole text.
