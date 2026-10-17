---
id: ITM-714
title: The impact test is rewritten on the trace graph
level: module
realises:
  - CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT
modules:
  - MOD-trace-graph
builds_on:
tests:
  - unit
origin:
  - ITM-680's draft stop (sprint team1/73), split out of ITM-692 as the start of sprint 73 named
---
# ITM-714 The impact test is rewritten on the trace graph

**REGISTER**

## Outcome

`tests/architecture-impact.test.mjs` names `MOD-traceability`, which has no module file. At `:24` it imports `impactHtml`
from `docs/assets/dashboard/review-views.mjs`, which ITM-680 removes. MOD-trace-graph's Parts take it over:
"rewritten on this module, or removed with the old graph". That is ITM-692's, which builds on ITM-680.

So this part of ITM-692 goes first, as an item of its own, on its own branch, before ITM-680's gate. Its three tests
are rewritten on MOD-trace-graph's interfaces, keeping what they assert about an architecture change's impact list, and
its header names MOD-trace-graph. ITM-692 then no longer moves it.

## Acceptance

- The test imports nothing outside the architecture, its header names MOD-trace-graph, and its three cases pass on the
  base and on ITM-680's draft.
- Each case keeps its expected result. A case that cannot keep it stops the item.
- Its counter-proof: a planted fault in the impact list the trace graph gives fails it.

**Decided at its stop (sprint team1/73, 2026-10-17, po-opus): the three cases are removed (the developer's reading B).**
- **The old values cannot be given.** MOD-trace-graph's `ArchitectureImpact` gives `{ modules: {id, why, breaks}[],
  codeFiles[], tests: {id, guards}[], named: {added, removed}, items }`. It gives none of the per-module code and test
  paths, `kept`, the interface lists, or the reasons naming an interface, and the markup is the review page's.
- **MOD-trace-graph's Parts allow it:** "rewritten on this module, or removed with the old graph". The file imports the old
  graph (`docs/assets/traceability.mjs`) as well as `review-views.mjs`.
- **The requirement stays guarded.** `tests/trace-graph-architecture-impact.test.mjs` names the same Guards line
  (`AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST; UC-023`) and holds TST-554001 to 554010 on the same
  function. The SPEC's Check of that requirement is `tests/review-core.test.mjs`, so no SPEC pointer changes.
- **The new acceptance:**
  - `tests/architecture-impact.test.mjs` is removed;
  - the pull request names the cases of TST-554001 to 554010 that keep each old case's guarded behaviour: case 2's
    order and case 3's unlisted module among them;
  - CI is green on every commit, declared as refactoring.
- **The impact list on the review page** is MOD-review-pages'. ITM-680's gate names the test that shows it beside an
  architecture change.
