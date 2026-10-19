---
id: ITM-957
title: The browser store knows the key not-an-issue
level: unit
realises:
  - A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
modules:
  - MOD-browser-store
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-h's finding at ITM-952's start, sprint team2/94
---
# ITM-957 The browser store knows the key not-an-issue

**REGISTER**

## Outcome

MOD-browser-store.md:75, accepted at its current blob: "| `not-an-issue` | the identifiers of mails marked *not an issue*
| no |". The catalogue in code does not hold it. `src/browser-store/catalogue.mjs:7` lists `github-token`, `products`,
`notifications`, `notified`, `bridge`, `jump-host` and `mailbox`, and `writeSetting` refuses every other key with
`UnknownSetting` (MOD-browser-store.md:108). The known positive: `mailbox` is written.

**Not independent of team 1.** MOD-settings-pages uses MOD-browser-store, and team 1's sprint 92 holds MOD-settings-pages.
So this item starts only once team 1's sprint 92 is merged, or when `conflicts` finds it free.

## Acceptance

- A unit test that names MOD-browser-store: `writeSetting(store, "not-an-issue", ["MAIL-0123456789abcdef"])` stores the
  list, and `readSetting` gives it back. It is no secret, so an export holds it.
- Counter-proof: without the key in the catalogue, the test fails with `UnknownSetting`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/browser-store/` and the tests that name MOD-browser-store change.
