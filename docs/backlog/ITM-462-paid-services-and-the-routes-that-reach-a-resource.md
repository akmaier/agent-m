---
id: ITM-462
title: Paid services, and the routes that reach a resource
level: module
realises:
  - UC-040
  - UC-026
  - COMMIT TESTS CALL NO PAID SERVICE
  - A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
modules:
  - MOD-resource-list
builds_on:
  - ITM-460
tests:
  - unit
origin:
  - UC-040 step 9
  - MOD-resource-list, Interfaces: paidServices, reachableBy
---
# ITM-462 Paid services, and the routes that reach a resource

**REGISTER**

## Outcome

MOD-resource-list's `paidServices(resources)` and `reachableBy(resources)`, as its file states them: every service the
product calls — each endpoint and agent, and data with a Paid mark —, each marked paid or free, for MOD-result-records'
recipe `test-selection`; and, for the resources a job needs, the routes that reach them, `bridge <name>` or
`runner:<label>`, which its callers hand to MOD-runtimes' `routesFor`. Its callers are not part of this item.

## Acceptance

- Unit tests that name MOD-resource-list state, before the code exists, on a fixture list: each endpoint, agent and
  paid data listed with its mark and nothing else; a resource on a Bridge and one on a runner given their routes, and a
  repository, read on its host, given none; the routes given in the form `routesFor` reads.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/resource-list/` and the tests that name MOD-resource-list change.
