---
id: MOD-reader
title: Reads files at a pinned commit
folder: src/reader/
realises:
  - RULE ONE
  - UC-001
follows:
  - ARC-001
uses:
provides:
  - readFile
  - listTree
---
# MOD-reader Reads files at a pinned commit

## Responsibility

Reads the product's files, all at one commit.

## Parts

- `index.mjs` — the interface.

## Data

It keeps nothing.

## Interfaces

- `readFile(path) -> text | null` — the exact text of one file at the pinned commit.
- `listTree() -> [path]` — every file path at the pinned commit.

## Files

It reads the product's files at the pinned commit.

## Uses

Nothing.
