---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - d64d4bdac1d7ac7d11138732f585e2fc23900b0c
  - https://github.com/akmaier/agent-m/pull/475
date: 2026-10-12 23:24 UTC
---
# Development → Release testing: ITM-463, the recipe of a resource's check on a runner

**REGISTER**

## Reason

ITM-463, pull request #475 by developer-sonnet-b into `sprint/team1/25`, head `d64d4bd`. The condition that does not
hold: an endpoint or an agent reached by `runner:<label>` is served by the recipe, where the item's Acceptance refuses
"a resource that is not compute reached by a runner" by name — an endpoint or an agent is not compute —, and
MOD-resource-list's file gives a check job on a runner's label to "compute reached by a runner" alone, an endpoint or an
agent being checked by "a harmless probe through the Bridge its route names". The recipe follows `checkPlan`, which
ITM-461 built to plan a check job for any resource on a runner's route; that `checkPlan` reaches further than the file
for an endpoint or an agent on a runner is noted for the review. The rework refuses every resource but compute on a
runner.

The rest was read too and stands for the rework: the tests-only commit was red (run 38321163963), `e5356fc` was red on
the NO SERVER check, which read `import(` in a JSDoc type, and `d64d4bd` is green (run 38321640862); 31 faults are
killed; the resource from `params.resource`, the product's list before the instance's; the refusals by name; a secret
named, never its value. The harmless requests named from SLURM's `sinfo` and OpenAI's "List models" are read again at
the rework's gate, as they bear on the endpoint and agent cases this condition takes out.
