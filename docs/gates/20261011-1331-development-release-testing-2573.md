---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - b540be75e9c7c250f2da47fdfed48789d0c449e6
  - https://github.com/akmaier/agent-m/pull/354
date: 2026-10-11 13:31 UTC
---
# Development → Release testing: ITM-307

**REGISTER**

## Reason

ITM-307, pull request #354 by developer-sonnet-b into `sprint/team1/15`, on head `b540be7`, against the item and
MOD-trace-graph's accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `c5aee27`, holds only `tests/trace-graph-impact.test.mjs`, and CI was red on it (run 38142933860):
  node failed on exactly its 4 tests — 1350 tests, 4 failed, 8 todo.
- CI is green on the head (run 38143188768): node 1350 tests, 0 failed; python 441 tests, OK.
- Only MOD-trace-graph's folder — `requirementImpact` in `derive.mjs`, the export, the type `ImpactEntry` and the header
  of `index.mjs` — and the new test whose header names the module change; no existing test or expected result changes,
  and the model in `docs/assets/traceability/graph.mjs` stays.
- The 4 new tests name `A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST` and MOD-trace-graph, with 20
  counter-proofs.
- The Acceptance holds: a requirement named by a use case, a decision, an item and a test gives those four rows with
  path, line and edge; a requirement nothing names, and a name that is no requirement, give none.

Tests 3 and 4, beyond the Acceptance, stay: they guard what the Outcome lists besides its four — a module's `realises`
and a text that names the requirement — and one order of the rows, whatever order the repository lists its files in.
Noted for the sprint's review, no condition of this gate: the four readings the pull request names — a row for each
place, the order use cases, decisions, modules, items, tests, a text that names it as the graph's `names` edges with
none from SPEC.md, and a name no node carries listing what names it.
