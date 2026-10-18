---
id: ITM-929
title: The time of an acceptance is read without the commit's changes
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-approvals
builds_on:
  - ITM-916
tests:
  - unit
origin:
  - developer-sonnet-c's finding on ITM-916's pull request #898 (sprint team1/90)
---
# ITM-929 The time of an acceptance is read without the commit's changes

**REGISTER**

## Outcome

**A lead, not measured.** `src/approvals/status.mjs:137` calls `readHistory(path, { ref: head.commit, limit: 1 })` for each
record to learn the commit that added it and its date. It uses `adding.commit` and `adding.date`, not `.changes`. Without
`changes: false`, each call also reads that commit's changes, one request more per record, since ITM-916 made the option
work on GitHub.

**First task:** count the requests of the function that calls it, on a fixture, with and without the option. If nothing is
saved, the item stops.

## Acceptance

- The call passes `changes: false`, and the count of requests falls by one per record read. A test pins it, with a
  counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
