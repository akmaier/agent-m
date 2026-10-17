---
id: ITM-832
title: The module addresses read ahead like the others
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-site-frame
builds_on:
  - ITM-710
tests:
  - unit
origin:
  - ITM-710's draft stop (sprint team1/76), from developer-sonnet-d's draft and count
---
# ITM-832 The module addresses read ahead like the others

**REGISTER**

## Outcome

The app's `route()` skips `readAhead` for an address with a second part. MOD-review-pages' own addresses, `#module`,
`#decision` and `#use-case`, which the notifications link to, read each file by itself. At the start they are counted at
this repository's size. Those that read more than one file then read ahead, as `#uc` and `#arc` do.

## Acceptance

- Each such address reads its files in as few waves as their dependencies allow, counted in `load-per-view.test.mjs`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
