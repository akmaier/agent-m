// MOD-group-document — group files and the hierarchy of one kind (docs/architecture/MOD-group-document.md): its
// interface. Built so far: `GroupTree` and `parseGroupFile`, a group file read into its groups, their members and their lines;
// `GroupMove` and `applyMoves`, the moves a person makes applied in order to a new tree; `Hierarchy` and `hierarchy`, the
// tree with every item of the kind in its one place and the findings. `groupFileText` is not built yet.
//
// Module: MOD-group-document
//
// It belongs to the artifact model (ARC-048). It runs unchanged in a browser and in Node, keeps nothing between calls,
// and performs no input or output: its callers give it the text of `docs/groups/<kind>.md`.

/**
 * A member of a group file: an item of its list that is an identifier — a requirement's name for requirements —, and the
 * line it stands on, counted from 1.
 * @typedef {{ id: string, line: number }} Member
 */

/**
 * A group of a group file: its title — a group carries no identifier —, the line the title stands on, counted from 1, and
 * the groups and members it holds, each in the order they stand in the file.
 * @typedef {{ title: string, line: number, groups: Group[], members: Member[] }} Group
 */

/**
 * A group file as read: its kind, which comes from its path, and the groups and members at the top of its list, each in
 * the order they stand in the file.
 * @typedef {{
 *   kind: "requirements" | "use-cases" | "architecture" | "modules" | "tests",
 *   groups: Group[],
 *   members: Member[],
 * }} GroupTree
 */

/**
 * One move a person makes to a group file. A group is named by the path of its titles from the top, `[]` being the top level
 * itself: `create` makes a group titled `title` in the group `in`; `rename` gives the group `group` the title `title`; `move`
 * puts the member `item` into the group `to`; `move-group` puts the group `group`, with all it holds, into the group `to`;
 * `delete` removes the group `group`, which must be empty; `lift` moves what the group `group` holds up into its parent.
 * @typedef {{ op: "create", title: string, in: string[] }
 *   | { op: "rename", group: string[], title: string }
 *   | { op: "move", item: string, to: string[] }
 *   | { op: "move-group", group: string[], to: string[] }
 *   | { op: "delete", group: string[] }
 *   | { op: "lift", group: string[] }} GroupMove
 */

/**
 * The hierarchy of the items of one kind: the tree with every item in its one place, the identifiers of the items that no
 * group named and that stand at the top level of the tree now, the identifiers of the members that match no item, and the
 * findings, each a MOD-text-tools `Finding`. A group the moves create, and a member placed for an item the file did not
 * list, stand at line 0.
 * @typedef {{
 *   tree: GroupTree,
 *   ungrouped: string[],
 *   unknown: string[],
 *   findings: Finding[],
 * }} Hierarchy
 */

export { parseGroupFile } from "./group-file.mjs";
export { applyMoves } from "./moves.mjs";
export { hierarchy } from "./hierarchy.mjs";
