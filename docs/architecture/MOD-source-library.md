---
id: MOD-source-library
title: Keeps the instance's register of requirement sources and each product's links to them
realises:
  - THE SOURCE MODEL IS GENERIC
  - A REQUIREMENT HAS A REGISTERED SOURCE
  - A SOURCE DECLARES ITS AUTHORITY
  - A LIVING SOURCE IS PINNED
  - THE SOURCE KIND IS ONE OF A CLOSED SET
  - THE INSTANCE KEEPS THE SOURCE REGISTER
  - A PRODUCT LINKS THE SOURCES THAT APPLY
  - A LINK NAMES THE PART THAT APPLIES
  - A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY
  - A SOURCE DECLARES ITS LICENCE
  - RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE
  - A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
  - A SOURCE VERSION IS NEVER OVERWRITTEN
  - A STANDARD IS REGISTERED BY ITS DESIGNATION
  - AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - A RESOURCE'S TERMS ENTER AS A SOURCE
  - UC-004
  - UC-015
  - UC-016
follows:
  - ARC-003
  - ARC-006
uses:
  - MOD-git-host.readSnapshot
provides:
  - parseSource
  - validateSource
  - parseSourceLinks
  - hashFiles
  - contentPlacement
  - contentPermitted
  - fetchLegalText
---
# MOD-source-library Keeps the instance's register of requirement sources and each product's links to them

## Responsibility

Requirement sources (UC-004, UC-015, UC-016): the instance's register, the product's links, the
versions with hashes, where restricted content may live and where it may go. Pure core except
`fetchLegalText`, which runs in the instance's fetch workflow.

**Current state.** No code exists. Text extraction from PDF and Word files for derivation (UC-005)
needs a reuse decision of its own, which is not taken here.

## Interfaces

- `parseSource(text) -> source` — `docs/sources/SRC-<slug>.md`: kind (one of the closed set), authority, licence, permitted processing places, versions with identifier or designation, date and the SHA-256 of every file.
- `validateSource(source, existing) -> [problem]` — missing field, unknown kind, a standard without full designation, a changed existing version, the same bytes as an existing version.
- `parseSourceLinks(text) -> [{ source, version, hash, part }]` — a product's `docs/sources.md`.
- `hashFiles(files) -> [{ name, sha256 }]` — computed in the browser without sending the files anywhere; a zip is hashed as a file and listed by its members.
- `contentPlacement(source) -> "instance" | { repository }` — only content whose licence permits public redistribution goes into the instance; the register entry says so before saving.
- `contentPermitted(source, place) -> boolean` — whether a source's content may be given to a participant processing data at that place.
- `fetchLegalText(celexOrEli) -> { text, retrieved, versionId, sha256 }` — the fetch workflow's step: the official text from the EU's publication repository, run in CI because the browser cannot read it.

Uses, as declared above: `MOD-git-host.readSnapshot`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
