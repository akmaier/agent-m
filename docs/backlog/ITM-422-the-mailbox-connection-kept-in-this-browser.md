---
id: ITM-422
title: The mailbox connection kept in this browser
level: module
realises:
  - UC-037
  - CONFIGURATION LIVES IN THE BROWSER
  - CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
  - A CLEAR IS A REAL CLEAR
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
  - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
modules:
  - MOD-browser-store
builds_on:
tests:
  - unit
origin:
  - UC-037 steps 3, 7, 8a, 1a
---
# ITM-422 The mailbox connection kept in this browser

**REGISTER**

## Outcome

MOD-browser-store, as its file states it: the key `mailbox` — the connection's fields as MOD-mail-routes defines them,
its password a secret —, and the mailbox's sign-in: the keys Microsoft's sign-in library writes for its token cache
under its own names (ARC-053), found by the client identifier the `mailbox` entry names and by the library's key names.
`listSettings` lists both, the sign-in as the mailbox's, and returns no secret; `clearSetting` of `mailbox` also removes
the library's keys for that connection, and `clearEverything` removes them with every other entry; `exportSettings` and
`importSettings` carry both. The page writes the connection (ITM-427).

## Acceptance

- Unit tests that name MOD-browser-store state, before the code exists, on a fake `localStorage` that holds a fixture of
  the library's keys: a stored IMAP connection listed, its password a secret; a Microsoft connection's sign-in keys
  listed as the mailbox's sign-in; clearing `mailbox` removing the connection and those keys and nothing of another
  instance; an export and an import carrying both; no cookie set and nothing in an address.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/browser-store/` and the tests that name MOD-browser-store change.
