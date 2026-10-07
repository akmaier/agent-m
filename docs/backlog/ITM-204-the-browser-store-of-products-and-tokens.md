---
id: ITM-204
title: The browser's store of products and tokens
level: module
realises:
  - UC-047
  - UC-001
  - THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER
  - CONFIGURATION LIVES IN THE BROWSER
  - CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-browser-store
builds_on:
tests:
  - unit
origin:
  - UC-001
---
# ITM-204 The browser's store of products and tokens

**REGISTER**

## Outcome

MOD-browser-store's interface, as its file states it, for what UC-001 keeps in the browser: `openStore`, `readSetting`,
`writeSetting` and `clearSetting`, over the catalogue's keys for the instance's GitHub token with its expiry, a GitHub
product's own token, the GitLab project tokens and the list of products — and, for UC-047, `notifications` and `notified` —, in `src/browser-store/`, with the prefix and the values the module's file
states.

## Acceptance

- Unit tests that name MOD-browser-store state, before the code exists, what the module's file says of these four
  functions for these keys: the values kept in `localStorage` and in no cookie, a cleared key gone from the storage itself,
  and `StorageUnavailable` when the storage cannot be used.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests of the store stay green, with no expected result changed.
- Only `src/browser-store/` and the tests that name MOD-browser-store change.
