---
id: ITM-925
title: A source version's identifier names one version
level: module
realises:
  - A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
  - A SOURCE VERSION IS NEVER OVERWRITTEN
modules:
  - MOD-source-register
builds_on:
  - ITM-900
tests:
  - unit
origin:
  - developer-sonnet-a's finding on ITM-900's pull request #890 (sprint team1/89)
---
# ITM-925 A source version's identifier names one version

**REGISTER**

## Outcome

**A lead from ITM-900's pull request #890 (developer-sonnet-a).** `versionCommits` refuses a new version whose bytes equal an
existing version's (`SameBytes`), but checks no version identifiers. A fetched EU legal text whose version identifier
equals an existing one, with different bytes, would be appended as a second row with the same identifier.
`A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH` and `A SOURCE VERSION IS NEVER OVERWRITTEN` ask that an identifier name
one version.

**First task:** read whether the publication repository can give the same version identifier for different bytes, and
what MOD-source-register.md says a second version with an existing identifier is. If the text names no refusal, the item
stops and the draft goes to akmaier.

## Acceptance

- A new version whose identifier an existing version already has is refused, naming the identifier, and nothing is
  recorded. A test checks it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
