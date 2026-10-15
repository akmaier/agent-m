---
id: ITM-482
title: A browser tab keeps values of its own
level: module
realises:
  - UC-049
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
  - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
modules:
  - MOD-browser-store
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-browser-store, Interfaces: readTabValue, writeTabValue
---
# ITM-482 A browser tab keeps values of its own

**REGISTER**

## Outcome

MOD-browser-store keeps what lives only as long as one browser tab — the conversation of the prompt bar — in that
tab's `sessionStorage`, under the instance's prefix, with `readTabValue` and `writeTabValue`, as its module file states.
A tab value is no setting: `listSettings`, `exportSettings` and `importSettings` never carry it.

## Acceptance

- A value written in one tab is read back in it, removed by `null`, and not read by another tab's store.
- An export and the list of settings hold no tab value; an import writes none.
- `StorageUnavailable` is thrown where `sessionStorage` cannot be used.
