---
id: ITM-463
title: The recipe of a resource's check on a runner
level: module
realises:
  - UC-040
  - A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
  - A RESOURCE CREDENTIAL GOES ONLY TO ITS RESOURCE
modules:
  - MOD-resource-list
builds_on:
  - ITM-461
tests:
  - unit
origin:
  - UC-040 step 7
  - MOD-resource-list, Interfaces: resourceStrategies
---
# ITM-463 The recipe of a resource's check on a runner

**REGISTER**

## Outcome

MOD-resource-list's `resourceStrategies` in `strategies.mjs`, as its file states it: the recipe `resource-check`, which
gives, as one part, the resource a job names and the harmless request to make on the runner its check plan names. The
check job's kind, its route and its page are not part of this item.

## Acceptance

- Unit tests that name MOD-resource-list state, before the code exists, with a fixture job context: the recipe's one
  part naming the resource and its harmless request; a resource that is not compute reached by a runner refused by
  name; no secret's value in the part.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/resource-list/` and the tests that name MOD-resource-list change.
