---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - c574783df39ac0097aa3cdf20bc86bcaa8bd1b23
  - https://github.com/akmaier/agent-m/pull/470
date: 2026-10-12 23:11 UTC
---
# Development → Release testing: ITM-462, paid services, and the routes that reach a resource

**REGISTER**

## Reason

ITM-462, pull request #470 by developer-sonnet-b into `sprint/team1/25`, head `c574783`. The first commit `43e4051`
holds only `tests/resource-list-services.test.mjs`, and CI was red on it (run 38320333351): its four tests fail, and no
other test does. CI is green on `c574783` (run 38320540956, 2291 tests, 0 failures). The code changes only
`src/resource-list/index.mjs`, the interface the Parts name for `paidServices` and `reachableBy`; the new test names
MOD-resource-list and its guards, and 18 faults are recorded, all killed. The Acceptance holds.

The readings weighed: a service — an endpoint or an agent — without its Paid mark is listed as paid, the reading that
keeps a commit-level test from reaching it (`COMMIT TESTS CALL NO PAID SERVICE`), while data is listed only with a mark,
as the module file lists "data with a Paid mark"; `reachableBy` gives a route only in the forms `bridge <name>` and
`runner:<label>`, which MOD-runtimes' `routesFor` reads, and a test pins that against `routesFor`; a repository, data, a
model, and an endpoint or agent reached at its own address are reached by no Bridge or runner.
