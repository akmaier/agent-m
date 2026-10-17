---
id: ITM-705
title: A repository source and an EU legal text get a new version
level: module
realises:
  - UC-016
  - A LIVING SOURCE IS PINNED
modules:
  - MOD-settings-pages
builds_on:
  - ITM-591
tests:
  - unit
origin:
  - ITM-591's gate on pull request #723 (docs/gates/20261017-1055-development-release-testing-d40b.md), from developer-sonnet-e's finding
---
# ITM-705 A repository source and an EU legal text get a new version

**REGISTER**

## Outcome

UC-016 step 1: "The author opens the source in the library and chooses **+ New version** — the same routes as in" UC-004.
ITM-591 builds the route of files. A source of kind repository gets a new version as a newer commit read, and an EU
legal text as a newer text fetched (MOD-source-register's `versionCommits`, `fetchLegalText`). Which of MOD-source-register's
functions each route calls, and what each reads, is read and measured at the start (sprints 66 and 69).

## Acceptance

- *+ New version* of a repository source records the newer commit it reads, and of an EU legal text the newer text it
  fetches, each refused for the same bytes as an existing version.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Found at ITM-704's gate (2026-10-17, po-opus).** The header of `src/settings-pages/library.mjs:23` still holds item
history: "(the schema names its rule since ITM-458)". This item changes the library's routes, and it removes that
history as well.
