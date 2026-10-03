---
id: MOD-settings-store
title: Keeps the browser's settings and the texts of files read — the only module that touches browser storage
realises:
  - CONFIGURATION LIVES IN THE BROWSER
  - CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
  - A CLEAR IS A REAL CLEAR
  - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
  - AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
  - THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
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
  - fileTexts
  - parseJson
  - sessionList
  - gitlabTokenMap
  - tokenTest
  - sessionTest
---
# MOD-settings-store Keeps the browser's settings and the texts of files read

## Responsibility

Adapter. The browser runtime's one store (ARC-003, ARC-005). Every setting kept in the browser is a named
key here; nothing else in the dashboard reads or writes `localStorage`, and there is no cookie. Beside the
settings it keeps the texts of repository files the dashboard has read, in Cache Storage, never in
`localStorage`. The dashboard app creates the store and passes it, or the values read from it, to every
other module; no other module opens a store.

## Interfaces

- `browserStore() -> store` — getters, setters and clears for every named key under the prefix `agent-m.` (GitHub token and expiry, products, GitLab project tokens, endpoints and keys, bridge address and token, mailbox connection — route, Microsoft app client ID and sign-in token, or servers and password —, mails marked *not an issue*, the jump host — hostname, SSH user, port range, HTTPS address and web-server login —, and each remote session's name, port, route and bridge token), and the last test of the GitHub token, of each GitLab project token and of each remote session — the GitHub token's under a key of its own, the others as `tested` in their entry —, reset by a new value and cleared with its setting; `clear()` removes exactly the `agent-m.` keys; in a private window it behaves as an empty store.
- `settingKeys -> [{ key, label, secret, grants }]` — every key the store writes, with what a secret grants; the web-server password is a secret that grants every request to the bridges behind that jump host, together with their bridge tokens; the settings page and the export notice are built from it.
- `exportSettings(entries, { passphrase, now }) -> text` — one JSON file `agent-m-settings` v1; with a passphrase, PBKDF2-SHA-256 (600 000 iterations, random salt) and AES-GCM (random IV) through Web Crypto, salt and IV stored beside the ciphertext.
- `readSettingsFile(text, passphrase) -> entries` — a locked file without or with a wrong passphrase reads nothing and says which.
- `mergeSettings(current, incoming) -> { put, added, kept, ignored }` — keeps what the browser has, adds only what is missing, lists both.
- `fileTexts() -> { get(key), put(key, text), clear() }` — the texts of files read, in Cache Storage under `agent-m-file-texts`; every access caught, so that without Cache Storage nothing is kept and every file is read from the server; `clear()` reports whether anything is still kept.
- `parseJson(raw, fallback) -> value` — a raw store value read as JSON; `fallback` when it is empty or unreadable.
- `sessionList(raw) -> [session]` — the remote sessions of a raw store value, each with a name; anything else is left out.
- `gitlabTokenMap(raw) -> { address: { token, expires, tested? } }` — the GitLab project tokens of a raw store value; `tested` only where a last test is kept; anything malformed is left out.
- `tokenTest(value) -> { ok: "YYYY-MM-DD" } | { refused: true } | null` — a token's last test as kept: the server accepted it that day, or refused it at the last use.
- `sessionTest(value) -> { up: "YYYY-MM-DD" } | { down: true } | null` — a remote session's last test as kept: something answered at its local port that day, or nothing answered.

## Testing

Unit tests with a stand-in storage and a stand-in Cache Storage (`tests/review-core.test.mjs`,
`tests/test_no_config_cookie.py`, `tests/test_clear_removes_storage.py`, `tests/test_config_client_side.py`):
no cookie is ever set; after *Clear everything* no `agent-m.` key and no file text is left, with a foreign
key kept as counter-proof; an export locked with a passphrase reads back with it and not without it; a
merge keeps what the browser has. The seams are `localStorage`, `caches` and Web Crypto's random source. A
browser that refuses storage is simulated by a throwing stand-in. No model is involved.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; revised on 2026-10-01 by Claude (claude-opus-5-5) against commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): the browser runtime's one store, the file texts in Cache Storage added, the current state removed; revised on 2026-10-03 by Claude (claude-opus-5-5) against commit 230662f4a7d0fe40cae0b00b8973d1d752eb609f — ITM-138, akmaier's option A: the names other modules use are provided and used as the code has them; open until accepted.*
