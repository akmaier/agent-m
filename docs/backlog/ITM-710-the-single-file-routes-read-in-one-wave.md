---
id: ITM-710
title: The single-file routes read in one wave
level: system
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-site-frame
builds_on:
  - ITM-574
tests:
  - unit
origin:
  - ITM-574's pull request #728 (sprint team1/72), from developer-sonnet-d's finding
---
# ITM-710 The single-file routes read in one wave

**REGISTER**

## Outcome

After ITM-574, the routes that show one artifact still read the files they show one by one: `#uc/<id>`, `#arc/<id>` and
`#review/…`. A request of one file meets "requests of at most 100 files each". The cost lies in the number of requests
spent from the person's token budget.

At the start, these are measured on this repository with a token, before and after (sprint 59's agreement):
- each route's requests;
- the modules whose views the routes call (sprint 57's agreement).

## Acceptance

- Each route reads its commit and tree once, and the files it shows in as few waves as the files they depend on allow.
- Its count is in `load-per-view.test.mjs`, with a counter-proof that reads each file by itself.
