---
id: ITM-1025
title: A job running in another browser's tab is listed with its record and that note
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-runtimes
  - MOD-main-page
  - MOD-job-ledger
  - MOD-browser-store
builds_on:
  - ITM-535
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-036-9, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1025 A job running in another browser's tab is listed with its record and that note

**REGISTER**

## Outcome

UC-036-inspect-running-jobs.md:136-137 (1b): "A job was started in another browser and runs in its tab. Its record is
listed, with the note that its live state and log exist only in that tab". On `main` such a job is shown *ended without
record*: `src/runtimes/index.mjs:84` gives `known: false` for a tab job this tab does not hold, and
`src/job-ledger/states.mjs:20` turns that into *ended without record* (1c).

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-runtimes.md:196-199:

> host's `readHistory` (`changes: false`), whose date is after the record's `## End` of state `cancelled`. A job of the tab
>   route that another browser took — its `## Taken` names another browser than this one (MOD-job-ledger) — gives
>   `reachable: false` with the reason that its live state and log exist only in that browser's tab (UC-036 1b); one this
>   browser took and this tab does not hold gives `known: false`, so that it is *ended without record* (1c).

## Acceptance

- A tab job of another browser that is still running is listed with the note and its folded explanation recommending a
  CI or Bridge route; one whose tab has closed is *ended without record*. Each with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
