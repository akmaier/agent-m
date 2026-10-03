---
id: UC-001
title: Export the list
actors:
  - Author
realises:
  - THE LIST IS EXPORTED AS CSV
  - AN EXPORT NAMES ITS DATE
---
# UC-001 Export the list

## Actors

- **Author** — wants the list as a file.

## Precondition

- The list exists.

## Main flow

1. The author presses **Export**.
2. The dashboard writes a CSV file named with today's date.

```mermaid
sequenceDiagram
    actor A as Author
    participant D as Dashboard
    A->>D: Export
    D-->>A: list-<date>.csv
```

## Alternative flows

- **1a. The list is empty.** Nothing is written.

## Postcondition

- The file holds the list.
