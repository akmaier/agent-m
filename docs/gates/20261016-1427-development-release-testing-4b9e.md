---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c80762ebf5d214ad95570de69dc62f63e40a15a9
  - https://github.com/akmaier/agent-m/pull/590
date: 2026-10-16 14:27 UTC
---
# Development → Release testing: ITM-535, A job's live state, its log and its cancel

**REGISTER**

## Reason

ITM-535 as cut in sprint team1/45, pull request #590 into `sprint/team1/45`, at head `c80762eb`. developer-sonnet-c wrote
it, as `45.md` assigns. It lists AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `45.md`, MOD-runtimes,
MOD-job-ledger, MOD-repository-hosts and MOD-bridge-client as read in full.

1. **The tests-only commit is red.** `9c3708b2` was pushed alone. Run 38913723028 failed exactly TST-535001–014: ten
   on node (0) and four on node (1). In the stub run, 13 of the 14 fail on behaviour. TST-535001 is red only on the
   missing export, and that is recorded. The code commit also tightens TST-535013, after counter-proof CP4 slipped past
   its first version, and adjusts the shared fixture. These are the item's own new tests, which were already red on the
   base.
2. **CI is green on the head**: run 38915416559, ten of ten jobs.
3. **The changes stay in the item's scope.**
   - The item's module, MOD-runtimes: `src/runtimes/index.mjs`, `ci.mjs` and `tab.mjs`.
   - Three new test files.
   - No Bridge client is imported, and no existing test's expected result changed. Both suites have 28 failures, in
     the same 6 files and 19 tests on the base `d3eb12e2` and on the head.
   - `runOnTab` now keeps its own abort, and after an abort it appends nothing. Neither existing caller changes what it
     appends:
     - `src/prompt-bar/send.mjs:108` passes a signal but no record;
     - `src/review-pages/jobs.mjs:192` passes a record but no signal.
   - Runs of the runtimes tests and the UC-010 and UC-019 release tests under a refusing fetch spy: 139 tests, no request.
4. **The tests name their requirement and module, and each fault is caught.** Each of the ten planted faults (CP1–CP10)
   is caught, and each test states its values in its own text.
5. **The Acceptance holds for the cut item.**
   - Against a fixture host, a CI job is running while its run is queued, running or waiting, and its log is the run's
     address.
   - A cancel asks the run to cancel, reads it once, and appends the end `cancelled` only once the run is cancelled.
   - A tab job is aborted and appends nothing more.
   - A job no runtime has taken ends at once.
   - A Bridge job gives `reachable: false` and `NotSupported`, as the cut states.

## Readings

The developer named four readings that the item does not state. Each is taken as within the texts:
- **A CI run that the server does not list.** `cancelJob` fails with `NotFound { what }` and appends nothing.
  MOD-runtimes appends the end only "once the runtime confirms". Ending at once is for "a job no runtime has taken",
  which this one is not.
- **`jobLog` gives `{ gone: true }` for an unlisted run and for an untaken job.** This is the interface's "that the
  runtime keeps it no longer".
- **A tab job that this tab does not hold is ended at once.** No runtime runs it here, so the end is appended as for a
  job no runtime has taken. If another tab's run of the job ever appended after this end, MOD-job-ledger's
  `appendToRecord` would refuse it, since the record has its end.
- **`listCiRuns` is asked for `agent-m-jobs.yml` on every server.** On GitLab, ITM-546 lets that filter narrow nothing.

## The real host

`liveState` on a CI job gives `reachable: false` with its reason against the real host. `jobLog` and `cancelJob` throw a
`TypeError`, because the host built today has no `listCiRuns`, `cancelCiRun` or `ciRunLog`. This does not hold the gate:
- MOD-runtimes calls these functions as MOD-repository-hosts provides them (`provides` and Interfaces).
- The gap is in that module's build, which ITM-546 registers.
- No code outside `src/runtimes/` calls `jobLog` or `cancelJob` yet.
- A guard in MOD-runtimes would be a second copy of a check that ITM-546 makes unnecessary.
