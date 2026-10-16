---
id: ITM-554
title: The impact list of an architecture change
level: module
realises:
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
modules:
  - MOD-trace-graph
builds_on:
tests:
  - unit
origin:
  - MOD-trace-graph, Interfaces: architectureImpact
  - ITM-507's gate (#602): `src/trace-graph/index.mjs` says "architectureImpact … not built yet", so the draft of an architecture file shows no impact list
---
# ITM-554 The impact list of an architecture change

**REGISTER**

## Outcome

MOD-trace-graph's `architectureImpact(graph, changes) -> ArchitectureImpact`, as its file states it. For changed, added
or removed decision and module files, it gives:
- the modules they concern, and the modules that use an interface they alter or remove, marked as breaking;
- the code files in each affected module's folder;
- the tests that exercise those modules, and the requirements those tests guard;
- the requirements and use cases the files name and no longer name;
- the plan steps and backlog items that name an affected module.

The implementation uses the accepted Graph and ArchitectureImpact of MOD-trace-graph, without changing either
public type. Its readings are:
- Code files come from Graph.files and the affected modules' folder fields, including a removed module's folder from
  the supplied before text. Graph.files already holds every repository path. Code-file nodes and imports are not needed
  to give this output and are not selected; no import engine, moduleRows or moduleOrder is added.
- A decision concerns the modules it designs and those that follow it. A module concerns itself. A removed provided
  interface is absent from the after text; an altered interface remains provided but its declaration in Interfaces
  changes. Compare the supplied before and after declarations, as the existing architecture-impact fixture demonstrates;
  unrelated responsibility prose is not an interface change. Users are found through Graph's uses edges with their
  interface names. Users of an altered or removed interface are breaking, as the accepted module states.
- Tests and their guarded requirements come from exercises and guards edges, and plan steps and backlog items from
  changes edges. Named added/removed requirements and use cases come from the before/after texts. Added and removed
  files use the same accepted change type, with one side null.
- The result is exactly ArchitectureImpact: modules with id/why/breaks; codeFiles; tests with id/guards; named with
  added/removed; and items. No second output format or public API is introduced.

Only src/trace-graph/ and owned unit tests naming MOD-trace-graph change. Existing expected results change: none.
The old docs/assets/traceability.mjs implementation and tests/architecture-impact.test.mjs remain unchanged: their
different legacy public shape is an existing working example, not the new API. Existing traceGraph, requirementImpact,
readMany, code-path selection and graph construction keep their behaviour. No review-page integration is selected.

These readings keep one responsibility in its existing module, reuse the graph's facts instead of storing a second
graph, and leave the unneeded import engine out (AGENTS.md section 2: one responsibility, nothing twice; YAGNI/KISS).

## Acceptance

- For fixture graphs and changes, each part of the list is as stated, with a breaking use marked, and counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Each test states its expected values in its own text.
