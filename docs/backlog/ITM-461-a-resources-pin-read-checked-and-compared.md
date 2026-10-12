---
id: ITM-461
title: A resource's pin read, its check planned, and a newer state found
level: module
realises:
  - UC-040
  - A RESOURCE IS PINNED TO AN EXACT STATE
  - A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
  - A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
modules:
  - MOD-resource-list
builds_on:
  - ITM-460
tests:
  - unit
origin:
  - UC-040 steps 3 and 7, 3b
  - MOD-resource-list, Interfaces: Pin, readPin, checkPlan, newerState
---
# ITM-461 A resource's pin read, its check planned, and a newer state found

**REGISTER**

## Outcome

MOD-resource-list's `Pin`, `readPin(resource, readers)`, `CheckPlan`, `checkPlan(resource)` and `newerState(resource,
upstream)`, as its file states them: the current state upstream read through the readers the caller hands in — a
repository host's head, the Hub's revision —, failing as they fail, a Hub that does not answer named; how a resource is
checked — read on its host for a repository, data or a model, a harmless probe through the Bridge its route names for
compute reached by a Bridge and for an endpoint or agent, a check job on the runner's label for compute reached by a
runner —; and whether a newer state exists, moving nothing.

## Acceptance

- Unit tests that name MOD-resource-list state, before the code exists, with fake readers and no request: each kind's
  pin read through its reader, and a reader's failure passed on by name; each kind's and route's check plan, the Bridge
  and the runner named from the route; a newer state found and the resource's own pin left as it was, an equal state
  not newer.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/resource-list/` and the tests that name MOD-resource-list change.
