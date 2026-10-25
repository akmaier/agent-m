---
id: ITM-1114
title: MOD-test-pages's text names `blobSha`, which its code imports
level: module
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-test-pages
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-g's probe for ITM-1068 (sprint team2/97), on main at b1e4e7f4
built_by:
  - 258f72be504a063d0bef2529546169f43c40c32f
---
# ITM-1114 MOD-test-pages's text names `blobSha`, which its code imports

**REGISTER**

## Outcome

`src/test-pages/release.mjs:34` imports `blobSha` of MOD-text-tools, which MOD-test-pages's `uses:` does not name. The import is the module's own work: it the blob of a checked text, as the release panel records it. So the text
lacks a use, and no code is wrong.

## Not ready: a draft for akmaier

The draft adds the use to MOD-test-pages's `uses:` and its Uses section, with what it is used for. No code changes.

## Acceptance

- Once the draft is accepted, the check of ITM-1068 finds no import of MOD-test-pages that its uses do not name.

**The draft is on `main` as `258f72be`** (MOD-test-pages), written in sprint team1/98. The item is built once it is accepted.

**Done (sprint team1/98, po-opus):** akmaier accepted the draft (`614f164b`), and the accepted blob is the draft's. No code changes.
