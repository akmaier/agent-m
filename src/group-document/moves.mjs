// moves.mjs — the moves a person makes to a group file (MOD-group-document, Parts; Interfaces: GroupMove, applyMoves). Of it,
// ITM-381 builds applyMoves, which applies the moves in order to a new tree and refuses, with a reason, the move it cannot
// make.
//
// Module: MOD-group-document
//
// A group is named by the path of its titles from the top, `[]` being the top level itself. No move deletes an item, renames
// an identifier or touches anything but the tree it is given a copy of; every check of a move comes before its first change,
// so that a refused move changes nothing.

import { kindOfIdentifier } from "../identifiers/index.mjs";

// The kind of identifier the members of each kind of group file are, and how a kind of identifier is named in a reason.
const MEMBERS_OF = { requirements: "requirement", "use-cases": "UC", architecture: "ARC", modules: "MOD", tests: "TST" };
const NAMED = {
  requirement: "a requirement", SRC: "a source", UC: "a use case", ARC: "an architecture decision", MOD: "a module",
  TST: "a test", ITM: "a backlog item", RES: "a resource", JOB: "a job",
};

// The group a path of titles names, the tree itself for `[]`, or null where no group stands there.
function groupAt(tree, path) {
  if (!Array.isArray(path)) return null;
  let node = tree;
  for (const title of path) {
    node = node.groups.find((group) => group.title === title);
    if (!node) return null;
  }
  return node;
}
// A group proper: the top level is no group that a move renames, moves, deletes or lifts.
const groupNamed = (tree, path) => (Array.isArray(path) && path.length ? groupAt(tree, path) : null);
const parentOf = (tree, path) => groupAt(tree, path.slice(0, -1));
const nowhere = (path) => `there is no group "${Array.isArray(path) ? path.join(" / ") : String(path)}"`;

// The title a group is given: the text without the spaces around it, or the reason there is none — a group is named by a title,
// and an identifier is not one (A GROUP CARRIES NO IDENTIFIER).
function titleOf(text) {
  const title = typeof text === "string" ? text.trim() : "";
  if (!title) return { reason: "a group needs a title" };
  if (kindOfIdentifier(title) !== null) return { reason: `"${title}" is an identifier, and a group carries none` };
  return { title };
}

// Takes every place of an identifier out of a node and the groups below it, and returns the members taken, in the order they stood.
function takeMember(node, id) {
  const taken = node.members.filter((member) => member.id === id);
  node.members = node.members.filter((member) => member.id !== id);
  return [...taken, ...node.groups.flatMap((group) => takeMember(group, id))];
}

// One move on a tree it may change: the reason it is refused, or null once it is applied. A group the moves create, and a member
// they place that the file did not list, stand at line 0 — in no line of the file.
function apply(tree, move) {
  switch (move?.op) {
    case "create": {
      const into = groupAt(tree, move.in);
      if (!into) return nowhere(move.in);
      const { title, reason } = titleOf(move.title);
      if (reason) return reason;
      into.groups.push({ title, line: 0, groups: [], members: [] });
      return null;
    }
    case "rename": {
      const group = groupNamed(tree, move.group);
      if (!group) return nowhere(move.group);
      const { title, reason } = titleOf(move.title);
      if (reason) return reason;
      group.title = title;
      return null;
    }
    case "move": {
      const to = groupAt(tree, move.to);
      if (!to) return nowhere(move.to);
      const kind = kindOfIdentifier(move.item);
      if (kind === null) return `"${move.item}" is no identifier`;
      if (kind !== MEMBERS_OF[tree.kind]) return `${move.item} is ${NAMED[kind]}, not ${NAMED[MEMBERS_OF[tree.kind]]}`;
      // An item has one place: it leaves every place it stood in, and keeps the line of the first.
      const [placed] = takeMember(tree, move.item);
      to.members.push(placed ?? { id: move.item, line: 0 });
      return null;
    }
    case "move-group": {
      const group = groupNamed(tree, move.group);
      if (!group) return nowhere(move.group);
      const to = groupAt(tree, move.to);
      if (!to) return nowhere(move.to);
      const holds = (node) => node === to || node.groups.some(holds);
      if (holds(group)) return `the group "${group.title}" cannot be moved into itself or a group inside it`;
      const parent = parentOf(tree, move.group);
      parent.groups.splice(parent.groups.indexOf(group), 1);
      to.groups.push(group);
      return null;
    }
    case "delete": {
      const group = groupNamed(tree, move.group);
      if (!group) return nowhere(move.group);
      if (group.groups.length || group.members.length) return `the group "${group.title}" is not empty; move what it holds out first`;
      const parent = parentOf(tree, move.group);
      parent.groups.splice(parent.groups.indexOf(group), 1);
      return null;
    }
    case "lift": {
      // What the group holds moves up into its parent, after what the parent holds; the group stays, empty.
      const group = groupNamed(tree, move.group);
      if (!group) return nowhere(move.group);
      const parent = parentOf(tree, move.group);
      parent.groups.push(...group.groups.splice(0));
      parent.members.push(...group.members.splice(0));
      return null;
    }
    default:
      return `unknown change "${move?.op}"`;
  }
}

// applyMoves(tree: GroupTree, moves: GroupMove[]) -> { tree, applied, refused } — the moves in their order on a copy of the
// tree, each on the result of the one before: the new tree, the moves applied, and each move refused with its reason. The tree
// given is not changed.
export function applyMoves(tree, moves) {
  const next = structuredClone(tree);
  const applied = [], refused = [];
  for (const move of moves) {
    const reason = apply(next, move);
    if (reason === null) applied.push(move);
    else refused.push({ move, reason });
  }
  return { tree: next, applied, refused };
}
