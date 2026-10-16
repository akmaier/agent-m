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

MOD-progress-measures' `Facts` and `productFacts`, as its file states them: everything about a product read once — its
default branch, the trace graph, the records, the declaration with its model, the plan or backlog and the sprints, the
gate and job records with their live state, the pull requests (with `containsCommit` for the heads `undecidedHeads`
names), the CI runs of the head, the tags and the test facts. The work-plan states and holds are computed from them.
None of it is built (`src/progress-measures/index.mjs`). ITM-505 needs it for `startable`, and the main page's progress
needs it as well.

The start decision that selects it may cut it by the facts a caller needs first, naming what each cut leaves.

## Acceptance

- Against a fixture product and instance, `productFacts` reads the facts its file names once each, and `held` is computed
  with `containsCommit` for exactly the heads `undecidedHeads` names.
- Each test states its expected values in its own text.
