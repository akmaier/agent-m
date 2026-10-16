---
id: ITM-536
title: A product's facts, read once
level: module
realises:
  - UC-032
  - UC-049
  - STATUS IS DERIVED FROM THE RECORDS
modules:
  - MOD-progress-measures
builds_on:
  - ITM-522
  - ITM-516
tests:
  - unit
origin:
  - MOD-progress-measures, Interfaces: Facts, productFacts (accepted at 83312204 with containsCommit and undecidedHeads)
  - sprint team1/43's start decision: ITM-505 lets a hand-over start only where `startable` finds no reason on the states
    `itemStates` derives from the facts `productFacts` reads, and `productFacts` is not built
---
# ITM-536 A product's facts, read once

**REGISTER**

## Outcome

MOD-progress-measures' `Facts` and `productFacts`, cut to what MOD-work-plans' `itemStates` and `startable` and
MOD-product-process' `holdsRole` need. That is what ITM-505 asks before a hand-over starts (MOD-prompt-bar).

`productFacts` reads once, from the product's default branch through its host:
- the approval statuses (MOD-approvals);
- the change queues (MOD-spec-changes);
- the job records as `JobRow`s, through MOD-job-ledger;
- the pull requests (`listPullRequests`);
- the gate records and their states (`gateStates`);
- the declaration's workflow (`workflowOf`);
- the backlog or plan items and the plan order;
- the sprint records and the role assignments;
- the instance's participants.
It computes `held` with `heldItems`, asking `containsCommit` for exactly the heads `undecidedHeads` names.

Cut off, for later items that need them: the trace graph, the CI runs of the head, the tags, the test facts, the live
states of running jobs, and the stage measures. The facts it reads carry them as `"unknown"` where `Facts` has the field,
never a guess.

## Acceptance

- Against a fixture product and instance, `productFacts` reads the facts its file names once each, and `held` is computed
  with `containsCommit` for exactly the heads `undecidedHeads` names.
- Each test states its expected values in its own text.
