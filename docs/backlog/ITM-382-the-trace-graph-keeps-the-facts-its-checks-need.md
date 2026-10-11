---
id: ITM-382
title: The trace graph keeps the facts its checks need
level: module
realises:
  - UC-007
  - UC-018
  - UC-019
  - THE TRACEABILITY MATRIX IS DERIVED
  - A REQUIREMENT SHOWS WHAT TRACES TO IT
  - A GROUP CARRIES NO IDENTIFIER
modules:
  - MOD-trace-graph
builds_on:
  - ITM-305
  - ITM-298
  - ITM-380
tests:
  - unit
origin:
  - UC-007 step 5
  - UC-019 step 7
---
# ITM-382 The trace graph keeps the facts its checks need

**REGISTER**

## Outcome

MOD-trace-graph's `traceGraph`, as its file's Data and its `Graph` type now state them, extending what ITM-305 built: a
module's node keeps its `folder` and the interfaces it `provides`, a plan step's or backlog item's node its `level` and
`tests`, a requirement's node the items of its source as written; a `uses` edge keeps the `interface` it names; a
group's title is a node of the kind `group`, keyed `<path>:<line>`; the graph keeps `files`, every path of the
`TextSource`, `links`, each Markdown link or autolink an artifact writes with its target, path and line, and
`positions`, the references by position that MOD-identifiers' `positionalReferences` finds (ITM-298). Test files are
told with `isTestFile` (ITM-380) and each node's blob with `blobSha`. The edge `source` goes: a requirement's sources
stand on its node, and `tracesTo` gives them from there. `graphFindings` and `selfSufficiencyFindings` (ITM-306) are not
part of this item.

## Acceptance

- Unit tests that name MOD-trace-graph state, before the code exists, over a fixture repository: each new field on the
  nodes of its kind and `null` on the others; a `uses` edge's interface; a group's node; every path in `files`; a
  Markdown link and an autolink in `links`; a step reference in `positions`; a requirement's sources on its node and in
  `tracesTo`, and no `source` edge; ITM-305's cases unchanged in what they assert.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/trace-graph/` and the tests that name MOD-trace-graph change.
