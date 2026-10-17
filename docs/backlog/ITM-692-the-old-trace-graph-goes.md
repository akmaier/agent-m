---
id: ITM-692
title: The old trace graph goes
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - THE TRACEABILITY MATRIX IS DERIVED
modules:
  - MOD-trace-graph
builds_on:
  - ITM-680
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-692 The old trace graph goes

**REGISTER**

## Outcome

MOD-trace-graph states `moduleRows` and does not build it. The old `docs/assets/traceability/graph.mjs` holds the
only working version. The module builds it. Then `docs/assets/traceability.mjs` and `graph.mjs` go, once the review
views no longer import them. `tests/test_coverage_report.py`, the Check of `EVERY CODE FILE BELONGS TO A MODULE` and
`MODULE GAPS ARE REPORTED, NOT FORBIDDEN`, is rewritten on `traceGraph` and `graphFindings`.

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Noted at ITM-714's gate (sprint team1/73, 2026-10-17, po-opus).** ITM-714 removed `tests/architecture-impact.test.mjs`,
so this item no longer moves it. `docs/architecture/MOD-trace-graph.md:70` still names it among the files taken over.
Taking it out is a module-file change for akmaier, drafted with this item's start.
