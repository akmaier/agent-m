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
products and the Bridge's name from its settings (ITM-291), watched at their interval unless paused; *Pause* takes no
new job while running ones go on; *Quit* names the running jobs, which end as cancelled. The window's *Agents* view
(UC-044), mail and updates are not part of this item.

## Acceptance

- Component tests that start the source-folder Bridge as ITM-276's tests do, with fixture agent executables, a served
  bare repository and a fixture job record: a job handed over through the API with the pairing token runs, and its
  results land open on the served repository with its end record; without the token nothing reaches the agent; the
  server listens on loopback only; while paused a hand-over answers `paused`; quitting during a job ends it as
  cancelled. They run only where a virtual screen exists, as `tests/desktop-shell.test.mjs` does.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only the folders of MOD-desktop-shell, MOD-bridge-jobs and MOD-bridge-http and the tests that name one of them
  change.
