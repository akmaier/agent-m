---
id: MOD-browser-store
title: One person's configuration in their browser
folder: src/browser-store/
realises:
follows:
  - ARC-047
  - ARC-053
uses:
provides:
  - Store
  - SettingKey
  - SettingInfo
  - ExportFile
  - StoreError
  - openStore
  - readSetting
  - writeSetting
  - clearSetting
  - clearEverything
  - listSettings
  - exportSettings
  - importSettings
  - readExport
  - expiringSoon
  - secretValues
---
# MOD-browser-store One person's configuration in their browser

## Responsibility

It belongs to Access (ARC-047). It keeps everything that belongs to one person on one browser — tokens with their
expiry, the list of products, endpoints and their keys, the Bridge's address and token, the mailbox connection, the jump
host and remote sessions, the mails marked *not an issue*, the notifications of what waits for acceptance and what they
notified — in that browser's `localStorage` and nowhere else
(`CONFIGURATION LIVES IN THE BROWSER`, `CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE`); it knows every key it
writes, so that each can be shown, tested and cleared on one page (`EVERY SETTING IS REACHED FROM ONE PAGE`); and it
exports all of it, secrets included, into one file that may be locked with a passphrase, and imports it again
(`SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS`, `AN EXPORT CAN BE LOCKED WITH A PASSPHRASE`). It runs in a
browser; reading an export runs in Node as well, so that the Bridge can take over its part.

## Parts

- `index.mjs` — the interface.
- `catalogue.mjs` — every setting it keeps: its key, label, whether it is a secret, what it grants, and the use case that
  sets it up.
- `store.mjs` — reading, writing and clearing in `localStorage`.
- `export.mjs` — the export file, plain or locked, and its import.

## Data

It keeps the settings in `localStorage`, under the prefix `agent-m:<owner>/<repository>:` of the instance, so that two
instances in one browser never share an entry. Each value is JSON. The settings it keeps — its catalogue:

| Key after the prefix | Holds | Secret |
|---|---|---|
| `github-token` | `{ value, name, expires, stored }` — the instance's GitHub token and the expiry the person confirmed | yes |
| `github-token:<owner>/<repository>` | `{ value, name, expires, stored }` — the fine-grained token of one GitHub product (`A GITHUB PRODUCT USES A TOKEN OF ITS OWN`) | yes |
| `gitlab-token:<server>/<project>` | `{ value, name, expires, stored }` — the project access token of one GitLab product | yes |
| `products` | the addresses of the products this browser manages (`THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER`) | no |
| `endpoint:<name>` | `{ url, kind, model, key?, throughBridge }` — a model endpoint | the key |
| `bridge` | `{ address, token }` — the paired Bridge | the token |
| `jump-host` | `{ hostname, user, sshPort, portRange, httpsAddress?, login? }` (`THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS`) | the login |
| `remote-session:<name>` | `{ port, token }` — a CLI session reached through the jump host | the token |
| `mailbox` | the connection's fields as MOD-mail-routes defines them — route, address, folders, allowed places, the client identifier of the app registration, or servers and password | the password |
| `mailbox-sign-in` | not a key of its own: the keys the Microsoft sign-in library writes for its token cache under its own names (ARC-053), found by the client identifier the `mailbox` entry names and by the library's own key names | yes |
| `not-an-issue` | the identifiers of mails marked *not an issue* | no |
| `notifications` | `{ checked }` — present while the person has switched the notifications of what waits for acceptance on in this browser (UC-047), absent while they are off; `checked` the date and time of this browser's last check, `null` before the first | no |
| `notified` | `{ "<repository>": { "<path>": "<blob>" } }` — what was notified: for each repository by the address a person opens, every file that waits there, by its path — a SPEC change entry by its proposal's —, with the blob of the text that was notified | no |
| `acknowledged:<notice>` | the date a notice was ticked as read, such as the shared-origin notice | no |
| `last-test:<key>` | `{ at, outcome }` — the last test of a setting | no |

A key outside this catalogue is never written: `writeSetting` refuses it, so no key exists that the settings page does
not show.

The **export file** is JSON, offered for download as `agent-m-settings-<owner>-<date>.json`:

```json
{ "agent-m-settings": 1, "instance": "akmaier/agent-m", "exported": "2026-10-05T09:00:00Z", "locked": false,
  "settings": { "github-token": { "value": "…", "name": "Agent M · agent-m", "expires": "2027-01-03" }, "products": ["…"] },
  "foreign": { "<a sign-in library's key>": "<its value>" } }
```

A locked export carries, instead of `settings` and `foreign`, the same object encrypted in the browser with WebCrypto:
`"kdf": { "name": "PBKDF2", "hash": "SHA-256", "iterations": 600000, "salt": "<base64>" }`, `"cipher": { "name":
"AES-GCM", "iv": "<base64>" }`, `"data": "<base64>"`. The key is derived from the passphrase the person chooses; without
it the file cannot be read, and the passphrase cannot be recovered.

## Interfaces

- `Store` — the store of one instance in this browser, as `openStore` returns it; the functions below take it.
- `SettingKey` — a key of the catalogue after the prefix, such as `github-token` or `endpoint:hub`.
- `SettingInfo` — `{ key: SettingKey, label: string, secret: boolean, grants: string, setUpIn: string, expires: string |
  null, lastTest: { at: string, outcome: string } | null }`: what the settings page shows for one setting.
- `ExportFile` — the export file as defined under Data.
- `StoreError` — `StorageUnavailable` (the browser refuses `localStorage`, for example in a private window),
  `UnknownSetting { key }`, `NotAnExport`, `WrongPassphrase`.
- `openStore(instance: string) -> Store` — the store for the instance `owner/repository`. Throws `StorageUnavailable`.
- `readSetting(store: Store, key: SettingKey) -> unknown | null` — the value, or `null` when it is not set.
- `writeSetting(store: Store, key: SettingKey, value: unknown) -> void` — stores a value under a key of the catalogue.
  Throws `UnknownSetting` for any other key and `StorageUnavailable`. It sets no cookie and puts nothing into an address.
  A notice the person must read first — for the mailbox password, the shared Pages origin — is shown by the page; the
  store records its acknowledgement as a setting of its own.
- `clearSetting(store: Store, key: SettingKey) -> void` — removes the entry from `localStorage` itself, not only from a
  form (`A CLEAR IS A REAL CLEAR`); clearing `mailbox` also removes the sign-in library's keys for that connection.
- `clearEverything(store: Store) -> void` — removes every entry of the instance, the sign-in library's keys for its
  mailbox connection included.
- `listSettings(store: Store) -> SettingInfo[]` — every setting the catalogue knows, set or not, with what it grants and
  where it is set up, and the sign-in library's keys as the mailbox's sign-in; secrets are listed, never returned in the
  list (`A STORED SECRET IS HIDDEN UNTIL SHOWN`: the page reveals one by `readSetting` on *Show*).
- `exportSettings(store: Store, passphrase?: string) -> Promise<string>` — the export file's text, with every setting and
  every secret, and the sign-in library's keys; locked when a passphrase is given. The page states, before it offers the
  file, that it opens the person's repositories and mail to whoever holds it (`AN EXPORT STATES THAT IT CONTAINS
  SECRETS`). The file is offered to the person and nothing else: it is never committed or sent.
- `importSettings(store: Store, text: string, passphrase?: string) -> Promise<{ added: SettingKey[], kept: SettingKey[] }>`
  — adds every setting the file holds that this browser lacks, and keeps every setting it already has; returns both lists
  for the page. Rejects with `NotAnExport`, or `WrongPassphrase` when a locked file does not open. A sign-in token that
  has expired since the export is renewed by signing in again (UC-037).
- `readExport(text: string, passphrase?: string) -> Promise<{ instance: string, settings: Record<SettingKey, unknown> }>`
  — reads an export without a store; runs in Node as well, for the Bridge to take over the settings that concern it.
  Rejects with `NotAnExport` or `WrongPassphrase`.
- `expiringSoon(store: Store, now: Date) -> { key: SettingKey, expires: string }[]` — every stored token whose recorded
  expiry is within fourteen days of `now`, or past (`A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE`).
- `secretValues(store: Store) -> string[]` — the values of every stored secret, for the refusal of a commit that would
  write one (`NO SECRET IN THE REPOSITORY`); a caller passes them on and never shows or logs them.

## Files

It reads and writes `localStorage` of the instance's Pages origin, under its prefix, and the sign-in library's keys of the
mailbox connection. It writes no file; the export is offered to the person as a download, and an import reads the file
the person picks.

## Uses

It uses no other module. It uses the browser's `localStorage` and the WebCrypto interface of browsers and Node.
