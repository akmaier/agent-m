---
id: ITM-283
title: The canonical settings export for Bridge setup
level: module
realises:
  - UC-042
  - UC-044
  - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
  - AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
  - CONFIGURATION LIVES IN THE BROWSER
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
modules:
  - MOD-browser-store
builds_on:
  - ITM-204
  - ITM-259
  - ITM-272
  - ITM-279
tests:
  - unit
origin:
  - UC-044
  - UC-042
---
# ITM-283 The canonical settings export for Bridge setup

**REGISTER**

## Outcome

Implement accepted exportSettings, importSettings and readExport over the implemented canonical catalogue, and add only the remote-session:<name> family with its accepted { port, token } value and SettingInfo. Export all implemented settings and secrets for this instance, including products, repository tokens, endpoints, Bridge, jump host/login, notifications and last-test entries; readExport returns the accepted instance/settings without a Store in Node as well as the browser. Plain and passphrase-locked files follow MOD-browser-store's exact version1 envelope and WebCrypto PBKDF2/SHA-256/600000/AES-GCM data shape. Import adds absent settings, keeps existing settings unchanged and returns added/kept keys. Reject malformed exports with NotAnExport and unreadable locked exports with WrongPassphrase, with no partial import.

This is the canonical export prerequisite of MOD-desktop-shell's accepted import handoff. The legacy settings-store.mjs format/version/raw-string export is a working reference, not this envelope. Do not migrate or change legacy callers here. Mailbox, foreign sign-in-library keys and other unimplemented catalogue families, clearEverything, expiry warnings and secretValues remain separate work; use an empty foreign object for this bounded catalogue, never claim complete UC-042 or mailbox export. No export is downloaded, committed, logged or sent by this module.

## Acceptance

- Public unit cases round-trip every implemented catalogue family and constructed secrets in plain and locked exports; raw output is the accepted version1 envelope with the correct instance. Locked output exposes none of those secrets and uses the specified KDF/cipher fields. Node readExport requires no localStorage.
- Same-storage two-instance cases prove export/import isolation; existing keys, including their secrets and metadata, are kept byte-for-byte and missing keys are added. Wrong passphrase and malformed input leave storage unchanged. Unknown catalogue keys remain refused and other instances' entries are not exported.
- Remote-session persistence after reopening, distinct session names, secret-free list metadata with accepted fields and setup route bridge, and actual raw removal on Clear are observed. Existing product/endpoint/jump-host/notification guards and outcomes stay unchanged.
- Only src/browser-store/ and new tests naming MOD-browser-store change. Tests use fixture storage and constructed credentials; no user export or device settings are read.
- The first writing commit contains only new tests and has actual red CI before implementation. Final exact-head full CI is green. Each new case declares a unique numeric TST, one unit level, module, guarded requirement/use case, readable precondition/input/expected result and its own executed relevant guarded-code fault, failure and byte-exact-restored positive. Existing expected results are not weakened. No paid service is called.
- The source PR names its concrete accepted consumer/data path and the actual failure node. Independent selected-item release coverage follows the approved merge; module source readiness and the aggregate release gate remain distinct.
