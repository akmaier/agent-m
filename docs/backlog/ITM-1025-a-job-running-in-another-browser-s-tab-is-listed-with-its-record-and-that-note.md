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
  - ITM-1077
  - ITM-1078
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

- A tab job whose `## Taken` names another browser is listed with `reachable: false`, the note that its live state and
  log exist only in that browser's tab, and the folded explanation of ITM-1078. A tab job this browser took and this tab
  no longer holds is *ended without record*. A `## Taken` of bare `tab` is read as this browser's. Each with a
  counter-proof. Whether another browser's tab has since closed cannot be known here, so such a job stays
  `reachable: false`.

## Not ready: its draft waits

No accepted text says how MOD-runtimes learns this browser's identifier (sprint 96, developer-sonnet-i's stop). The
draft for MOD-runtimes is described in 96.md: the tab's route reads `browser` from the store of the instance its Pages
address names, and makes it at first use. It goes to akmaier once it is reviewed, and after akmaier has decided team 1's
pending draft `c3ec9099` on the same file. The item is built only once the draft is accepted.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## For akmaier, from the review of the draft (opus reviewer, sprint 96)

The accepted texts raise three points that the draft does not settle. They go to akmaier with it:
- **SPEC.md:1790-1791**, the check of PROGRESS AND JOB STATE ARE DERIVED, NOT STORED: "Deleting all local storage and
  reloading shows the same progress and the same job states." With `browser` in `localStorage`, deleting it makes this
  browser's earlier tab jobs read as another browser's. They are then `reachable: false`, not *ended without record*.
  The derivation is unchanged, but the shown state of those jobs differs.
- **Export and import.** `exportSettings` (MOD-browser-store.md:121) carries every setting, so `browser` reaches a second
  browser, and two browsers then share one identifier. A possible item: leave `browser` out of the export, as tab values
  are.
- **Two tabs of one browser.** A job running in a second tab of this browser is read here as one this browser took and
  this tab does not hold, so *ended without record* (MOD-runtimes at `26dac0e5`, :199). This is unchanged by the draft.
