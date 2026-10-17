---
id: ITM-808
title: The browser store names the tokens that expire soon
level: unit
realises:
  - A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
modules:
  - MOD-browser-store
builds_on:
tests:
  - unit
origin:
  - ITM-683's stop at its start's table (sprint team1/74), under sprint 73's agreement
---
# ITM-808 The browser store names the tokens that expire soon

**REGISTER**

## Outcome

MOD-browser-store states `expiringSoon(store: Store, now: Date) -> { key: SettingKey, expires: string }[]`: "every stored
token whose recorded expiry is within fourteen days of `now`, or past" (`docs/architecture/MOD-browser-store.md:130`).
`src/browser-store/index.mjs:5` says it is not built. The live banner computes the rule today in
`docs/assets/dashboard/settings-view.mjs:132` (`expiryWarning`), a file that belongs to no module, and ITM-683 removes
that file.

So the rule is built where its module's text states it, before ITM-683 calls it. Sprint 73's agreement reads: "A page
that no interface draws becomes its own item first". It reads no repository and makes no request.

## Acceptance

- `expiringSoon` lists every stored token, of the instance and of each product, whose recorded expiry is within
  fourteen days of `now` or past, and no other. Tests pin the bounds: 14 days, 15 days, past, and a token with no
  recorded expiry.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
