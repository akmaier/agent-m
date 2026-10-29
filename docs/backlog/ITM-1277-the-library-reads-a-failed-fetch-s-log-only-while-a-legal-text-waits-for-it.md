---
id: ITM-1277
title: The library reads a failed fetch's log only while a legal text waits for it
level: module
realises:
  - UC-004
  - AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
modules:
  - MOD-settings-pages
builds_on: []
tests:
  - component
origin:
  - akmaier, 2026-10-28: "A lot of the stuff that is loaded on the new pages right now is actually never looked at. It is unlikely that a user needs all records at once." Then: "Please follow up. I want all pages fixed this way."
---
# ITM-1277 The library reads a failed fetch's log only while a legal text waits for it

**REGISTER**

## Outcome

`library` (`src/settings-pages/library.mjs:105-120`, `fetchFailures`) lists every run of `fetch-sources.yml` and calls
`ciRunLog` — every job's full log — for every failed run, on each load, also when no legal text waits for its fetch
(the loop over failed runs does not look at `waiting`). The line is shown for a legal text without a version
(UC-004 7a). At Agent M's head the workflow has never run and no legal text is registered, so the cost today is one
listing; it grows with every failed run.

After the change, as MOD-settings-pages says: no log is read while no legal text waits; otherwise the failed runs' logs
are read newest first, only until each waiting text has its line, and no further back than the newest successful run
started by a push — a run on a push fetches every text then waiting (`.github/workflows/fetch-sources.yml`, input
`source` empty), so a text still waiting is younger than it.

Design principle (AGENTS.md §2 *Designing*): akmaier — what is read is what the page shows; ch. 12 *KISS* — a bound
from the workflow's own trigger, no stored state.

## Acceptance

Tests written first, each red on the commit that holds only them:

- `tests/settings-pages-library-fetch-logs.test.mjs` (MOD-settings-pages, component), over a fake host with ten failed
  runs: with no legal text waiting, no `ciRunLog`; with one waiting whose line stands in the newest failed run, one
  `ciRunLog`, and the line shown; with a successful push run third newest, at most two logs read. Counter-proof: today's
  page reads ten.

Measurable outcome: a load of `library` with no waiting legal text reads no log (today one per failed run); with one
waiting, as many as it takes to find its line.

- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
