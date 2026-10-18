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

**Stopped at its first task (sprint team1/90, developer-sonnet-a): no accepted text refuses an existing identifier.**
- `versionCommits` refuses only `SameBytes` and `NoteMissing`. SPEC.md:206-213, UC-016 1a, UC-004,
  MOD-settings-pages.md:181 and MOD-workflow-entries.md:189 compare bytes only.
- Measured on the base (probe `ITM-925-probe.mjs`): a second `cellar-1` with other bytes appends a second row
  (`src/source-register/index.mjs:229-239`). It plans `docs/sources/SRC-ai-act/cellar-1/act.xhtml`, the existing version's
  file (`:242-245`), and `readContent` would then report `HashMismatch` for the old version. In effect it overwrites a
  version.
- **The draft for akmaier, on `main`:** MOD-source-register.md, `versionCommits` also throws "`VersionExists { version }`
  when `version.version` is the identifier of an existing version whose bytes differ". `SameBytes` keeps precedence,
  since `onSourcesCommitted` (`src/workflow-entries/instance.mjs:111`) catches only that one.
- The Acceptance names `VersionExists`. In the workflow it ends the entry `failed`, which is right, and a test of that
  would be MOD-workflow-entries' item, not this one.
- It waits for akmaier's acceptance.

