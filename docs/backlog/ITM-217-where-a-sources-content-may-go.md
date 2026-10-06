---
id: ITM-217
title: Where a source's content may go
level: module
realises:
  - UC-002
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - A SOURCE DECLARES ITS LICENCE
modules:
  - MOD-source-register
builds_on:
  - ITM-213
tests:
  - unit
origin:
  - UC-002
---
# ITM-217 Where a source's content may go

**REGISTER**

## Outcome

MOD-source-register's interface, as its file states it, for UC-002: `sourceSchemas` and `permittedPlaces`, in
`src/source-register/`: the register entries and a product's links read by their schemas, and the processing places to
which the content of a linked source may be given. Registering, fetching and reading a source's content are not part of
this item.

The module checks no participant's place against those places. MOD-participant-list's `eligible` does that for a job or
a role (ITM-216), and MOD-product-process' `declarationFindings` does it for a declaration (ITM-218).

## Acceptance

- Unit tests that name MOD-source-register state, before the code exists:
  - a register entry and a product's links file, read through MOD-documents with `sourceSchemas`;
  - `permittedPlaces` of four entries: one whose content may be republished — any place —; a restricted one with its
    places — those places —; a restricted one that declares none — no place —; and one whose licence is `unknown`,
    which counts as restricted;
  - this instance's entry `SRC-vibe-coding`, whose licence permits republishing, permitting any place.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/source-register/` and the tests that name MOD-source-register change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
