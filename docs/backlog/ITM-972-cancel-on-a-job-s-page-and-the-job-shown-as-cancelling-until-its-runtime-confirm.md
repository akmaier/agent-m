---
id: ITM-972
title: Cancel on a job's page, and the job shown as cancelling until its runtime confirms
level: module
realises:
  - UC-036
  - A CANCELLED JOB WRITES NOTHING MORE
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - ONE CLICK PER DECISION
modules:
  - MOD-main-page
builds_on:
  - ITM-971
  - ITM-535
  - ITM-545
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-036-4, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-972 Cancel on a job's page, and the job shown as cancelling until its runtime confirms

**REGISTER**

## Outcome

MOD-main-page.md:97-98: "*Cancel* for a queued, running or waiting job, whose end, cancelled, MOD-runtimes' `cancelJob`
appends once its runtime confirms". UC-036:100-104 (step 6), :150-151 (6a, the *cancelling* part). `cancelJob` is built
(`src/runtimes/index.mjs:133`); no page calls it. One click through MOD-site-frame's `confirmDecision`; on
`"cancelling"` the job is shown *cancelling* inside *running* and read again; `Moved` reads the record again.

## Acceptance

- Over a fake host and Bridge: *Cancel* is offered only for queued, running and waiting jobs; one confirmed click calls
  `cancelJob` once; `"cancelled"` shows the job cancelled; `"cancelling"` shows *cancelling* and appends nothing. No
  request before the click. Counter-proof: a *Cancel* on a done job fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/main-page/` and the tests that name MOD-main-page change.
