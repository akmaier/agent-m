// hierarchy.mjs — the hierarchy of the items of one kind, over a group file's tree (MOD-group-document, Parts; Interfaces:
// Hierarchy, hierarchy). Of it, ITM-381 builds hierarchy.
//
// Module: MOD-group-document
//
// The findings are made with MOD-text-tools' finding and name the group file, which has no identifier, by its path
// `docs/groups/<kind>.md`.

import { kindOfIdentifier } from "../identifiers/index.mjs";
import { finding } from "../text-tools/index.mjs";

const ONE_PLACE = "AN ITEM HAS ONE PLACE IN ITS HIERARCHY";
const NO_IDENTIFIER = "A GROUP CARRIES NO IDENTIFIER";

// Every group of a node, at any depth, and every member of it and of the groups below.
const groupsOf = (node) => node.groups.flatMap((group) => [group, ...groupsOf(group)]);
const membersOf = (node) => [...node.members, ...node.groups.flatMap(membersOf)];
const byLine = (a, b) => a.line - b.line;

// hierarchy(tree: GroupTree, items: string[]) -> Hierarchy — the tree with every item of the kind in its one place: the items no
// member names are added at the top level, in the order the caller gives them, and listed as `ungrouped` (AN UNGROUPED ITEM IS
// SHOWN AT THE TOP LEVEL); a member that matches no item stays where it stands and is listed as `unknown`, once; and the findings,
// in the order of their lines: an error under A GROUP CARRIES NO IDENTIFIER for a group whose title is an identifier, and one
// under AN ITEM HAS ONE PLACE IN ITS HIERARCHY for each place of a member after the first — both places stay in the tree, so that
// a person can keep one. The tree given is not changed.
export function hierarchy(tree, items) {
  const artifact = `docs/groups/${tree.kind}.md`;
  const members = membersOf(tree).sort(byLine);
  const findings = [];
  for (const group of groupsOf(tree)) {
    if (kindOfIdentifier(group.title) === null) continue;
    findings.push(finding({
      artifact, line: group.line, kind: "error", rule: NO_IDENTIFIER, what: `the group title "${group.title}" is an identifier`,
      fix: "name the group by a title in words, and list an identifier as a member of a group, never as its title",
    }));
  }
  const first = new Map();
  for (const member of members) {
    if (!first.has(member.id)) {
      first.set(member.id, member.line);
      continue;
    }
    findings.push(finding({
      artifact, line: member.line, kind: "error", rule: ONE_PLACE,
      what: `${member.id} is listed a second time (first on line ${first.get(member.id)})`,
      fix: `keep ${member.id} in one place and remove the other line`,
    }));
  }
  const known = new Set(items);
  const unknown = [...new Set(members.filter((member) => !known.has(member.id)).map((member) => member.id))];
  const ungrouped = [...new Set(items)].filter((id) => !first.has(id));
  const next = structuredClone(tree);
  next.members.push(...ungrouped.map((id) => ({ id, line: 0 })));
  return { tree: next, ungrouped, unknown, findings: findings.sort(byLine) };
}
