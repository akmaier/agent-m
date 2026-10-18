---
id: ITM-705
title: A repository source gets a new version
level: module
realises:
  - UC-016
  - A LIVING SOURCE IS PINNED
modules:
  - MOD-settings-pages
  - MOD-source-register
builds_on:
  - ITM-591
tests:
  - unit
origin:
  - ITM-591's gate on pull request #723 (docs/gates/20261017-1055-development-release-testing-d40b.md), from developer-sonnet-e's finding
---
# ITM-705 A repository source gets a new version

**REGISTER**

## Outcome

UC-016 step 1: "The author opens the source in the library and chooses **+ New version** — the same routes as in" UC-004.
ITM-591 builds the route of files. A source of kind repository gets a new version as a newer commit read, and an EU
legal text as a newer text fetched (MOD-source-register's `versionCommits`, `fetchLegalText`). Which of MOD-source-register's
functions each route calls, and what each reads, is read and measured at the start (sprints 66 and 69).

## Acceptance

- *+ New version* of a repository source records the newer commit it reads, and is refused for the commit an existing
  version records.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Found at ITM-704's gate (2026-10-17, po-opus).** The header of `src/settings-pages/library.mjs:23` still holds item
history: "(the schema names its rule since ITM-458)". This item changes the library's routes, and it removes that
history as well.

**Stopped at its first task (sprint team1/88, developer-sonnet-a), and split.** No accepted text said what a repository
source's new version records or what its "same bytes" are.
- `versionCommits` takes no commit (MOD-source-register.md:151-154).
- `versionCommits(entry, [], …)` on an entry as the repository route writes it throws `SameBytes` against the first
  version (probe `ITM-705-probe.mjs`; its known positive, one file, returns a plan).
The draft for akmaier, committed to MOD-source-register.md: `version.commit`, the row recording it, no files needed, and
`SameBytes` for the same commit. The EU legal text's half is ITM-900. This item waits for the draft.
