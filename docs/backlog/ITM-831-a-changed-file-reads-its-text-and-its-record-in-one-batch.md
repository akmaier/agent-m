---
id: ITM-831
title: A changed file reads its text and its record in one batch
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-approvals
builds_on:
  - ITM-652
tests:
  - unit
origin:
  - ITM-710's draft stop (sprint team1/76), from developer-sonnet-d's draft and count
---
# ITM-831 A changed file reads its text and its record in one batch

**REGISTER**

## Outcome

On a changed file's page, `lastAcceptedText` reads the file and its approval record's text as two single reads. Batching
them needs the record's path from MOD-approvals, and no interface gives it. So a draft of `MOD-approvals.md` for akmaier
comes first. The lead was seen in fixtures only, and the start counts it at this repository's size.

## Acceptance

- The accepted draft's interface is built, and a changed file's page reads the two in one batch, counted by a test.
