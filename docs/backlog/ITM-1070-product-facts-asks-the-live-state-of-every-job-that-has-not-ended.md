---
id: ITM-1070
title: productFacts asks the live state of every job that has not ended, as its text says
level: module
realises:
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - ITM-940's pull request #993 (sprint team1/93), from developer-sonnet-b's finding
---
# ITM-1070 productFacts asks the live state of every job that has not ended, as its text says

**REGISTER**

## Outcome

MOD-progress-measures.md:152-165 has `productFacts` read, in the scopes `build` and `all`, "the live state of every job that
has not ended — from the CI service, from the Bridges given in `bridges` and from this tab, through MOD-runtimes'
`liveState`". No scope of `src/progress-measures/facts.mjs` asks it. The main page's `src/main-page/reread.mjs:41` asks the
live states itself.

**First task:** read which callers need the live states from `productFacts`. If none needs them, the item stops for a draft
for akmaier that takes them out of the text, so that they are asked in one place.

## Acceptance

- `productFacts` with the scope `all` or `build` gives each job that has not ended the state `liveState` answers, and the
  state its record gives where the runtime does not answer. A test shows both, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
