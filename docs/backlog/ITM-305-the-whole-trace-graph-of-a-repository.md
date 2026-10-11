---
id: ITM-305
title: The whole trace graph of a repository
level: module
realises:
  - UC-006
  - UC-007
  - UC-018
  - UC-019
  - THE TRACEABILITY MATRIX IS DERIVED
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
modules:
  - MOD-trace-graph
builds_on:
  - ITM-249
  - ITM-298
  - ITM-300
tests:
  - unit
origin:
  - UC-007 steps 1 and 5
  - UC-006 3b
  - UC-018 step 4
---
# ITM-305 The whole trace graph of a repository

**REGISTER**

## Outcome

MOD-trace-graph's `traceGraph` reads the rest of its Data besides `SPEC.md` and the test files: the use cases, the
architecture decisions, the module files, the plan steps and the backlog items through MOD-documents' schemas, and the
group files' titles through `parseGroupFile` (ITM-300), with every edge they state — `realises`, `forced_by`, `designs`,
`follows`, `refines`, `uses`, `changes`, `builds_on`, `source`, `names` — and each node's title and blob; a name a text
writes is found with `identifiersIn` (ITM-298). A file it cannot read is listed in `unread` with its reason, and the
graph holds the others. The impact list (ITM-307), the coverage gaps (ITM-308) and the checks across artifacts (ITM-306)
are derived from it and are not part of this item, nor are code files with their imports (UC-025).

## Acceptance

- Unit tests that name MOD-trace-graph state, before the code exists, on a fixture repository: every node and edge of
  one use case, decision, module file, plan step and item; a group's title read; a malformed use case listed in
  `unread` while the graph still holds the others.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/trace-graph/` and the tests that name MOD-trace-graph change.
