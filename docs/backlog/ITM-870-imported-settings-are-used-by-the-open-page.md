---
id: ITM-870
title: Imported settings are used by the open page
level: unit
realises:
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-settings-pages
builds_on:
  - ITM-868
tests:
  - unit
origin:
  - ITM-860's pull request #823 (sprint team1/81), from developer-sonnet-a's findings
---
# ITM-870 Imported settings are used by the open page

**REGISTER**

## Outcome

*Import settings* (`src/settings-pages/settings.mjs:393`) stores tokens without reconnecting the page's hosts, the lead
ITM-825, ITM-853 and ITM-860 closed for the other paths. This lead is not measured. At the start, a test imports a file with
a new token and lets the page read without a reload. It shows whether the imported token is used.

## Acceptance

- After an import, the open page's requests carry the imported tokens, and the test pins it.
- The first commit holds only the tests, and CI is red on it if the lead holds. No stub is committed.

**Noted at ITM-869's gate (sprint team1/83, 2026-10-18, po-opus).** Since ITM-869, the frame's
instance host connects with the token stored at each call. A GitLab-form token imported under `github-token` would then
make `connect` throw inside a host call, not at start. The import is checked for that at this item's start.
