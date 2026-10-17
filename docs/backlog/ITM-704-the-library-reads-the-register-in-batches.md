---
id: ITM-704
title: The library reads the register in batches
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-591's gate on pull request #723 (docs/gates/20261017-1055-development-release-testing-d40b.md), from developer-sonnet-e's measurement
---
# ITM-704 The library reads the register in batches

**REGISTER**

## Outcome

MOD-settings-pages' `readRegisterOf` (`src/settings-pages/library.mjs`) reads each register entry `docs/sources/SRC-*.md`
of the instance with a request of its own, even with a token. `A PAGE LOAD READS THE REPOSITORY IN BATCHES` asks that a
page load read "the texts of the files it shows in requests of at most 100 files each". The entries are in one
snapshot, so `readRegisterOf` reads them through `Snapshot.readMany` first, which is in MOD-settings-pages' Uses through
MOD-repository-hosts' Snapshot.

**The measurement** (sprint 67's form) is a committed test counting the requests of opening `library` with a register of
many entries, with a token: one batch per 100 entries.

## Acceptance

- With a token, opening `library` reads the register's entries in one batch per 100, and the committed test pins it.
- The library, `library/<source>` and `sources` show what they show today.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
