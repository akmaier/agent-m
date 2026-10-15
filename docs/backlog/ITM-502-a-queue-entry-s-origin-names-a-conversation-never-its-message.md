---
id: ITM-502
title: A queue entry's origin names a conversation, never its message
level: module
realises:
  - UC-019
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-spec-changes
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-spec-changes, Data: `NN-<slug>.begruendung.md`
---
# ITM-502 A queue entry's origin names a conversation, never its message

**REGISTER**

## Outcome

The rationale of a drafted queue entry names as its origin a conversation in the prompt bar on the page it names, never
a message of it.

## Acceptance

- A drafted entry's rationale holds the page and no instruction; a counter-proof plants the instruction and the test
  finds it.
