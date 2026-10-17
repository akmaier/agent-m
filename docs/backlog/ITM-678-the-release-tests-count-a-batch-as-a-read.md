---
id: ITM-678
title: The release tests count a batch as a read
level: system
realises:
  - UC-006
  - UC-020
modules:
  - MOD-spec-changes
  - MOD-trace-pages
builds_on:
tests:
  - release
origin:
  - ITM-648's stop at its rework's draft run (sprint team1/69), from developer-sonnet-d's draft
---
# ITM-678 The release tests count a batch as a read

**REGISTER**

## Outcome

Once `queues` reads in batches (ITM-677), these release tests see a `POST /graphql` and two more requests:
- TST-472516 and 472518 (`tests/release-sprint-14-spec-overview-readonly.test.mjs`,
  `tests/release-sprint-15-spec-toggles.test.mjs`), whose `writes()` counts any non-GET as a write;
- TST-479201 and 479202 (`tests/release-uc-006-batched-reads.test.mjs`), which pin 14 requests.

A batch reads; it writes nothing. So `writes()` leaves out the GraphQL read, and the counts follow the batch. A
participant who builds none of ITM-677 changes them, in the pattern of ITM-645 and ITM-664, so that they pass on the base
and on ITM-677's head. Which of their expected values must move, and that none of them hides a write, is read at the start
against ITM-677's draft.

## Acceptance

- The four release tests pass on the base and on ITM-677's head, a batch counted as a read and no write left out.
- They are written by a participant who builds none of ITM-677.
- Its counter-proof: a real write planted in a page fails `writes()`.
