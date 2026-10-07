// Build — traceGraph reads the artifacts of a repository into the graph (MOD-trace-graph, Parts). Of this item: SPEC.md
// through MOD-spec-document and the test files through MOD-test-document, so that the graph holds every requirement
// and every test with what it guards. Every other file of the module's Data — the use cases, the architecture
// decisions and modules, the backlog items, the groups and the code files — is not among the paths this file selects;
// a later item that reads them extends the selection and the nodes and edges built here, not this file's shape.
//
// Module: MOD-trace-graph

import { parseSpec } from "../spec-document/index.mjs";
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

// The nodes of SPEC.md's requirements, by parseSpec: no edge of its own is built from them in this item.
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

// traceGraph(source: TextSource, options?: { commit?: string }) -> Promise<Graph> — of this item's Data, reads only
// SPEC.md and the test files, in the order source.paths lists them. A path source.read resolves null for is listed in
// unread with the reason and contributes no node; every other path among source.paths is not read and is left out of
// the graph entirely, silently — it belongs to a later item. Rejects only when source.read itself rejects.
export async function traceGraph(source, options = {}) {
  const nodes = new Map();
  const edges = [];
  const unread = [];
  for (const path of source.paths) {
    const isSpec = path === SPEC_PATH;
    if (!isSpec && !isTestPath(path)) continue;
    const text = await source.read(path);
    if (text === null) { unread.push({ path, reason: UNREADABLE }); continue; }
    const found = isSpec ? { nodes: requirementNodes(text), edges: [] } : testFileGraph(path, text);
    for (const node of found.nodes) nodes.set(node.id, node);
    edges.push(...found.edges);
  }
  return { commit: options.commit ?? null, nodes, edges, unread };
}
