---
id: ITM-869
title: A token stored on the setup page is used by the next page
level: unit
realises:
  - UC-042
modules:
  - MOD-site-frame
builds_on:
  - ITM-860
tests:
  - unit
origin:
  - ITM-860's pull request #823 (sprint team1/81), from developer-sonnet-a's findings
---
# ITM-869 A token stored on the setup page is used by the next page

**REGISTER**

## Outcome

On *Finish setting up* (`src/settings-pages/setup.mjs:101`) a token is stored. MOD-site-frame's `startSite` connects
`instance.host` once (`src/site-frame/index.mjs:216`) and hands it to every route. Measured with an uncommitted probe, the
next page opened without a reload, `#settings`, sends its three instance requests with no authorisation.

The frame's instance host follows the stored token, as ITM-854's `instanceHostFollowingToken` does for the notifications, and
with the stored secrets. A test stores the token on `#setup` and opens a next page without a reload.

## Acceptance

- After a token is stored on *Finish setting up*, the next page's instance requests carry it, and the test pins it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
