---
id: ITM-723
title: The recipe items-of-kind
level: module
realises:
  - UC-021
  - ARTIFACTS ARE ARRANGED IN NESTED GROUPS
  - THE PAGE NAMES WHERE IT SENDS
modules:
  - MOD-artifact-edits
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-723 The recipe items-of-kind

**REGISTER**

## Outcome

UC-021 1b sends a participant "titles and identifiers of the items, with their text for requirements". The kind
`propose-groups` names the recipe `items-of-kind` (MOD-job-catalogue's table), which MOD-artifact-edits'
`editStrategies` states and does not build (`src/artifact-edits/strategies.mjs:2`: "the recipe `items-of-kind` (UC-021)
is not built yet").

This item builds it as the file states it: the title and identifier of every item of the kind the job's parameters name,
the whole text of each requirement when the kind is requirements, and the current group file. The check `group-rules`
(ITM-388) and the kind's data files (ITM-396) are built.

## Acceptance

- With a fixture snapshot, for each of the five kinds: every item with its title and identifier, a requirement with its
  text, and the group file as it stands — none when the product has none.
- `prepareJob` of `propose-groups` finds the recipe, with no strategy missing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): (b), a module text change only

The question sprint 86 left for akmaier (`docs/backlog/sprints/team2/86.md:80-85`): may MOD-artifact-edits use
`MOD-trace-graph.traceGraph` and `MOD-spec-document.parseSpec` for the recipe? It is no question for akmaier
(AGENTS.md §6a.6): a missing Use is a change of the module's text, drafted for his acceptance.

- **What is missing.** MOD-artifact-edits' Uses (`docs/architecture/MOD-artifact-edits.md:8-30`, :155-166) name
  `readDocument` and `specSkeleton`, and neither `traceGraph` nor `parseSpec`; the same grep finds `specSkeleton` twice
  (the known positive). A requirement's text is `Requirement.rule`, which only `parseSpec` gives
  (MOD-spec-document.md:81-83); the items of a kind are the nodes of `traceGraph`, as the check `group-rules` reads them
  (`src/job-runner/builtins.mjs:41`, `:205-206`, by `ARRANGED[kind]`).
- **The draft**, committed as `c2f0a91e` ("DRAFT for akmaier: …"): MOD-artifact-edits' Uses gain `MOD-spec-document.parseSpec`
  ("the text of each requirement for `items-of-kind`") and `MOD-trace-graph.traceGraph` ("the items of a kind with their
  identifiers and titles, for `items-of-kind`, as the check `group-rules` reads them"). Principles: *nothing twice* — the
  recipe sends the same set of items `group-rules` checks against; *one responsibility* — reading the artifacts stays
  MOD-trace-graph's, parsing the SPEC MOD-spec-document's. No cycle: MOD-trace-graph uses no MOD-artifact-edits.
- **The reading of a title.** A node carries `id` and `title` (MOD-trace-graph.md:129-130); a requirement's node has its
  name as both identifier and title (`src/trace-graph/build.mjs:56`), a test's node no title (`:63`). The recipe sends what
  the node holds.

The item builds on the acceptance of that draft. While team 1's sprint 87 runs, ITM-735 changes MOD-trace-graph, which
the module then uses (`SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES`).
