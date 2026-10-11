---
id: ITM-308
title: The coverage gaps of requirements and use cases
level: module
realises:
  - UC-007
  - UNREALISED REQUIREMENTS ARE REPORTED, NOT FORBIDDEN
  - A USE CASE REALISES NAMED REQUIREMENTS
modules:
  - MOD-trace-graph
builds_on:
  - ITM-305
tests:
  - unit
origin:
  - UC-007 step 1, 4b
---
# ITM-308 The coverage gaps of requirements and use cases

**REGISTER**

## Outcome

MOD-trace-graph's `coverageGaps(graph)`, as its file states it: the requirements no use case realises and — as far as
the graph holds modules and tests — no module realises and no test guards; the use cases that realise nothing; every
name that matches no requirement, with what names it. The gaps are shown and block nothing. The recipe
`chosen-requirements` (ITM-337) takes its default selection — the requirements no use case realises — from it.

## Acceptance

- Unit tests that name MOD-trace-graph state, before the code exists, on a fixture repository of a SPEC, two use
  cases, a module file and a test: a requirement no use case realises; a use case that realises nothing; an unknown
  name with the use case and line that name it; a requirement no test guards.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/trace-graph/` and the tests that name MOD-trace-graph change.
