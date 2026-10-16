---
id: ITM-535
title: A job's live state, its log and its cancel
level: module
realises:
  - UC-049
  - ONE DASHBOARD SHOWS EVERY JOB
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-runtimes
builds_on:
  - ITM-495
tests:
  - unit
origin:
  - MOD-runtimes, Interfaces: liveState, jobLog, cancelJob
  - sprint team1/43's start decision: ITM-505 follows a handed-over job by them, and none is built (`src/runtimes/index.mjs`)
---
# ITM-535 A job's live state, its log and its cancel

**REGISTER**

## Outcome

MOD-runtimes' `liveState`, `jobLog` and `cancelJob`, as its file states them. None is built yet
(`src/runtimes/index.mjs`). ITM-505, which follows a handed-over job until it ends, builds on them.

Which CI run belongs to a job, settled from the texts. MOD-job-ledger's Data says a record's `## Taken` holds "`by:` the
route that took it — a CI run's address, a Bridge's name, this tab". MOD-workflow-entries writes that address when it takes
a job: `takeJob(…, job.runUrl …)` in `src/workflow-entries/product.mjs`, with `runUrl` built from `GITHUB_RUN_ID`. So:
- **A job no runtime has taken yet.** No `## Taken` part. Its `liveState` is `{ reachable: true, known: false, running:
  false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] }`. `cancelJob` ends it at once with the end
  `cancelled`, and returns `cancelled`.
- **A job taken on CI.** `taken.by` is the run's address. The run is the `CiRun` among `listCiRuns({ workflow })` whose
  `url` is that address; `workflow` is the job workflow's file name (`agent-m-jobs.yml` on GitHub, as `handOverJob`
  names it).
  - `liveState` is `running` while the run's state is `queued`, `running` or `waiting`. `log` is the run's address, and
    `usage` is `null`, since a run reports none until the job's end.
  - `jobLog` gives `{ address }`, the run's address.
  - `cancelJob` asks `cancelCiRun(run.id)`, then reads the run once. Where it is `cancelled`, it appends the end
    `cancelled` and returns `cancelled`; otherwise it returns `cancelling` and appends nothing.
  - A run not found is `{ reachable: true, known: false, … }`.
  - A failure of the host gives `reachable: false` and its reason, never an error.
- **A job taken on a Bridge.** It is ITM-545's, cut off at sprint 45. MOD-bridge-client's `bridgeJobs`, `bridgeJobLog`
  and `cancelOnBridge`, which it needs, are not built yet (ITM-544). Here such a job's `liveState` is `{ reachable: false,
  reason: "the Bridge's jobs are not read yet", known: false, … }`, and its `jobLog` and `cancelJob` give the same reason
  as a `RuntimeError` named `NotSupported`.
- **A job taken by this tab.** `runOnTab` keeps the abort of each job it runs with a record, by the record's id, until
  the job ends.
  - `liveState` is `running` while the tab holds the job, and `known: false` for a job this tab does not run.
  - `jobLog` is `{ gone: true }`, since the tab keeps no log apart from the page.
  - `cancelJob` aborts the job and appends the end `cancelled`.
- **`writtenAfterCancel`.** It is `[]`: MOD-runtimes' Uses gives no way to read a branch's commits.

No existing test's expected result changes. `runOnTab` keeping a job's abort changes nothing it returns or appends.

## Acceptance

- Against a fixture host and a fixture Bridge, each route gives the live state its record and the route report. The log
  is given as it grows, and the cancel ends the job with the end `cancelled`, after which nothing more is written.
- The first commit holds only the tests, and CI is red on it, the stub run recorded where only a missing export makes it
  red.
- Each test states its expected values in its own text.
