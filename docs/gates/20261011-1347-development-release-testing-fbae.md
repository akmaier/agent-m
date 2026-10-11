---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 313d0686e47a813b340da5b9e20d1b97a4e3760f
  - https://github.com/akmaier/agent-m/pull/359
date: 2026-10-11 13:47 UTC
---
# Development → Release testing: ITM-308

**REGISTER**

## Reason

ITM-308, pull request #359 by developer-sonnet-b into `sprint/team1/15`, on head `313d068`, against the item and
MOD-trace-graph's accepted file as they stand on the sprint's branch. All five points hold:
- The first commit, `704db80`, holds only `tests/trace-graph-gaps.test.mjs`, and CI was red on it (run 38144026176):
  node failed on exactly its 7 tests — 1370 tests, 7 failed, 8 todo.
- CI is green on the head (run 38144333373): node 1370 tests, 0 failed, ITM-306's 14 tests among the passed; python
  441 tests, OK.
- Only MOD-trace-graph's folder — `coverageGaps` and `unmatchedNames` in `derive.mjs`, the export, the type `Gaps` and
  the header of `index.mjs`, and `checks.mjs` — and the new test whose header names the module change; no existing test
  or expected result changes, and the model in `docs/assets/traceability/graph.mjs` stays. In `checks.mjs`,
  `graphFindings` takes the predicate `unmatchedNames` in place of its own copy, the same condition — a `realises`,
  `forced_by` or `guards` whose name is neither a requirement nor a use case —, so its behaviour stays.
- The 7 new tests name `UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN`, with UC-007 and, where they concern it,
  `A USE CASE REALISES NAMED REQUIREMENTS`, and MOD-trace-graph, with 28 counter-proofs.
- The Acceptance holds, on a fixture of a SPEC, two use cases, a module file and a test: a requirement no use case
  realises; a use case that realises nothing; an unknown name with the use case and the line that name it; a
  requirement no test guards.

Tests 5 to 7, beyond the Acceptance, stay: they guard the module file's "once modules and tests exist", one order of the
lists whatever order the repository lists its files in, and that a name a text merely writes is no unknown name. Noted
for the sprint's review, no condition of this gate: the seven readings the pull request names, among them an unknown
name as one that matches neither a requirement nor a use case, direct edges only, and the module and test lists empty
while the graph holds no module or no test.
