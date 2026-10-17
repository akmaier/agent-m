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
