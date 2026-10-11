---
id: ITM-455
title: A file only hashed is read as not stored
level: module
realises:
  - UC-004
  - UC-005
  - A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
  - RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE
modules:
  - MOD-source-register
builds_on:
  - ITM-314
tests:
  - unit
origin:
  - ITM-314, #411
  - MOD-source-register, Data: a version's files, and a note where a copy that was only hashed is kept
---
# ITM-455 A file only hashed is read as not stored

**REGISTER**

## Outcome

MOD-source-register's reading of a version, as its file states it: of the files a version's `### Files of <version>`
lists, each one its row names after `not stored:` — the note `registrationCommits` writes (ITM-314) — is a file of the
version with `stored: false`, every other one `stored: true`. `readContent`, which reads "every stored file of the
version", then reads none that is only hashed, and the version's hash stays the hash over all its files. A version
written before any file could be only hashed reads as it does today. `versionCommits` (ITM-385) writes its files in
the same form. The library page commits a registration only after this item (ITM-350).

## Acceptance

- Unit tests that name MOD-source-register state, before the code exists: a version with two files stored and one only
  hashed, as `registrationCommits` plans it, read back with the one `stored: false` and the version's hash over all
  three; `readContent` reading the two stored files only, through a host of the tests' own; a version with no note
  read with every file stored.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/source-register/` and the tests that name MOD-source-register change.
