---
id: ITM-1280
title: The jobs list reads its records in batches and the job workflow's runs once
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-job-ledger
  - MOD-runtimes
  - MOD-main-page
builds_on: []
tests:
  - unit
  - component
origin:
  - akmaier, 2026-10-28: "A lot of the stuff that is loaded on the new pages right now is actually never looked at. It is unlikely that a user needs all records at once." Then: "Please follow up. I want all pages fixed this way."
---
# ITM-1280 The jobs list reads its records in batches and the job workflow's runs once

**REGISTER**

## Outcome

`jobs` (`src/main-page/jobs.mjs:168-177`, `everyJob`) calls `listJobs` (`src/job-ledger/index.mjs:420-430`), which reads
every record under `docs/jobs/` one request at a time — 478 at Agent M's head, ~7.6 MB —, then `liveStatesOf`
(`jobs.mjs:69-79`) asks `liveState` for each job without an end, which for a CI job lists every run of
`agent-m-jobs.yml` (`src/runtimes/ci.mjs:283-286`, `runOfAddress`; 172 runs, two pages) — once per job (7 unended at
the head).

The list shows every job (SPEC `ONE DASHBOARD SHOWS EVERY JOB`), waiting ones first, and which jobs have not ended is
known only from their records. So the read is batched, not bounded to the newest: a newest-N page would hide a job that
has waited at a gate for weeks — the row the list shows first.

After the change, as MOD-job-ledger, MOD-runtimes and MOD-main-page say: `listJobs` names a snapshot's records to
`readMany` first; `liveStates(records, product, bridges)` gives the live states of a repository's unended jobs with one
listing of the job workflow's runs; the list calls it once per repository. The job page (ITM-1269) keeps `liveState`.

Design principles (AGENTS.md §2 *Designing*): §2.2 — the runs are listed once; SPEC `A PAGE LOAD READS THE REPOSITORY IN
BATCHES`.

## Acceptance

Tests written first, each red on the commit that holds only them:

- `tests/job-ledger-list-batched.test.mjs` (MOD-job-ledger, unit): over a counting fake with 250 records, `listJobs` sends
  three batches and no single read; the rows equal today's.
- `tests/runtimes-live-states.test.mjs` (MOD-runtimes, unit): five unended CI jobs give the states `liveState` gives
  one by one, with one listing of the runs. Counter-proof: a record without an end on a Bridge asks the Bridge.
- `tests/main-page-jobs-reads.test.mjs` (MOD-main-page, component): `#jobs` with two repositories sends per repository
  its batches and at most one listing of runs.

Measurable outcome, on the live main page: `#jobs` reads Agent M's records in 5 batches instead of 478 requests, and
lists the job workflow's runs once (2 pages) instead of once per unended job (up to 14 pages today).

- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only the folders of the three modules and the tests that name them change.
