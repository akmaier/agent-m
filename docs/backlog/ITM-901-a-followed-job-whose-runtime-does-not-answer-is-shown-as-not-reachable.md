---
id: ITM-901
title: A followed job whose runtime does not answer is shown as not reachable
level: module
realises:
  - UC-049
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-881
tests:
  - unit
origin:
  - found by po-opus-b at #863's gate
---
# ITM-901 A followed job whose runtime does not answer is shown as not reachable

**REGISTER**

## Outcome

A runtime that cannot be reached gives "`reachable: false` and its reason, never an error" (MOD-runtimes.md:187,
`liveState`, unchanged since its accepted text). MOD-prompt-bar follows a handed-over job "by its record and `liveState`
until it has ended" (MOD-prompt-bar.md:194). UC-036 1a: the source is shown as *not reachable*, with the reason. ITM-881
(#863) made `followJob` say "The runtime is not reachable: <reason>" when the live state is unreachable. But the next
step of the same poll replaces that text whenever the runtime is still unreachable.

**The path, on `sprint/team2/89` at `99d95c97`.**
- `src/prompt-bar/follow.mjs:83`: `liveState` gives `{ reachable: false, reason }`.
  - For CI: `src/runtimes/index.mjs:91-98` → `runOfAddress` → `src/runtimes/ci.mjs:241` `host.listCiRuns` fails, and
    the failure is caught.
  - For a Bridge: `index.mjs:84-90` → `bridgeNamed` throws, and the throw is caught.
- `follow.mjs:93` sets `view.problem` to "The runtime is not reachable: <reason>".
- `follow.mjs:95` then calls `logOf(bridges)`, and `:51` calls `jobLog` (`src/runtimes/index.mjs:107`).
  - It asks the same runtime: `:111` `runOfAddress`, so `listCiRuns` again, or `:109` `bridgeNamed`.
  - It throws, since a CI job "fails as the host fails" (`index.mjs:105`).
- `follow.mjs:96-97`, the poll's catch, replaces the problem with "The job could not be followed. <name>: <reason>".
- Actual: "The job could not be followed. Error: Unreachable: the server gave no answer". Expected: "The runtime is not
  reachable: Unreachable: the server gave no answer".

**Verified on a real case**, on `main` at `740aa6a5` and on `sprint/team2/89` at `99d95c97`, with the script
`kp89-new.mjs` in the Product Owner's scratchpad. `followJob` was run through a host that reads this repository's job
records.
- The record `JOB-20261011-2300-f922`, taken on the Bridge "po-sol, manual Codex CLI session", which this browser does not
  keep, shows "The job could not be followed. NotFound: no Bridge named po-sol, manual Codex CLI session is among the
  Bridges".
- The same record, taken by a CI run's address, through a server that fails every call, shows "The job could not be
  followed. Error: Unreachable: the server gave no answer".
- The known positive is the same call through a server that fails only its first call: "The runtime is not reachable:
  Unreachable: the server gave no answer". TST-881002 uses this fixture.

The fix stays within MOD-prompt-bar. While the live state is unreachable, the poll does not ask the job's log, since the
runtime has just not answered. Once a later poll finds the runtime reachable, the log is asked as now. A failure of
`jobLog` on a reachable runtime is still shown as "The job could not be followed".

## Acceptance

- A unit test naming MOD-prompt-bar: a followed job, taken on CI and not ended, whose server fails every call, shows
  state `running` and the problem "The runtime is not reachable: <reason>". A job taken on a Bridge that this browser
  does not keep shows "The runtime is not reachable: <the NotFound reason>". Expected values literal.
- TST-881002 and the other tests of `tests/prompt-bar-follow.test.mjs` stay green with no expected result changed.
- The first commit holds only the test, and CI is red on it. No stub is committed.
- Only `src/prompt-bar/follow.mjs` and tests naming MOD-prompt-bar change.
