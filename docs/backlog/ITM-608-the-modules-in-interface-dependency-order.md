---
id: ITM-608
title: The modules in interface dependency order
level: module
realises:
  - A RUN FOLLOWS THE MODULES' INTERFACES
modules:
  - MOD-trace-graph
builds_on:
  - ITM-305
  - ITM-306
tests:
  - unit
origin:
  - MOD-trace-graph, Interfaces: moduleOrder
  - ITM-554 explicitly leaves moduleOrder outside its architectureImpact scope
---
# ITM-608 The modules in interface dependency order

**REGISTER**

## Outcome

Implement the accepted pure interface moduleOrder(graph: Graph) -> { order: string[] } | { cycle: string[] }
of MOD-trace-graph. Every module stands after the modules whose interfaces it uses; when a cycle exists,
the result names the modules of a cycle instead of an order. Use the existing Graph's module nodes and
uses edges, including edges whose target names an interface such as MOD-b.read.

Only src/trace-graph/ and new owned unit tests naming MOD-trace-graph change. Reuse the existing graph
and accepted result shapes. Do not add code/import graph construction, moduleRows, compareGraphs,
run-planner or page integration, a new public type, or a new public interface. Existing expected results
change: none. In particular, TST-554001 in tests/trace-graph-architecture-impact.test.mjs continues to
prove that architectureImpact needs no code nodes or code reads. Existing traceGraph and architectureImpact
behaviour stays unchanged. No ordering between unrelated modules is required by this item.

One responsibility stays in its existing module; graph facts are reused instead of duplicated, and only
the already accepted missing operation is built (AGENTS.md section 2: one responsibility, nothing twice,
YAGNI/KISS).

## Acceptance

- Through the public export, literal fixture expectations demonstrate dependency order and a cycle,
  with isolated modules and an empty graph handled within the accepted result shape.
- Expectations assert the stated dependency constraints, not an invented tie-break between unrelated modules.
- The normal implementation-job tests-first and counter-proof requirements apply; no extra release case is selected.
