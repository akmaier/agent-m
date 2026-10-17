---
id: ITM-841
title: The model catalogue is read in one batch
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-model-catalogue
builds_on:
tests:
  - unit
origin:
  - ITM-826's draft stop (sprint team1/77), from developer-sonnet-e's count
---
# ITM-841 The model catalogue is read in one batch

**REGISTER**

## Outcome

`MOD-model-catalogue`'s `catalogue` reads its files one by one (`src/model-catalogue/index.mjs:213`). On this repository
that is one request, but it grows with every model the catalogue holds. `productFacts` calls it in both scopes. It reads
them through `Snapshot.readMany`, if MOD-model-catalogue's Uses name it. Otherwise it stops for a draft. The start counts
it at a catalogue of ten models.

## Acceptance

- `catalogue` reads its files in batches of a hundred with a token, and a committed test counts it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
