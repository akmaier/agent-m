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

`src/trace-graph/index.mjs` names it as not built, together with the code files and their imports, which it needs for
the affected code files.

**Not ready for a sprint yet.** Its readings are settled before it is selected: what of the graph it reads for code files
and imports, how "alter or remove an interface" is told from the two texts, and the type `ArchitectureImpact`'s fields.

## Acceptance

- For fixture graphs and changes, each part of the list is as stated, with a breaking use marked, and counter-proofs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Each test states its expected values in its own text.
