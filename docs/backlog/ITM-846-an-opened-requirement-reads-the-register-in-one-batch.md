---
id: ITM-846
title: An opened requirement reads the register in one batch
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-trace-pages
builds_on:
  - ITM-833
tests:
  - unit
origin:
  - ITM-833's pull request #777 (sprint team1/77), from developer-sonnet-c's findings
---
# ITM-846 An opened requirement reads the register in one batch

**REGISTER**

## Outcome

MOD-trace-pages' `sourcesOf` (`src/trace-pages/flow.mjs`), for an opened requirement or a released version, reads
`docs/sources.md` and each register entry one by one with a token. ITM-833's developer batched it in a draft. That made
trace-pages-gaps' "the specification and the gaps share the graph of a version" (ITM-599-07) count two `readMany` calls
against one, since it counts every call. This item batches the reads and names that case's change at its tests-only
commit, with the reason.

## Acceptance

- An opened requirement reads the register in one batch, counted by a test, and the gaps case states what it counts.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
