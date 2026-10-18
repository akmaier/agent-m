---
id: ITM-881
title: A job whose runtime is unreachable is listed with its source not reachable
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
modules:
  - MOD-job-ledger
  - MOD-main-page
  - MOD-prompt-bar
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
- Only `src/job-ledger/` and tests naming MOD-job-ledger change, and, by the widening below, `src/main-page/jobs.mjs`,
  `src/prompt-bar/follow.mjs` and tests naming MOD-main-page or MOD-prompt-bar.

## Widened at sprint team2/89, 2026-10-18 (po-opus-b): MOD-main-page and MOD-prompt-bar tell the two reasons apart

developer-sonnet-f stopped the item as not buildable within its scope (#863). The Outcome's list of callers is wrong:
`src/main-page/jobs.mjs:86` and `src/prompt-bar/follow.mjs:93` call `listJobs` a second time, with the live states, and
read `source.reachable` false as "the record could not be read".

**The path, verified on #863's head `b0929e22`:**
- `src/main-page/jobs.mjs:141`: `listOf(await listJobs(products, lives), lives)`. With the fix, the row of a read record
  whose runtime is unreachable has `source { reachable: false, reason: <the live state's reason> }`.
- `src/main-page/jobs.mjs:86` (`listOf`) tests `!row.source.reachable` first and shows "could not be read: <reason>".
  Expected: "not reachable: <reason>".
- `tests/main-page-jobs.test.mjs`: TST-509001 and TST-509003 fail on the head (26 pass, 2 fail). They pass on
  `dc1649b7`.
- `src/prompt-bar/follow.mjs:93` has the same order. It calls `listJobs(products, lives)` at `:88` and would say "The
  record could not be read" for an unreachable runtime. No test reaches that line (grep of `tests/` for "runtime is not
  reachable": no hit; the known positive is the hit in `follow.mjs`).

**What the texts give.**
- MOD-job-ledger.md:173-175: an unreachable runtime "leaves it as its record says, and the list shows the source as not
  reachable".
- UC-036 1a: "The list shows the source as *not reachable*, with the reason".
- MOD-main-page.md:89 (`jobs`): "a source that cannot be reached is named with its reason".
- MOD-job-ledger.md:177-178 (`listJobs`): "A record that cannot be read is listed with what could be read and the
  reason".

So the two cases are told apart by the structured fields, never by the text of a reason (agreement 85):
- the live state given for the row's job with `reachable: false` means the runtime is not reachable, with the live
  state's reason;
- otherwise `source.reachable` false means the record could not be read, with `source.reason`.

A record that cannot be read gets no live state (`liveStatesOf`, `jobs.mjs:69`, asks only rows read in the first call),
so the two never meet on one row. TST-509001 and TST-509003 keep their expected values: they already state what the
texts give. Checked in a scratch checkout of `b0929e22`: `listOf` with the live state tested first passes all 38 tests of
`tests/main-page-jobs.test.mjs` and `tests/job-ledger.test.mjs`.

**Decision: the item is widened, not split.** The fix in `listJobs` turns TST-509001 and TST-509003 red by itself, so a
split item could not be merged without the other. `conflicts` finds MOD-main-page and MOD-prompt-bar free: team 1 holds
no sprint. Both are *accepted* by `statuses` on `57a30f50`.

**Acceptance, added:**
- `src/main-page/jobs.mjs` `listOf` names a row "not reachable: <the live state's reason>" when its live state is given
  with `reachable: false`, and "could not be read: <source.reason>" otherwise when `source.reachable` is false.
  TST-509001 and TST-509003 pass with no expected result changed.
- `src/prompt-bar/follow.mjs` tells the two cases apart the same way. A unit test naming MOD-prompt-bar: a followed
  job, not ended, whose `liveState` throws is shown with "The runtime is not reachable: <reason>" and without "could not
  be read". It is red on #863's head before the change.
- The test of each module is committed red before its fix, as above.

developer-sonnet-f continues the item on #863.
