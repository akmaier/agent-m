---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7747f75154f3d9c64eaa6ed013c9371828fabb6d
  - https://github.com/akmaier/agent-m/pull/351
date: 2026-10-11 12:50 UTC
---
# Release testing → Sprint review: sprint team1/14

**REGISTER**

## Reason

Sprint team1/14, ended by the Product Owner (`e5f2c1b`), on `sprint/team1/14` at `7747f75`. All eleven items of its
selection are done — ITM-303, ITM-306, ITM-330, ITM-378 to ITM-382, ITM-386, ITM-387 and ITM-388 (#337 to #343, #345,
#347, #348 and #350) —, each merged on the head its gate passed, with no change of the merge's own.

**The release tests of the selected items.** The start decision selected none, each of the eleven names only unit
tests, and none adds behaviour a release test must reach yet:
- On `7747f75`, and on its merge with `main`, no file outside `src/job-runner/` imports MOD-job-runner, so the six checks
  reach a person only through the pages that start a job. Of the other modules' new functions, `artifactSchemaOf`,
  `classifyCandidates`, `applyMoves`, `hierarchy`, `graphFindings` and `selfSufficiencyFindings` are called outside
  their module only by MOD-job-runner, and `isTestFile` also by MOD-trace-graph; the `applyMoves`, `hierarchy` and
  `tracesTo` under `docs/assets/` are the dashboard's own.
- Two changes reach a page, as the start decision named: `parseSpec` reads and names a requirement whose name is not in
  capitals (ITM-379), called by MOD-trace-pages, MOD-product-process and MOD-release-evidence; and the trace graph keeps
  the facts its checks need (ITM-382), read through `traceGraph` and `tracesTo` by the release panel's report. The sprint
  changes no test that names one of those three modules, and they are green.

**Written by a participant other than the implementer.** No release test is part of this increment; developer-sonnet-e,
to whom the start decision gave no item, is named in none of the sprint's 36 commits and stays free to write the release
tests of these use cases.

**Green on the sprint branch.** Run 38140028170, on #351's merge into `main` at `c2a03e8`: node 1305 tests, 0 failed,
8 todo; python 441 tests, OK.
