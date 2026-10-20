---
id: ITM-367
title: The Bridge runs its agents' jobs
level: subsystem
realises:
  - UC-011
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - ONE DEFINITION, THREE DRIVERS
modules:
  - MOD-desktop-shell
  - MOD-bridge-jobs
  - MOD-bridge-http
integrates: ARC-040
builds_on:
  - ITM-327
  - ITM-276
  - ITM-291
  - ITM-332
  - ITM-336
  - ITM-337
  - ITM-407
tests:
  - component
origin:
  - UC-011 steps 2 to 5
---
# ITM-367 The Bridge runs its agents' jobs

**REGISTER**

## Outcome

The Bridge as a route, composed in MOD-desktop-shell's `compose.mjs` as its file states it: the strategies of the kinds
a Bridge may run registered with the job runner before its first job — MOD-source-register's, MOD-approvals' (ITM-332),
MOD-spec-changes' (ITM-337) and MOD-artifact-edits' (ITM-336); the server's job handlers (ITM-326, ITM-327); the served
products, the agents the Bridge offers with their working folders (ITM-407) and the Bridge's name from its settings
(ITM-291), watched at their interval unless paused; *Pause* takes no new job while running ones go on; *Quit* names the
running jobs, which end as cancelled. Mail and updates are not part of this item.

## Acceptance

- Component tests that start the source-folder Bridge as ITM-276's tests do, with fixture agent executables, one of them
  offered with a temporary working folder, a served bare repository and a fixture job record: a job handed over through
  the API with the pairing token runs in that folder, and its results land open on the served repository with its end
  record; a job for an agent not offered is refused; without the token nothing reaches the agent; the server listens on
  loopback only; while paused a hand-over answers `paused`; quitting during a job ends it as cancelled. They run only
  where a virtual screen exists, as `tests/desktop-shell.test.mjs` does.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/desktop-shell/`, `src/bridge-jobs/`, `src/bridge-http/` and the tests that name one of these modules change.

**Not marked done (sprint team2/98, po-opus-b, on `main` at `3436203a`).**
- What is on `main`: `dcc26e7a` and `607d247a` (team 2's sprint 34), with TST-367001 to 367003
  (`tests/mod-desktop-shell-jobs-composition.test.mjs`, and others).
  - These are unit tests of the composition: settings become the watch configuration, the strategy modules are named, and
    watching starts, pauses, resumes and quits once.
- The Acceptance asks for component tests that start the source-folder Bridge. No single test was found that does this
  with:
  - a job handed over through the API running in the agent's folder, and its results landing on the served repository
    with its end record;
  - the refusals for an agent not offered and without the token;
  - the server on loopback only;
  - `paused` while paused;
  - *Quit* ending a running job as cancelled.
- Parts of this are covered by other items' tests: ITM-1055's Quit, and ITM-276's pause and loopback. Whether together
  they meet this Acceptance is read before the item is selected.
