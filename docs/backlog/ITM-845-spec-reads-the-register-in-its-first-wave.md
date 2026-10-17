---
id: ITM-845
title: #spec reads the register in its first wave
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-site-frame
builds_on:
  - ITM-833
tests:
  - unit
origin:
  - ITM-833's pull request #777 (sprint team1/77), from developer-sonnet-c's findings
---
# ITM-845 #spec reads the register in its first wave

**REGISTER**

## Outcome

After ITM-833, `#spec` makes 7 requests with a token at this repository's size: commit, tree, two batches, repository,
tags, and one batch of the links file and the register. The frame's `readAhead("spec")` could name `docs/sources.md` and
the register's entries in its first wave, saving one request. This lead is not measured. The start counts `#spec` before
and after, and changes `readAhead` only if the count falls.

## Acceptance

- `#spec`'s count with a token falls by the batch, and `load-per-view.test.mjs` pins it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Stopped at its draft (sprint team1/78, 2026-10-17, po-opus): it waits.**
- The draft takes `#spec` from 7 requests to 6 with a token. But it changes TST-833201, whose test names MOD-trace-pages.
  That module's file uses MOD-test-schedule, so holding it would hold back team 2's ITM-745 (`78.md`).
- The draft also writes the register's path pattern a second time. `personsSource` keeps it in
  `src/trace-pages/subject.mjs:38`, and AGENTS.md §2 reads "Nothing twice".
- At its next start, the frame takes the register's paths from an interface its Uses name, or a draft gives it one. The
  test of MOD-trace-pages then changes in the same sprint, with that module free.
- load-per-view gains a fixture with the register present (sprint 77's agreement).
