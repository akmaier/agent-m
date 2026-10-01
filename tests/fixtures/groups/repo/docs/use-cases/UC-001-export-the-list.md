---
id: UC-001
title: Export the list
area: 1 export
actors:
  - Author
realises:
  - EXPORT AS CSV
---
# UC-001 Export the list

## Actors

- **Author** — exports the list.

## Precondition

- The list exists.

## Main flow

1. The author presses **Export**.

```mermaid
sequenceDiagram
    actor A as Author
    A->>A: Export
```

## Alternative flows

- **1a. The list is empty.** Nothing is exported.

## Postcondition

- The file exists.
