---
id: ARC-005
title: Browser storage only through the settings store; export and import locked with Web Crypto (PBKDF2, AES-GCM)
forced_by:
  - CONFIGURATION LIVES IN THE BROWSER
  - CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
  - A CLEAR IS A REAL CLEAR
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
  - AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
  - AN EXPORT STATES THAT IT CONTAINS SECRETS
  - NO SECRET IN THE REPOSITORY
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
  - UC-042
---
# ARC-005 Browser storage only through the settings store

## Context

Every credential of a reader — GitHub token, GitLab project tokens, model keys, bridge tokens,
mailbox password or sign-in token — lives in the browser and nowhere else (`CONFIGURATION LIVES IN
THE BROWSER`), in `localStorage`, never in a cookie. Clearing must remove the stored value, not only
the form (`A CLEAR IS A REAL CLEAR`); every stored key must have its place on one settings page
(`EVERY SETTING IS REACHED FROM ONE PAGE`). A reader moves between browsers with an export that
contains the secrets and may be locked with a passphrase.

The current `settings-store.mjs` is already the only module that touches `localStorage`; all keys
carry the prefix `agent-m.`; `clear()` removes exactly those keys; the repository checks fail when
another module touches storage. `exportSettings`/`readSettingsFile` in the core implement the
locked export.

## Decision

1. `MOD-settings-store` is the only module that reads or writes browser storage. Every key is a
   named constant with the prefix `agent-m.`; adding a setting means adding a constant and its row
   on the settings page, which a test checks against each other.
2. No cookie, no `sessionStorage`, no IndexedDB. Where a library would keep its own browser storage
   (an OAuth library's token cache, for example), it is not adopted or its storage is routed through
   the store (ARC-014).
3. **Export and import.** The export is one JSON file with the format tag `agent-m-settings`. When
   the reader gives a passphrase, the settings are encrypted in the browser with the Web Crypto API:
   PBKDF2 with SHA-256 and a random 16-byte salt derives a 256-bit key (600 000 iterations, the
   value the current code uses), and AES-GCM with a random 12-byte IV encrypts the JSON; salt, IV
   and iteration count are stored beside the ciphertext. No library.
4. Import merges: what the browser already has is kept, only what is missing is added, and both
   lists are shown (UC-042 6a).
5. The same file format is what the bridge reads for its own settings
   (`THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`): the bridge takes from it only the
   keys of its own settings — jump host, its port, its pairing token — and never writes a private
   SSH key into it (ARC-013).

## Alternatives

- **IndexedDB** — rejected: more capable than needed, and a second storage API is a second place a
  clear can miss.
- **A crypto library (for example a libsodium build or `crypto-js`)** — rejected: the browser's Web
  Crypto provides both algorithms and is audited with the browser (`AN EXPORT CAN BE LOCKED WITH A
  PASSPHRASE` names it). No reuse, so no due diligence.
- **Argon2 instead of PBKDF2** — Web Crypto offers no Argon2; it would need a WebAssembly library.
  Rejected for now; the file records the key-derivation function, so a later format version can
  change it.
- **Encrypting `localStorage` at rest with a passphrase asked at every visit** — rejected: the key
  would have to stay in memory for the session anyway, and every Pages site of the owner could
  still read the ciphertext; the gain does not pay for a prompt on every page load.

## Consequences

- Every Pages site of the same owner can read the store (`THE SHARED PAGES ORIGIN IS DISCLOSED`);
  the settings page says so before the first secret is stored.
- A forgotten passphrase makes a locked export unreadable; the dashboard says so before saving.
- The iteration count is a constant of the format; raising it later needs a new format version
  that still reads the old one.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
