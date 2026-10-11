// Build — traceGraph reads the artifacts of a repository into the graph (MOD-trace-graph, Parts). It reads, of the module's
// Data: SPEC.md through MOD-spec-document and the test files through MOD-test-document, so that the graph holds every
// requirement and every test with what it guards; and the use cases, the architecture decisions, the module files, the plan
// steps and the backlog items through MOD-documents' schemas, and the group files through MOD-group-document, so that it
// holds each of them with its title and blob, with every edge its front matter states and with every name its text writes.
// The code files and the imports between modules (UC-025) are not among the paths this file selects.
//
// Module: MOD-trace-graph

import { artifactSchemas, readDocument } from "../documents/index.mjs";
import { parseGroupFile } from "../group-document/index.mjs";
import { identifiersIn } from "../identifiers/index.mjs";
import { parseSpec } from "../spec-document/index.mjs";
import { blobSha } from "../text-tools/index.mjs";
import { testDeclarations } from "../test-document/index.mjs";

const SPEC_PATH = "SPEC.md";
// Test files (MOD-trace-graph, Data): under a folder named test, tests or __tests__, or named as tests are in their
// language — following docs/assets/artifacts.mjs isTestPath, the existing code that reads this today.
const TEST_FOLDERS = new Set(["test", "tests", "__tests__"]);
const TEST_NAME = /^test_[^/]+$|_test\.[A-Za-z0-9]+$|\.(?:test|spec)\.[A-Za-z0-9]+$/;
// TextSource.read resolves null for a path the commit does not hold (as Access's Snapshot documents its own read).
const UNREADABLE = "the commit does not hold it";

function isTestPath(path) {
  const parts = String(path).split("/");
  return parts.slice(0, -1).some((part) => TEST_FOLDERS.has(part)) || TEST_NAME.test(parts[parts.length - 1]);
}

// The documents of the module's Data, each by the path it is read from, the schema of MOD-documents that reads it, the kind
// of its node, and the edges its front matter states: a key, and the `via` of the edge that each of the key's values is. A
// plan step and a backlog item share the item schema.
const DOCUMENTS = [
  { path: /^docs\/use-cases\/UC-[^/]*\.md$/, schema: "useCase", kind: "UC", states: { realises: "realises" } },
  { path: /^docs\/architecture\/ARC-[^/]*\.md$/, schema: "decision", kind: "ARC",
    states: { refines: "refines", forced_by: "forced_by", designs: "designs" } },
  { path: /^docs\/architecture\/MOD-[^/]*\.md$/, schema: "module", kind: "MOD",
    states: { realises: "realises", follows: "follows", uses: "uses" } },
  { path: /^docs\/(?:plan|backlog)\/ITM-[^/]*\.md$/, schema: "item", kind: "ITM",
    states: { realises: "realises", modules: "changes", builds_on: "builds_on" } },
];
const GROUP_FILE = /^docs\/groups\/[^/]+\.md$/;

// The nodes of SPEC.md's requirements, by parseSpec: no edge of its own is built from them.
function requirementNodes(text) {
  return [...parseSpec(text).requirements.values()]
    .map((r) => ({ id: r.name, kind: "requirement", path: SPEC_PATH, line: r.line, title: null, blob: null }));
}

// The nodes of one test file's declarations, and a guards edge from each to every name it guards.
function testFileGraph(path, text) {
  const nodes = [], edges = [];
  for (const d of testDeclarations(path, text)) {
    nodes.push({ id: d.id, kind: "TST", path: d.path, line: d.line, title: null, blob: null });
    for (const guarded of d.guards ?? []) edges.push({ from: d.id, to: guarded, via: "guards", path: d.path, line: d.line });
  }
  return { nodes, edges };
}

// The values of the front matter, each with the line it stands on (from 1): a key with a value on its line, and each item of
// the list that a key with no value, or `[]`, opens — the grammar of MOD-text-tools' parseFrontMatter, which gives the values
// but not their lines.
const KEY_LINE = /^([a-z][a-z0-9_-]*):(.*)$/;
const ITEM_LINE = /^[ \t]+-[ \t]+(.*)$/;
function frontMatterValues(text) {
  const lines = text.split(/\r?\n/);
  const closing = lines[0] === "---" ? lines.indexOf("---", 1) : -1;
  const values = [];
  let key = null, list = false;
  for (let at = 1; at < closing; at += 1) {
    const field = KEY_LINE.exec(lines[at]);
    if (field) {
      key = field[1];
      const value = field[2].trim();
      list = value === "" || value === "[]";
      if (!list) values.push({ key, value, line: at + 1 });
      continue;
    }
    const item = ITEM_LINE.exec(lines[at]);
    if (item && list) values.push({ key, value: item[1].trim(), line: at + 1 });
  }
  return values;
}

// The node of one document and its edges. A document is read by the schema of its kind, whose reading never fails on the
// content (MOD-documents, readDocument); it is not read as its format, and so is not in the graph, when it has no front
// matter or names no identifier — its own, or the path's. Its edges are the values its front matter states under the keys of
// DOCUMENTS, each at the line of the value (a scalar as one value, a list as one for each item), then a `names` edge for each
// identifier its text writes (MOD-identifiers' identifiersIn) on a line no stated edge covers, other than the document's own.
async function documentGraph(entry, path, text) {
  const document = readDocument(artifactSchemas()[entry.schema], path, text);
  if (!Object.keys(document.fields).length) throw new Error("it has no front matter");
  if (!document.id) throw new Error("it names no identifier");
  const values = frontMatterValues(text);
  const lineOf = (key, value) => values.find((v) => v.key === key && v.value === value)?.line ?? 1;
  const edges = [];
  for (const [key, via] of Object.entries(entry.states)) {
    for (const to of [document.fields[key] ?? []].flat()) edges.push({ from: document.id, to, via, path, line: lineOf(key, to) });
  }
  const stated = new Set(edges.map((edge) => edge.line));
  for (const place of identifiersIn(path, text)) {
    if (place.id !== document.id && !stated.has(place.line)) {
      edges.push({ from: document.id, to: place.id, via: "names", path, line: place.line });
    }
  }
  const title = typeof document.fields.title === "string" ? document.fields.title : null;
  const node = { id: document.id, kind: entry.kind, path, line: values.find((v) => v.key === "id")?.line ?? 1, title,
    blob: await blobSha(text) };
  return { nodes: [node], edges };
}

// The nodes of one group file: one for each group at any depth, in the order the titles stand, of the kind `group`, with the
// group's title, the line of the title and the blob of the file. A group carries no identifier, so its node is keyed by where
// it stands, `<path>:<line>`, which no artifact's identifier can equal; a member the file lists is no node of its own. A path
// that is no group file of a known kind throws, and the file is then listed in unread (parseGroupFile).
async function groupFileGraph(path, text) {
  const tree = parseGroupFile(path, text);
  const blob = await blobSha(text);
  const nodes = [];
  const collect = (groups) => groups.forEach((group) => {
    nodes.push({ id: `${path}:${group.line}`, kind: "group", path, line: group.line, title: group.title, blob });
    collect(group.groups);
  });
  collect(tree.groups);
  return { nodes, edges: [] };
}

// The function that reads a path into its nodes and edges, or null for a path the graph does not read.
function readerOf(path) {
  if (path === SPEC_PATH) return (_path, text) => ({ nodes: requirementNodes(text), edges: [] });
  if (isTestPath(path)) return testFileGraph;
  const document = DOCUMENTS.find((entry) => entry.path.test(path));
  if (document) return (_path, text) => documentGraph(document, path, text);
  return GROUP_FILE.test(path) ? groupFileGraph : null;
}

// traceGraph(source: TextSource, options?: { commit?: string }) -> Promise<Graph> — reads, in the order source.paths lists
// them, the files of the module's Data that this file selects; every other path is no artifact and is left out. A path
// source.read resolves null for is listed in unread with the reason and contributes no node; so is a file that is not read as
// its format — the reader throws, and its message is the reason —, and the graph holds the others. Rejects only when
// source.read itself rejects.
export async function traceGraph(source, options = {}) {
  const nodes = new Map();
  const edges = [];
  const unread = [];
  for (const path of source.paths) {
    const read = readerOf(path);
    if (!read) continue;
    const text = await source.read(path);
    if (text === null) { unread.push({ path, reason: UNREADABLE }); continue; }
    let found;
    try {
      found = await read(path, text);
    } catch (error) {
      unread.push({ path, reason: error.message });
      continue;
    }
    for (const node of found.nodes) nodes.set(node.id, node);
    edges.push(...found.edges);
  }
  return { commit: options.commit ?? null, nodes, edges, unread };
}
