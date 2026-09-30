---
id: MOD-groups
title: Reads, checks and rearranges the group files that hold each kind of artifact's hierarchy
realises:
  - ARTIFACTS ARE ARRANGED IN NESTED GROUPS
  - A GROUP CARRIES NO IDENTIFIER
  - A GROUP HOLDS ONE KIND OF ARTIFACT
  - AN ITEM HAS ONE PLACE IN ITS HIERARCHY
  - EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN
  - REGROUPING LEAVES THE GROUPED FILE UNCHANGED
  - AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL
  - UC-021
follows:
  - ARC-003
  - ARC-006
  - ARC-020
uses: []
provides:
  - parseGroupFile
  - formatGroupFile
  - groupProblems
  - hierarchy
  - applyMoves
---
# MOD-groups Reads, checks and rearranges the group files that hold each kind of artifact's hierarchy

## Responsibility

The hierarchies of requirements, use cases, architecture decisions, modules and tests, kept in
`docs/groups/<kind>.md` (ARC-020). Only this file changes on a regrouping; no artifact, no SPEC, no
approval. Pure core; the dashboard commits the file directly on the person's click.

**Current state.** No code exists; `docs/groups/architecture.md` and `docs/groups/modules.md` are
written with these decisions as the first group files of Agent M.

## Interfaces

- `parseGroupFile(text) -> tree` — a nested Markdown list: an item that is an identifier (or, for requirements, a name in capitals) is a member, any other item is a group title; nesting by indentation.
- `formatGroupFile(tree, heading) -> text` — the canonical file text; `formatGroupFile(parseGroupFile(t))` equals `t` for a canonical file.
- `groupProblems(tree, kind, known) -> [problem]` — a member of another kind, a member twice, a member that does not exist (with its withdrawal note), a group title that looks like an identifier.
- `hierarchy(tree, items) -> tree` — the groups with every known item placed once; items no group names at the top level, marked *not yet placed*.
- `applyMoves(tree, moves) -> { tree, refused }` — create, rename, move, delete-empty; a move into a group of another kind, or deleting a non-empty group, is refused with its reason.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
