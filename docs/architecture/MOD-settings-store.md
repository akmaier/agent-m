---
id: MOD-settings-store
title: Keeps the browser's settings — the only module that touches browser storage
realises:
  - CONFIGURATION LIVES IN THE BROWSER
  - CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
  - A CLEAR IS A REAL CLEAR
  - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
  - AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
  - THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
  - NO SECRET IN THE REPOSITORY
  - UC-042
follows:
  - ARC-003
  - ARC-005
uses: []
provides:
  - browserStore
  - settingKeys
  - exportSettings
  - readSettingsFile
  - mergeSettings
---
# MOD-settings-store Keeps the browser's settings — the only module that touches browser storage

## Responsibility

The store layer of the browser (ARC-005). Every setting kept in the browser is a named key here;
nothing else in the dashboard reads or writes `localStorage`, and there is no cookie.

**Current state.** `docs/assets/settings-store.mjs` (`createStore`, `browserStore`, `KEYS`) is this
module. From `review-core.mjs` it takes `BROWSER_SETTINGS` (as `settingKeys`), `exportSettings`,
`readSettingsFile`, `mergeSettings`, `SETTINGS_FORMAT`, `PBKDF2_ITERATIONS`. Keys for endpoints, the
bridge and the mailbox do not exist yet.

## Interfaces

- `browserStore() -> store` — getters, setters and clears for every named key under the prefix `agent-m.` (GitHub token and expiry, products, GitLab project tokens, endpoints and keys, bridge address and token, mailbox connection, mails marked *not an issue*, jump host, remote sessions); `clear()` removes exactly the `agent-m.` keys; in a private window it behaves as an empty store.
- `settingKeys -> [{ key, label, secret, grants }]` — every key the store writes, with what a secret grants; the settings page and the export notice are built from it, and a test checks the page shows each.
- `exportSettings(entries, { passphrase, now }) -> text` — one JSON file `agent-m-settings` v1; with a passphrase, PBKDF2-SHA-256 (600 000 iterations, random salt) and AES-GCM (random IV) through Web Crypto, salt and IV stored beside the ciphertext.
- `readSettingsFile(text, passphrase) -> entries` — a locked file without or with a wrong passphrase reads nothing and says which.
- `mergeSettings(current, incoming) -> { put, added, kept, ignored }` — keeps what the browser has, adds only what is missing, lists both.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
