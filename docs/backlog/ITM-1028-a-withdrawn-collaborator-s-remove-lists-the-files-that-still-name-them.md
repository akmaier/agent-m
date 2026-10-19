---
id: ITM-1028
title: A withdrawn collaborator's Remove lists the files that still name them
level: module
realises:
  - UC-042
  - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-042-2, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1028 A withdrawn collaborator's Remove lists the files that still name them

**REGISTER**

## Outcome

UC-042 5a (UC-042.md:147-149): "**Remove** takes them off the list with one click and lists the files on the default branch
that still name them, for the person to change; the page says that earlier commits keep the name in the history."
MOD-settings-pages.md:260-261 uses "MOD-personal-data.namedPersonFindings — a product's pseudonymisation and collaborators,
and the files that still name a collaborator who withdrew."

*Remove* and the history note are built (`src/settings-pages/settings.mjs:1011-1019`). The list of files is not:
`namedPersonFindings` (`src/personal-data/consent.mjs:14`, built) is not called by the page.

## Acceptance

- Unit tests that name MOD-settings-pages, over a fake host whose default branch has two files naming the collaborator:
  after *Remove*, the page lists exactly those two files; with none, it says so.
- Counter-proof: a page that lists no file while one names the collaborator fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
