---
id: ITM-545
title: A Bridge job's live state, its log and its cancel
level: module
realises:
  - UC-049
  - ONE DASHBOARD SHOWS EVERY JOB
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-runtimes
builds_on:
  - ITM-535
  - ITM-544
tests:
  - unit
origin:
  - ITM-535, as cut in sprint team1/45
  - MOD-runtimes, Interfaces: liveState, jobLog, cancelJob — "the list of jobs of the Bridge its record names, among `bridges`"
---
# ITM-545 A Bridge job's live state, its log and its cancel

**REGISTER**

## Outcome

MOD-runtimes' `liveState`, `jobLog` and `cancelJob` for a job taken on a Bridge, whose record's `## Taken` `by:` is the
Bridge's name (MOD-job-ledger, Data). The CI and tab routes are ITM-535's.
- **`liveState`.** From `bridgeJobs(bridge)`, the job with the record's id:
  - `running` while its `state` is `running`;
  - `usage` its `usage`;
  - `known: false` where the Bridge lists no such job.
  A Bridge missing from `bridges`, or one that does not answer, gives `reachable: false` with the client's reason, never
  an error.
- **`jobLog`.** `{ stream }`, an async iterable that asks `bridgeJobLog(bridge, id, from)` from line 0, yields each
  line, and asks again from `next` until `ended`.
- **`cancelJob`.** `cancelOnBridge(bridge, id)`. Where `confirmed`, it appends the end `cancelled` with `appendToRecord` on
  the head read, and returns `cancelled`. Otherwise it returns `cancelling` and appends nothing.

One existing test's expected result changes: TST-535010 (`tests/runtimes-live-state.test.mjs`). It expects a Bridge job's
`liveState` to be `reachable: false` with "the Bridge's jobs are not read yet", and `jobLog` and `cancelJob` to fail with
`NotSupported`. Under this item it expects the outcome above. No other test changes.

## Acceptance

- Against a fixture Bridge and a fixture host, each of the three gives what the outcome names for a running job, an
  unknown job and an unreachable Bridge. A confirmed cancel appends exactly one end `cancelled`.
- The first commit holds only the tests, and CI is red on it.
- Each test states its expected values in its own text.
