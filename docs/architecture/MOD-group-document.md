---
id: MOD-group-document
title: Group files and the hierarchy of one kind
folder: src/group-document/
realises:
follows:
  - ARC-048
uses:
  - MOD-identifiers.kindOfIdentifier
  - MOD-text-tools.finding
  - MOD-text-tools.Finding
provides:
  - GroupTree
  - GroupMove
  - Place
  - Hierarchy
  - parseGroupFile
  - groupFileText
  - applyMoves
  - placeItems
  - hierarchy
---
# MOD-group-document Group files and the hierarchy of one kind

## Responsibility

It belongs to the artifact model (ARC-048). It owns the group file — the nested groups in which the artifacts of one
kind are arranged (`ARTIFACTS ARE ARRANGED IN NESTED GROUPS`, `EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN`) —,
applies the moves a person makes, gives a new item its first place, and builds the hierarchy in which every item has one
place. A group file is a nested
list, not the common shape MOD-documents interprets, so it keeps a module of its own. It runs in a browser and in Node,
and performs no input or output.

## Parts

- `index.mjs` — the interface.
- `group-file.mjs` — reading and writing a group file.
- `moves.mjs` — the moves, and the first places of new items.
- `hierarchy.mjs` — the hierarchy and its findings.
- **Taken over, outside this folder** (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`; the count in `docs/measurements/2026-10-17_code-outside-every-module.md`). Each file goes as stated, in this module's own implementation jobs:
  - `tests/test_groups.py`: rewritten on this module.

## Data

It keeps nothing. It owns the **group file** `docs/groups/<kind>.md`, one per kind — `requirements`, `use-cases`,
`architecture`, `modules`, `tests`: a title line, one line saying what the file arranges, then a nested list. An item of
the list is either a group, by its title, or a member, by its identifier — a requirement by its name. A group holds
groups and members of the file's kind only (`A GROUP HOLDS ONE KIND OF ARTIFACT`) and carries no identifier (`A GROUP
CARRIES NO IDENTIFIER`); every member stands once (`AN ITEM HAS ONE PLACE IN ITS HIERARCHY`). Two spaces indent each
level.

```text
# Use cases — groups

The hierarchy of the use cases, each member by its identifier.

- Review
  - UC-006
  - UC-008
- Derivation
  - UC-005
  - UC-007
```

## Interfaces

- `GroupTree` — `{ kind: "requirements" | "use-cases" | "architecture" | "modules" | "tests", groups: Group[], members:
  Member[] }`, where `Group` is `{ title: string, line: number, groups: Group[], members: Member[] }` and `Member` is
  `{ id: string, line: number }`: the file as read, top-level members included.
- `GroupMove` — one move a person makes: `{ op: "create", title, in: string[] }`, `{ op: "rename", group: string[], title }`,
  `{ op: "move", item: string, to: string[] }`, `{ op: "move-group", group: string[], to: string[] }`, `{ op: "delete",
  group: string[] }` or `{ op: "lift", group: string[] }` — a group named by the path of titles from the top.
- `Place` — `{ group: string[], new: string | null }`: where a new item is to stand — in the group `group` names by its
  path of titles from the top, `[]` being the top level; with `new`, in a new group of that title standing in `group`.
- `Hierarchy` — `{ tree: GroupTree, ungrouped: string[], unknown: string[], findings: Finding[] }`: every item of the kind
  in its one place, the items no group names — shown at the top level and marked not yet placed (`AN UNGROUPED ITEM IS
  SHOWN AT THE TOP LEVEL`) —, the members that match no item, and the findings.
- `parseGroupFile(path: string, text: string) -> GroupTree` — reads a group file; its kind comes from its path. Throws
  `NotAGroupFile` naming the path when the path is not `docs/groups/<kind>.md` of a known kind. Lines that are no list
  item and no title are kept as they are and do not count.
- `groupFileText(tree: GroupTree) -> string` — the group file in its canonical form; a canonical file read and written
  again is byte for byte the same.
- `applyMoves(tree: GroupTree, moves: GroupMove[]) -> { tree: GroupTree, applied: GroupMove[], refused: { move: GroupMove,
  reason: string }[] }` — the tree with the moves applied in order, as a new tree; the one given is not changed. A move is
  refused, with its reason, when it would put an item of another kind into the tree, delete a group that is not empty,
  create a group whose title is an identifier, or name a group that does not exist. No move deletes an item, renames an
  identifier or changes anything but the group file (`REGROUPING LEAVES THE GROUPED FILE UNCHANGED`).
- `placeItems(tree: GroupTree, places: Array<{ item: string, place: Place }>) -> { tree: GroupTree, placed: Array<{
  item: string, place: Place }>, notApplied: Array<{ item: string, place: Place, reason: string, noGroup: boolean }> }` —
  the tree with each item given its first place, in order, as a new tree; the one given is not changed. A new group is
  created in its group, unless a group of its title already stands there, which is then taken; it is made with the moves
  `create` and `move` of `applyMoves`, so that the two keep one set of rules. A place is not applied, with its reason,
  when its group, or the group a new group is to stand in, does not stand in the tree — `noGroup` is then true —, when a
  new group's title is an identifier, or when the tree already names the item, which keeps the place it has: a place
  gives an item the file does not name its first place and moves nothing, so that no item already in the file is
  regrouped by it. Pure.
- `hierarchy(tree: GroupTree, items: string[]) -> Hierarchy` — the hierarchy of the kind's items, given by the caller from
  the artifacts it read: an error under `AN ITEM HAS ONE PLACE IN ITS HIERARCHY` for a member named twice, and under
  `A GROUP CARRIES NO IDENTIFIER` for a group titled by an identifier; a member that matches no item is listed as
  unknown, not dropped.

## Files

It reads and writes no file; its callers give it the text of `docs/groups/<kind>.md` and commit what it returns.

## Uses

- `MOD-identifiers.kindOfIdentifier` — to tell a member, written by its identifier, from a group's title, and a group
  titled by an identifier.
- `MOD-text-tools.finding` and the type `MOD-text-tools.Finding` — the findings it reports.
