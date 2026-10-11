// MOD-group-document — group files and the hierarchy of one kind (docs/architecture/MOD-group-document.md): its
// interface. Of it, ITM-300 builds `GroupTree` and `parseGroupFile`: a group file read into its groups, their members and
// their lines. `GroupMove`, `Hierarchy`, `groupFileText`, `applyMoves` and `hierarchy` are not built yet.
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

export { parseGroupFile } from "./group-file.mjs";
