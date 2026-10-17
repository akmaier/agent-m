---
id: ITM-856
title: The chosen product says whether a token is stored
level: unit
realises:
  - UC-046
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-847's draft stop (sprint team1/79), from developer-sonnet-e's findings
---
# ITM-856 The chosen product says whether a token is stored

**REGISTER**

## Outcome

MOD-site-frame's file says `chosenProduct` gives `tokenStored`. `src/site-frame/routing.mjs:66` returns only `{ address, kind,
host }`. So ITM-847's `home` tells a card with a token through MOD-main-page's own `tokenKeyOf` over the store, a second
reading of what the frame is to give. This item builds `tokenStored` as the frame's file states it. MOD-main-page then reads
it there, and its own copy goes.

## Acceptance

- `chosenProduct` gives `tokenStored`, with a test, and no module reads the store for it a second time.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
