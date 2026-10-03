---
id: UC-003
title: Withdraw an entry
actors:
  - Author
realises:
  - AN ENTRY IS NEVER DELETED
---
# UC-003 Withdraw an entry

## Actors

- **Author** — withdraws an entry they added.

## Precondition

- The entry exists.

## Main flow

1. The author presses **Withdraw** on the entry.
2. The list marks the entry as withdrawn; its link keeps working.

```mermaid
sequenceDiagram
    actor A as Author
    participant D as Dashboard
    A->>D: Withdraw
    D-->>A: the entry, marked withdrawn
```

## Alternative flows

- **1a. The entry is already withdrawn.** Nothing changes.

## Postcondition

- The entry is marked withdrawn and still reachable.
