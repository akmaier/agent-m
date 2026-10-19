---
id: ITM-863
title: The notification checks stop using a product's cleared token
level: module
realises:
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-notifications
  - MOD-site-frame
builds_on:
  - ITM-854
tests:
  - unit
origin:
  - ITM-854's pull request #818 (sprint team1/80), from developer-sonnet-c's findings
---
# ITM-863 The notification checks stop using a product's cleared token

**REGISTER**

## Outcome

MOD-notifications' checks keep each product's host for the page's life (`src/notifications/checks.mjs:86-87`). Its
`connectProduct` reads the token once. Measured on ITM-854's head with a probe, a product's check request carries the
product's token before and after the product is removed.

At the start, a test of a product with its own token decides it: no check after the removal carries the token. The fix may
need `watchForAcceptance` to take a host that follows the store, as ITM-854 gives the instance's. If MOD-notifications' text
does not allow that, a draft for akmaier comes first.

## Acceptance

- After a product's token is cleared or the product is removed, no notification check carries that token, and the test
  pins it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft for akmaier is on `main`** (sprint team1/92, written by developer-sonnet-c). `watchForAcceptance` is given
`productHost`, and MOD-site-frame's `startPage` connects each product's host as it connects the instance's: through the
token and the stored secrets this browser holds at each call (`A CLEAR IS A REAL CLEAR`). MOD-notifications no longer
connects hosts itself, and the frame keeps the rule once. The item now also changes MOD-site-frame, and it waits for the
acceptance.

