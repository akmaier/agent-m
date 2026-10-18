---
id: ITM-977
title: A run's next actions — CI first, then the steps in the order of the interfaces
level: module
realises:
  - UC-043
  - A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS
  - A RUN FOLLOWS THE MODULES' INTERFACES
  - A RUN SETS UP CI BEFORE IT IMPLEMENTS
  - A JOB STOPS AT EVERY GATE
  - A JOB GOES ONLY TO A HOLDER OF ITS ROLE
modules:
  - MOD-run-planner
builds_on:
  - ITM-976
  - ITM-843
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-2, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-977 A run's next actions — CI first, then the steps in the order of the interfaces

**REGISTER**

## Outcome

MOD-run-planner.md:89-95 and :101-107, `nextActions(run, facts) -> Action[]`: "while the product has no CI configuration of
Agent M's (`facts.ci.configured` false), start the kind `set-up-ci` and nothing else until its pull request is merged;
start the kind `implement` for every selected step or item that `startable` admits and whose modules use only modules
already done, each on a route of a holder of the implementing role ..., as many as `jobs at once` allows; the steps of a
phase only once the gate before it is recorded; resume a job whose gate has been decided"; "It starts nothing that depends
on a failed job while the others go on, and nothing after a person stopped the run. It starts nothing whose condition
depends on a fact that is `"unknown"` ... `refuse` names the modules of a cycle in the modules' uses, before anything
starts."

This item builds `Action` and that part of `nextActions`. The tests and `finish` are ITM-978, the holds at a limit
ITM-979. `facts.ci`, `schedule` and `resourceNeeds` are `"unknown"` today (`src/progress-measures/facts.mjs:204-205`) until
ITM-843.

## Acceptance

- Unit tests that name MOD-run-planner, with fixture runs and facts:
  - without CI configuration, only `set-up-ci` is started;
  - for modules A → B → C and D, C starts after B and B after A, while D runs alongside, never more than `jobsAtOnce`;
  - a phase's steps wait for the gate before it; a job whose gate is decided is resumed;
  - nothing depending on a failed job starts, the others do; nothing starts after the run was stopped;
  - with `ci` `"unknown"`, nothing whose condition needs it starts;
  - a cycle in the uses gives one `refuse` naming its modules.
- Counter-proof: ordering by identifier instead of by uses fails the A → B → C case.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/run-planner/` and the tests that name MOD-run-planner change.
