---
id: MOD-export
title: Writes the list as a file
realises:
  - EXPORT AS CSV
  - EVERY EXPORT HAS A NAME
follows:
  - ARC-001
uses: []
provides:
  - exportList
---
# MOD-export Writes the list as a file

## Responsibility

Kernel. Turns the list into the text of a file.

## Interfaces

- `exportList(list, name) -> text` — the CSV text of the list.
