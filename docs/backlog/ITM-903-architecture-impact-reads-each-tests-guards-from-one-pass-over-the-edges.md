---
id: ITM-903
title: architectureImpact reads each test's guards from one pass over the edges
level: module
realises:
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - UC-023
modules:
  - MOD-trace-graph
builds_on:
  - ITM-880
tests:
  - unit
origin:
  - akmaier's request of 2026-10-18 to analyse the page loads, answered in docs/measurements/2026-10-18_page-loads-once-per-commit.md
---
# ITM-903 architectureImpact reads each test's guards from one pass over the edges

**REGISTER**

## Outcome

`architectureImpact` (`src/trace-graph/derive.mjs`) builds the `guards` of each test it lists by scanning all edges of the
graph once for each such test. On Agent M's own repository at `dccd7cc3` that is 29,266 edges for each of the tests that
exercise an affected module: 139 ms for one changed file, 2.0 to 2.4 s for the 16 calls of the architecture's Review all, 64 %
of that page with a token (measurement, §2 and §3). A stored graph does not touch it.

The result stays exactly as it is: the same `ArchitectureImpact`, the same order. The measurement's scratch run with the
guards of all listed tests taken from one pass over the edges gave 216 ms for the 16 calls and the same page text.
No module text changes.

## Acceptance

- `architectureImpact` gives, for a graph and changes, the value it gives now; a unit test compares it with the list built
  edge by edge for a graph with several tests exercising the same module.
- The number of passes over `graph.edges` does not grow with the number of tests: a unit test counts the passes over an
  edge list of a spy, with a counter-proof.
- The first commit holds only the tests, and CI is red on it.
