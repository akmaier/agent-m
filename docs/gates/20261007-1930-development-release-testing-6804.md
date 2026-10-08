---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2b6f35e6444550b55563a09df00d3843c67a0904
  - https://github.com/akmaier/agent-m/pull/197
date: 2026-10-07 19:30 UTC
---
# Development → Release testing: ITM-249

**REGISTER**

## Reason

ITM-249, the tests that guard a requirement: pull request #197 by developer-sonnet-b, on head `2b6f35e`, branched from
`sprint/12` at `ba14e4d`, which holds ITM-248, the item it builds on.
- The first commit, `a435c5a`, holds only `tests/trace-graph-guards.test.mjs`, and CI was red on it (run 37673109003).
  The node job failed on exactly that file, whose module did not exist yet, beside the suite's known todo marks.
- CI is green on the head (run 37674106718): node 909 tests, 0 fail, 11 todo; python 396, OK. The third commit,
  `2b6f35e`, changes only a comment.
- Only `src/trace-graph/` — `index.mjs`, `build.mjs` and `derive.mjs`, among the module's Parts — and the new test, whose
  header names MOD-trace-graph, changed. The code imports `parseSpec` and `testDeclarations` only, which the module's file
  lists among what it uses.
- The four new tests name what they guard and the module, and each has its counter-proof recorded. Run on the head with
  the fault planted, each turns its test red: no requirement nodes; an edge `guard`; an unread file left out silently;
  the tests unsorted; and only the first guarded name given an edge.
- The Acceptance holds, on a fixture repository:
  - the requirements of its `SPEC.md` and the tests of its test files are nodes, with an edge `guards` from each test to
    each name it guards;
  - a file that cannot be read is listed in `unread` with the reason;
  - `tracesTo` gives the tests that guard a requirement, and none for a requirement no test guards.
