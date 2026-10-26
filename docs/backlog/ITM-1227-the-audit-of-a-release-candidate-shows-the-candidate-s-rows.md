---
id: ITM-1227
title: The audit of a release candidate shows the candidate's rows
level: module
realises:
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
  - UC-013
  - UC-030
modules:
  - MOD-trace-pages
builds_on:
  - ITM-765
  - ITM-1226
tests:
  - unit
origin:
  - ITM-1226's report (PR #1349): the release panel's embedded audit of a candidate says "No release is tagged yet"
---
# ITM-1227 The audit of a release candidate shows the candidate's rows

**REGISTER**

## Outcome

The release panel shows the audit of its candidate inside itself — "every requirement with its evidence — the audit of
the candidate" (MOD-test-pages.md, `release`) —, embedding MOD-trace-pages' route `trace` with `key` `audit`, the
candidate's tag as `ref` and `commit` among its params (`src/test-pages/release.mjs:117`). Since ITM-1226 the live page
draws it, but it reads "No release is tagged yet": `src/trace-pages/flow.mjs:847` hands `drawAudit` only the tags matching
`RELEASE` (`^v(\d+)\.(\d+)\.(\d+)$`, `:650`), so the candidate's tag (`v2026.10.8-rc.1`) is none of them.

The audit of a candidate (`commit` among its params) derives its rows at the candidate's tag, as the audit of a release
does at the release's; the choice of tags offered on Tests → Audit stays the releases'.

## Acceptance

- Unit tests naming MOD-trace-pages: the audit with a candidate's tag as `ref` and its commit draws the candidate's rows;
  the audit of Tests → Audit still offers release tags only. Counter-proof: before the change the first reads "No
  release is tagged yet".
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.
