---
id: UC-002
title: Name the export
area: 1 export
actors:
  - Author
realises:
  - EVERY EXPORT HAS A NAME
---
# UC-002 Name the export

## Actors

- **Author** — names the export.

## Precondition

- An export is about to be written.

## Main flow

1. The author types a name.

```mermaid
sequenceDiagram
    actor A as Author
    A->>A: Name
```

## Alternative flows

- **1a. The name is empty.** The export is not written.

## Postcondition

- The export carries the name.
