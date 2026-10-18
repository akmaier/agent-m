---
id: ITM-881
title: A job whose runtime is unreachable is listed with its source not reachable
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
modules:
  - MOD-job-ledger
builds_on:
tests:
  - unit
origin:
  - found by po-opus-b at sprint 89's start decision
---
# ITM-881 A job whose runtime is unreachable is listed with its source not reachable

**REGISTER**

## Outcome

MOD-job-ledger's accepted file, `jobState` (docs/architecture/MOD-job-ledger.md:173-175): "for a job that has not
ended, with the live state: [...] an unreachable one leaves it as its record says, **and the list shows the source as
not reachable**." UC-036 alternative flow 1a: "The list shows the source as *not reachable*, with the reason".

`listJobs` does the first half and not the second. The path, on `main` at `ae660a4a`:
- `src/main-page/home.mjs:50` calls `listJobs([...], lives)` with the live states `liveStatesOf` asked of the runtimes;
  a runtime that does not answer gives `{ reachable: false, reason }` (`src/main-page/jobs.mjs:70-71`).
- `src/job-ledger/index.mjs:420-426`: once the record is read, `source = { reachable: true, reason: null }`; the live
  state, read at `:428`, goes only to `jobState` and `elapsedOf`. Actual: `source.reachable` true. Expected: false,
  with the live state's reason.
- `src/progress-measures/stages.mjs:145`, `buildInProgress`, gives `reachable: row.source.reachable` as "whether its
  runtime answers" — so the main page's work in progress reports a runtime as answering that does not.

Verified on `ae660a4a` with a known positive: a listed record that `read` gives as `null` gives
`{"reachable":false,"reason":"not held at this commit"}`; a taken, not ended record with the live state
`{ reachable: false, reason: "Unreachable: runtime gone", known: false, ... }` gives state `running` (right, as
`jobState` reads it) and source `{"reachable":true,"reason":null}` (wrong).

The fix: a row whose record was read and whose live state is given with `reachable: false` carries `source:
{ reachable: false, reason: <the live state's reason> }`; its state stays as `jobState` gives it. A row without a live
state, or with a reachable one, keeps `{ reachable: true, reason: null }`; an unreadable record keeps its own reason.

**Callers that read `source`** (grep of `src/` for `source.reachable`, verified by its hit at `stages.mjs:145`):
- `src/main-page/jobs.mjs:69` and `:86` call `listJobs` with an empty live map first (`liveStatesOf` filters on
  `source.reachable` before any live state exists), so they are unchanged.
- `src/prompt-bar/follow.mjs:76` calls it with `new Map()`; unchanged.
- `src/progress-measures/stages.mjs:145` is the one that changes, as the file states it.

## Acceptance

- A unit test naming MOD-job-ledger: a taken, not ended record with an unreachable live state is listed with state
  `running` and source `{ reachable: false, reason: <the live state's reason> }`; the same record with a reachable live
  state that knows it, and with no live state, keeps `{ reachable: true, reason: null }`. Expected values literal.
- TST-472297 and the other `listJobs` tests of `tests/job-ledger.test.mjs` stay green with no expected result changed.
- The first commit holds only the test, and CI is red on it. No stub is committed.
- Only `src/job-ledger/` and tests naming MOD-job-ledger change.
