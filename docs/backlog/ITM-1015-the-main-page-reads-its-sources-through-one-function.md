---
id: ITM-1015
title: The main page's cards and its list of jobs read the kept products through one function
level: unit
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-main-page
builds_on:
tests:
  - unit
origin:
  - the MOD-main-page Parts draft (sprint team1/93), from developer-sonnet-a's reading
---
# ITM-1015 The main page's cards and its list of jobs read the kept products through one function

**REGISTER**

## Outcome

`src/main-page/home.mjs:32-45` keeps a private `sourcesOf`, and `jobs.mjs:26` exports another. They differ in the instance,
the fields and the fragment, but share one rule: the kept products, once each, parsed, connected through
`chosenProduct`, a failure turned into `{ address, reason }`. Nothing keeps the two copies equal.

**First task:** draft MOD-main-page's Parts for one function of `jobs.mjs` that takes the route's name, with the cards
adding their own fields.

## Acceptance

- The kept products are read by one function of the module, and the cards and the list draw what they drew before. No
  expected result changes. It is declared as refactoring: CI is green on every commit.
