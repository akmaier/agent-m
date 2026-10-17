// group-file.mjs — reading and writing a group file (MOD-group-document, Parts; Data: the group file `docs/groups/<kind>.md`):
// parseGroupFile and groupFileText.
//
// Module: MOD-group-document
//
// A group file is a title line, one line saying what the file arranges, then a nested list, two spaces to a level. An item
// of the list is a member when it is an identifier and holds no item, and a group, by its title, otherwise: an item that
// holds items is a group even when its text is an identifier, so that the tree still shows a group titled by one. A line
// that is no list item is neither and does not count.

import { kindOfIdentifier } from "../identifiers/index.mjs";

const KINDS = ["requirements", "use-cases", "architecture", "modules", "tests"];
const KIND_OF_PATH = new Map(KINDS.map((kind) => [`docs/groups/${kind}.md`, kind]));

// A line of the list: the spaces that indent it, then `- ` and the item.
const LIST_ITEM = /^( *)- (.+)$/;

// NotAGroupFile — a path that is not `docs/groups/<kind>.md` of a known kind; the message names the path.
const notAGroupFile = (path) => Object.assign(
  new Error(`parseGroupFile: ${path} is not docs/groups/<kind>.md of a known kind (${KINDS.join(", ")})`),
  { name: "NotAGroupFile" });

// parseGroupFile(path: string, text: string) -> GroupTree — reads a group file; its kind comes from its path. Throws
// NotAGroupFile naming the path when the path is not `docs/groups/<kind>.md` of a known kind. Lines that are no list item do
// not count; `line` counts from 1 in the text read, as a finding's does (MOD-text-tools, Data).
export function parseGroupFile(path, text) {
  const kind = KIND_OF_PATH.get(path);
  if (!kind) throw notAGroupFile(path);
  const items = [];
  text.split("\n").forEach((line, index) => {
    const match = LIST_ITEM.exec(line.trimEnd());
    if (match) items.push({ indent: match[1].length, label: match[2].trim(), line: index + 1 });
  });
  const tree = { kind, groups: [], members: [] };
  // The groups still open, innermost last, each with the indent of its title: an item goes into the innermost open group
  // that is indented less than it, else into the tree itself.
  const open = [{ indent: -1, holder: tree }];
  items.forEach((item, at) => {
    while (open[open.length - 1].indent >= item.indent) open.pop();
    const holder = open[open.length - 1].holder;
    const holdsItems = items[at + 1]?.indent > item.indent;
    if (!holdsItems && kindOfIdentifier(item.label)) {
      holder.members.push({ id: item.label, line: item.line });
    } else {
      const group = { title: item.label, line: item.line, groups: [], members: [] };
      holder.groups.push(group);
      open.push({ indent: item.indent, holder: group });
    }
  });
  return tree;
}

// What the title line and the line below it of the group file of each kind say: the kind as a title, what the file arranges,
// and what a member is named by.
const FILE_OF_KIND = {
  requirements: { title: "Requirements", arranges: "requirements", by: "name" },
  "use-cases": { title: "Use cases", arranges: "use cases", by: "identifier" },
  architecture: { title: "Architecture decisions", arranges: "architecture decisions", by: "identifier" },
  modules: { title: "Modules", arranges: "modules", by: "identifier" },
  tests: { title: "Tests", arranges: "tests", by: "identifier" },
};

// groupFileText(tree: GroupTree) -> string — the group file in its canonical form: the title line `# <Kind> — groups`, a blank
// line, the line saying what the file arranges and, unless the tree is empty, a blank line and the nested list, two spaces to a
// level, a group's members before its groups, each in the order they stand in the tree; a final newline ends it. The lines of
// the tree are not written, and the tree given is not changed.
export function groupFileText(tree) {
  const { title, arranges, by } = FILE_OF_KIND[tree.kind];
  const list = [];
  const write = (node, depth) => {
    const indent = "  ".repeat(depth);
    for (const member of node.members) list.push(`${indent}- ${member.id}`);
    for (const group of node.groups) {
      list.push(`${indent}- ${group.title}`);
      write(group, depth + 1);
    }
  };
  write(tree, 0);
  const lines = [`# ${title} — groups`, "", `The hierarchy of the ${arranges}, each member by its ${by}.`];
  if (list.length) lines.push("", ...list);
  return `${lines.join("\n")}\n`;
}
