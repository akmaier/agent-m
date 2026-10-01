// Group files — the hierarchy of one kind of artifact as docs/groups/<kind>.md holds it (ARC-020 decision 3, UC-021): read,
// written in its canonical form, laid over the known items so that every item has one place, and rearranged by moves.
// Kernel (ARC-003): pure functions over the texts and trees they are given; nothing is read, written or committed here.
//
// Module: MOD-artifacts
//
// A group file is a heading, one explaining paragraph and a nested Markdown list, nested by two spaces:
//
//   # Modules of Agent M — groups
//
//   The hierarchy of this kind of artifact, …
//
//   - Kernel                 — an item that is not an identifier is a group title (A GROUP CARRIES NO IDENTIFIER)
//     - MOD-artifacts        — an item that is an identifier is a member; for requirements, a name in capitals
//   - Withdrawn              — withdrawn items stay listed, in a group of their own named Withdrawn
//     - MOD-groups
//
// The tree: { heading, intro, kind, children, problems } — a group { title, line, children }, a member { id, line }; `line`
// counts from 1 in the text read. hierarchy() marks members { unknown, withdrawn, notYetPlaced } where these hold. Every
// problem is a finding in the compiler form of ARC-007: { artifact, line, kind, rule, what, fix }.

import { isRequirementName } from "./requirements.mjs";

const NESTED = "ARTIFACTS ARE ARRANGED IN NESTED GROUPS";
const NO_ID = "A GROUP CARRIES NO IDENTIFIER";
const ONE_KIND = "A GROUP HOLDS ONE KIND OF ARTIFACT";
const ONE_PLACE = "AN ITEM HAS ONE PLACE IN ITS HIERARCHY";
const OWN_FILE = "EVERY HIERARCHY IS KEPT IN A GROUP FILE OF ITS OWN";
const SURVIVES = "THE NAME IS THE ID AND IT SURVIVES";
const WITHDRAWN = "Withdrawn";

// The identifiers of EVERY ARTIFACT HAS AN IDENTIFIER, each with the kind it names; a requirement is named by its name.
const SLUG = "[a-z0-9]+(?:-[a-z0-9]+)*";
const KINDS = [
  ["use-case", /^UC-\d{3}$/, "a use case"],
  ["architecture-decision", /^ARC-\d{3}$/, "an architecture decision"],
  ["module", new RegExp(`^MOD-${SLUG}$`), "a module"],
  ["test", /^TST-\d{3,}$/, "a test"],
  ["backlog-item", /^ITM-\d{3}$/, "a backlog item"],
  ["source", new RegExp(`^SRC-${SLUG}$`), "a source"],
  ["resource", new RegExp(`^RES-${SLUG}$`), "a resource"],
  ["job", /^JOB-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/, "a job"],
];
const PREFIXED = /^\W*(?:UC|ARC|MOD|TST|ITM|SRC|RES|JOB)-/;
const ITEM = /^( *)- (.*)$/;

// The kind of an item by its identifier, or null for a text that is no identifier (a group title).
function kindOf(id) {
  const k = KINDS.find(([, re]) => re.test(id));
  if (k) return k[0];
  return isRequirementName(id) ? "requirement" : null;
}
const article = (kind) => kind === "requirement" ? "a requirement" : KINDS.find(([k]) => k === kind)?.[2] ?? `a ${kind}`;
const named = (kind) => article(kind).replace(/^an? /, "");

// The kind most members of a list of nodes have — the first such kind on a tie — or null without members.
function mainKind(nodes) {
  const count = new Map();
  const walk = (ns) => ns.forEach((n) => n.children ? walk(n.children) : count.set(kindOf(n.id), (count.get(kindOf(n.id)) ?? 0) + 1));
  walk(nodes);
  let best = null;
  for (const [k, c] of count) if (k && (best === null || c > count.get(best))) best = k;
  return best;
}

const problem = (artifact, line, kind, rule, what, fix) => ({ artifact, line, kind, rule, what, fix });

// ---------------------------------------------------------------- reading and writing

// parseGroupFile(text) -> { heading, intro, kind, children, problems } — the problems are those of the list's form: an item
// not nested by two more spaces than the one above it, an item under a member, and a line in the list that is no item.
export function parseGroupFile(text) {
  const lines = String(text ?? "").split("\n");
  let i = 0, heading = null;
  while (i < lines.length && !lines[i].trim()) i++;
  if (i < lines.length && /^# /.test(lines[i])) heading = lines[i++].slice(2).trim();
  const introLines = [];
  while (i < lines.length && !ITEM.test(lines[i])) introLines.push(lines[i++].trimEnd());
  while (introLines.length && !introLines[0]) introLines.shift();
  while (introLines.length && !introLines[introLines.length - 1]) introLines.pop();
  const tree = { heading, intro: introLines.length ? introLines.join("\n") : null, kind: null, children: [], problems: [] };
  // The open groups, from the top: { depth, node }; an item of depth d goes into the innermost open group shallower than d.
  const open = [{ depth: -1, node: tree }];
  let last = null;
  for (; i < lines.length; i++) {
    const line = lines[i].trimEnd(), at = i + 1;
    if (!line.trim()) continue;
    const m = ITEM.exec(line);
    if (!m) {
      tree.problems.push(problem(line.trim(), at, "error", NESTED, 'not an item of the list (a line "- …")',
        "write every line of the list as an item `- …`, nested by two spaces, and nothing after the list"));
      continue;
    }
    let depth = m[1].length / 2;
    const allowed = last ? last.depth + 1 : 0;
    if (!Number.isInteger(depth) || depth > allowed) {
      tree.problems.push(problem(m[2].trim(), at, "error", NESTED,
        `indented by ${m[1].length} spaces, not by two more than the item above`,
        "indent an item by exactly two spaces more than the group it belongs to"));
      depth = Math.min(Math.floor(depth), allowed);
    }
    while (open[open.length - 1].depth >= depth) open.pop();
    const label = m[2].trim();
    const node = kindOf(label) ? { id: label, line: at } : { title: label, line: at, children: [] };
    if (last && depth > last.depth && !last.node.children) {
      tree.problems.push(problem(label, at, "error", NESTED, `${label} stands under the member ${last.node.id}; only a group holds items`,
        `move ${label} into a group, or make ${last.node.id}'s line a group title`));
    }
    open[open.length - 1].node.children.push(node);
    if (node.children) open.push({ depth, node });
    last = { depth, node };
  }
  tree.kind = mainKind(tree.children);
  return tree;
}

// formatGroupFile(tree, heading) -> text — the canonical file: the heading (the one given, else the tree's), a blank line,
// the paragraph, a blank line, the list nested by two spaces, and a final newline. A member marked notYetPlaced is not
// written: it stands at the top level because no group names it, and it is written once a move has placed it.
export function formatGroupFile(tree, heading) {
  const out = [], head = heading ?? tree.heading;
  if (head) out.push(`# ${head}`, "");
  if (tree.intro) out.push(tree.intro, "");
  const walk = (nodes, depth) => {
    for (const n of nodes) {
      if (n.notYetPlaced) continue;
      out.push(`${"  ".repeat(depth)}- ${n.children ? n.title : n.id}`);
      if (n.children) walk(n.children, depth + 1);
    }
  };
  walk(tree.children ?? [], 0);
  while (out.length && out[out.length - 1] === "") out.pop();
  return out.length ? out.join("\n") + "\n" : "";
}

// ---------------------------------------------------------------- the hierarchy over the known items

// The known items as Map(id -> { withdrawn }): a list of identifiers or { id, withdrawn }, a Set, or the Map that
// parseRequirements gives (name -> { withdrawn }). null: nothing is known, and members are not looked up.
function knownItems(items) {
  if (items === undefined || items === null) return null;
  const out = new Map();
  const add = (x, v) => (typeof x === "string" ? out.set(x, { withdrawn: Boolean(v?.withdrawn) })
    : x && typeof x.id === "string" ? out.set(x.id, { withdrawn: Boolean(x.withdrawn) }) : null);
  if (items instanceof Map) for (const [k, v] of items) add(k, v);
  else for (const x of items) add(x);
  return out;
}

// hierarchy(tree, items) -> { tree, problems } — the groups with every known item placed once: an item no group names is
// added at the top level, marked notYetPlaced (AN UNGROUPED ITEM IS SHOWN AT THE TOP LEVEL). The kind of the hierarchy is
// that of the known items, else the tree's. Problems: the list's form, a member of another kind, a member listed a second
// time (both places stay in the tree, so that a person can keep one), a member no item is, a withdrawn member outside the
// group Withdrawn (ARC-020 decision 3), and a group title written like an identifier.
export function hierarchy(tree, items) {
  const known = knownItems(items);
  const kind = (known && [...known.keys()].map(kindOf).find(Boolean)) || tree.kind || null;
  const problems = [...(tree.problems ?? [])];
  const seen = new Map();
  const copy = (nodes, inWithdrawn) => nodes.map((n) => {
    if (n.children) {
      if (PREFIXED.test(n.title)) {
        problems.push(problem(n.title, n.line ?? 1, "error", NO_ID, `the group title "${n.title}" looks like an identifier`,
          "a group is named by a title in words; list an identifier as a member of a group, never as its title"));
      }
      return { title: n.title, line: n.line, children: copy(n.children, inWithdrawn || n.title === WITHDRAWN) };
    }
    const m = { id: n.id, line: n.line }, k = kindOf(n.id);
    if (kind && k !== kind) {
      problems.push(problem(n.id, n.line ?? 1, "error", ONE_KIND, `${n.id} is ${article(k)}, not ${article(kind)}`,
        `list ${n.id} in the group file of its own kind, and only ${named(kind)} identifiers here`));
    } else if (seen.has(n.id)) {
      problems.push(problem(n.id, n.line ?? 1, "error", ONE_PLACE, `${n.id} is listed a second time (first on line ${seen.get(n.id)})`,
        `keep ${n.id} in one place and remove the other line`));
    } else if (known && !known.has(n.id)) {
      m.unknown = true;
      problems.push(problem(n.id, n.line ?? 1, "error", OWN_FILE, `${n.id} is no known ${named(kind)}`,
        `remove the line, or name ${n.id} by the identifier it has`));
    } else if (known?.get(n.id).withdrawn) {
      m.withdrawn = true;
      if (!inWithdrawn) {
        problems.push(problem(n.id, n.line ?? 1, "warning", SURVIVES, `${n.id} is withdrawn and stands outside the group ${WITHDRAWN}`,
          `move ${n.id} into the group ${WITHDRAWN}`));
      }
    }
    if (!seen.has(n.id)) seen.set(n.id, n.line ?? 1);
    return m;
  });
  const children = copy(tree.children ?? [], false);
  for (const [id, v] of known ?? []) {
    if (!seen.has(id)) children.push({ id, ...(v.withdrawn ? { withdrawn: true } : {}), notYetPlaced: true });
  }
  return { tree: { heading: tree.heading ?? null, intro: tree.intro ?? null, kind, children }, problems };
}

// ---------------------------------------------------------------- moves

// A group is addressed by the path of titles from the top, [] being the top level itself.
function groupAt(tree, path) {
  let node = tree;
  for (const title of path ?? []) {
    node = node.children?.find((n) => n.children && n.title === title);
    if (!node) return null;
  }
  return node;
}
const parentPath = (path) => path.slice(0, -1);
const titleTaken = (group, title) => group.children.some((n) => n.children && n.title === title);
function removeMember(nodes, id) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].children) removeMember(nodes[i].children, id);
    else if (nodes[i].id === id) nodes.splice(i, 1);
  }
}

// One move on a tree it may change; the reason it is refused, or null.
function apply(tree, move) {
  const quote = (path) => `"${(path ?? []).join(" / ")}"`;
  const target = (path) => groupAt(tree, path);
  switch (move?.op) {
    case "create": {
      const into = target(move.in ?? []);
      if (!into) return `there is no group ${quote(move.in)}`;
      if (!move.title || PREFIXED.test(move.title) || kindOf(move.title)) return `"${move.title ?? ""}" is no title for a group`;
      if (titleTaken(into, move.title)) return `a group "${move.title}" exists there already`;
      into.children.push({ title: move.title, children: [] });
      return null;
    }
    case "rename": {
      const group = move.group?.length ? target(move.group) : null;
      if (!group) return `there is no group ${quote(move.group)}`;
      if (!move.title || PREFIXED.test(move.title) || kindOf(move.title)) return `"${move.title ?? ""}" is no title for a group`;
      if (move.title !== group.title && titleTaken(target(parentPath(move.group)), move.title)) {
        return `a group "${move.title}" exists there already`;
      }
      group.title = move.title;
      return null;
    }
    case "delete": {
      const group = move.group?.length ? target(move.group) : null;
      if (!group) return `there is no group ${quote(move.group)}`;
      if (group.children.length) return `the group "${group.title}" is not empty; move what it holds out first`;
      const parent = target(parentPath(move.group));
      parent.children.splice(parent.children.indexOf(group), 1);
      return null;
    }
    case "move": {
      const to = target(move.to ?? []);
      if (move.item !== undefined) {
        const k = kindOf(move.item);
        if (!k) return `"${move.item}" is no identifier`;
        if (tree.kind && k !== tree.kind) return `${move.item} is ${article(k)}, not ${article(tree.kind)}`;
        if (!to) return `there is no group ${quote(move.to)}`;
        removeMember(tree.children, move.item);
        to.children.push({ id: move.item });
        return null;
      }
      const group = move.group?.length ? target(move.group) : null;
      if (!group) return `there is no group ${quote(move.group)}`;
      const into = move.to ?? [];
      if (into.length >= move.group.length && move.group.every((t, i) => into[i] === t)) {
        return `the group "${group.title}" cannot be moved into itself or a group inside it`;
      }
      if (!to) return `there is no group ${quote(move.to)}`;
      if (titleTaken(to, group.title)) return `a group "${group.title}" exists there already`;
      const parent = target(parentPath(move.group));
      parent.children.splice(parent.children.indexOf(group), 1);
      to.children.push(group);
      return null;
    }
    default:
      return `unknown change "${move?.op}"`;
  }
}

// applyMoves(tree, moves) -> { tree, refused } — the moves in their order on a copy of the tree: create a group, rename one,
// move an item or a group, delete an empty group. A refused move changes nothing and is returned with its reason: a move of
// an item of another kind (A GROUP HOLDS ONE KIND OF ARTIFACT), deleting a group that is not empty, a group moved into
// itself, a title that is taken among its siblings or is written like an identifier, a group that does not exist. A moved
// item leaves no copy behind (AN ITEM HAS ONE PLACE IN ITS HIERARCHY), and a moved item is no longer notYetPlaced.
export function applyMoves(tree, moves) {
  const copy = JSON.parse(JSON.stringify(tree));
  const refused = [];
  for (const move of moves ?? []) {
    const reason = apply(copy, move);
    if (reason) refused.push({ move, reason });
  }
  return { tree: copy, refused };
}
