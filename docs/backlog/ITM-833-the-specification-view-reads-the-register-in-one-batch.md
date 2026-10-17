---
id: ITM-833
title: The specification view reads the register in one batch
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-trace-pages
builds_on:
tests:
  - unit
origin:
  - ITM-710's draft stop (sprint team1/76), from developer-sonnet-d's draft and count
---
# ITM-833 The specification view reads the register in one batch

**REGISTER**

## Outcome

On `#spec`, MOD-trace-pages' specification view reads `docs/sources.md` and two SRC files as three single reads. They are
read together through `Snapshot.readMany`, which is in MOD-trace-pages' Uses. The start counts `#spec` before and after.

## Acceptance

- `#spec` reads the register's files in one batch, counted by a test, and no other count rises.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
