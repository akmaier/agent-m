---
id: ITM-307
title: The impact list of a requirement
level: module
realises:
  - UC-005
  - UC-006
  - UC-018
  - A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
modules:
  - MOD-trace-graph
builds_on:
  - ITM-305
tests:
  - unit
origin:
  - UC-005 step 8
  - UC-006 3b
  - UC-018 step 4, 3a
---
# ITM-307 The impact list of a requirement

**REGISTER**

## Outcome

MOD-trace-graph's `requirementImpact(graph, name)`, as its file states it: every artifact that names the requirement — a
use case's `realises`, a decision's `forced_by`, a module's or an item's `realises`, a test's `guards`, a text that
names it — as `ImpactEntry` rows with path, line and how it names it. MOD-spec-changes (ITM-339, ITM-341, ITM-338) and
the requirement editor (ITM-359) call it. `requirementImpact` in `docs/assets/traceability/graph.mjs` is the model and
stays. `architectureImpact` and `coverageGaps` are not part of this item.

## Acceptance

- Unit tests that name MOD-trace-graph state, before the code exists: a requirement named by a use case, a decision,
  an item and a test yields those four rows with path, line and edge; a name nothing names yields none.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/trace-graph/` and the tests that name MOD-trace-graph change.
