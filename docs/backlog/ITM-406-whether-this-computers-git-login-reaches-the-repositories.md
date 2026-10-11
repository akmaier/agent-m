---
id: ITM-406
title: Whether this computer's git login reaches the repositories
level: module
realises:
  - UC-011
  - UC-044
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-312
tests:
  - unit
origin:
  - UC-044 step 3
  - UC-011 3c
---
# ITM-406 Whether this computer's git login reaches the repositories

**REGISTER**

## Outcome

MOD-bridge-jobs' `testAccess(config)`, as its file states it: one fetch of the instance and of each served product with
this computer's own git login, changing nothing; a repository it does not reach named with the reason git gives. The
Bridge's *Test access* (ITM-407) calls it.

## Acceptance

- Unit tests that name MOD-bridge-jobs state, before the code exists, with bare repositories: every repository reached;
  one that refuses named with git's reason; nothing changed in any clone.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-jobs/` and the tests that name MOD-bridge-jobs change.
