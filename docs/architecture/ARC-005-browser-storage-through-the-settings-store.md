---
id: ARC-005
title: Settings exports and imports, optionally locked with Web Crypto (PBKDF2, AES-GCM)
forced_by:
  - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
  - AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
  - AN EXPORT STATES THAT IT CONTAINS SECRETS
  - NO SECRET IN THE REPOSITORY
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
  - THE BRIDGE CREATES ITS OWN SSH KEY
  - UC-014
  - UC-042
---
# ARC-005 Settings exports and imports, locked with Web Crypto

## Context

Every credential of a reader — GitHub token, GitLab project tokens, model keys, bridge tokens, mailbox
password or sign-in token — lives in one browser (ARC-003, the browser store). A reader moves between
browsers with an export that contains the secrets (`SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR
SECRETS`) and may lock it with a passphrase; the browser's own cryptography does the work and no library
is added (`AN EXPORT CAN BE LOCKED WITH A PASSPHRASE`). The bridge reads its own settings from the same
kind of file (`THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`) and never lets its private key
leave its machine (`THE BRIDGE CREATES ITS OWN SSH KEY`).

`exportSettings` and `readSettingsFile` in the core implement the locked export today.

## Decision

1. **Format.** The export is one JSON file with the format tag `agent-m-settings`, a version, the date,
   and a note that it contains credentials. The file is handed to the browser's download; Agent M writes
   it to no repository and puts it in no URL (`NO SECRET IN THE REPOSITORY`).
2. **Lock.** When the reader gives a passphrase, the settings are encrypted in the browser with the Web
   Crypto API: PBKDF2 with SHA-256 and a random 16-byte salt derives a 256-bit key (600 000 iterations,
   the value the current code uses), and AES-GCM with a random 12-byte IV encrypts the JSON; salt, IV and
   iteration count are stored beside the ciphertext. No library.
3. **Import merges**: what the browser already has is kept, only what is missing is added, and both lists
   are shown (UC-042 6a). A locked file without its passphrase, or with a wrong one, imports nothing.
4. **The bridge reads the same format.** It takes from the file only the keys of its own settings —
   jump host, its session port, its pairing token — and writes no private SSH key into anything
   (ARC-013).

## Alternatives

- **A crypto library (for example a libsodium build or `crypto-js`)** — rejected: the browser's Web
  Crypto provides both algorithms and is audited with the browser (`AN EXPORT CAN BE LOCKED WITH A
  PASSPHRASE` names it). No reuse, so no due diligence.
- **Argon2 instead of PBKDF2** — Web Crypto offers no Argon2; it would need a WebAssembly library.
  Rejected for now; the file records the key-derivation function, so a later format version can
  change it.
- **Encrypting the browser store at rest with a passphrase asked at every visit** — rejected: the key
  would have to stay in memory for the session anyway, and every Pages site of the owner could still read
  the ciphertext; the gain does not pay for a prompt on every page load.
- **No export, a second setup per browser** — rejected by `SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR
  SECRETS`.

## Consequences

- A forgotten passphrase makes a locked export unreadable; the dashboard says so before saving.
- The iteration count is a constant of the format; raising it later needs a new format version that
  still reads the old one.
- An unlocked export holds every token in clear; the dashboard names each secret and what it grants
  before saving (`AN EXPORT STATES THAT IT CONTAINS SECRETS`).

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the storage rule moved to ARC-003; open until accepted.*
