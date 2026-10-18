---
id: ITM-900
title: An EU legal text gets a newer version on request
level: module
realises:
  - UC-016
  - A SOURCE VERSION IS NEVER OVERWRITTEN
modules:
  - MOD-settings-pages
  - MOD-workflow-entries
builds_on:
  - ITM-591
  - ITM-914
tests:
  - unit
origin:
  - ITM-705's stop (sprint team1/88), from developer-sonnet-a's reading
---
# ITM-900 An EU legal text gets a newer version on request

**REGISTER**

## Outcome

UC-016 step 1 gives an EU legal text a new version "by a new EUR-Lex address or consolidated version". No accepted text
said how. developer-sonnet-a found this at ITM-705's stop (sprint team1/88):
- `onSourcesCommitted` fetches only for an entry "that waits for its fetch", one with no Versions row
  (MOD-workflow-entries.md:185-187; MOD-source-register.md:102-103);
- the library offers only "*Fetch again* for a legal text whose fetch failed" (MOD-settings-pages.md:182).

The drafts for akmaier are committed with this item:
- MOD-settings-pages.md: *+ New version* of a fetched legal text starts the fetch run for that entry, through
  `startWorkflow` with the input `source`, which its Uses name;
- MOD-workflow-entries.md: `onSourcesCommitted` also fetches for the entry a run's input `source` names, appends the text
  as a further version, and writes nothing when its SHA-256 equals an existing version's.

## Acceptance

- *+ New version* of a fetched EU legal text starts the fetch run with the entry. The run appends the newer text as a
  further version, and writes nothing for the same SHA-256. Tests check both, with counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- It waits for akmaier's acceptance of the drafts.

**Noted at ITM-914's gate (sprint team1/89).** Since ITM-914, `isWaitingLegalText` (`src/workflow-entries/instance.mjs:44`)
picks up an entry whose `identifier` is a bare CELEX too, by reading. This item's tests of `onSourcesCommitted` include
such an entry.

