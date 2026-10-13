// The whole trace graph of a repository (ITM-305) — MOD-trace-graph's traceGraph, as docs/architecture/MOD-trace-graph.md
// states it, reading of the module's Data, besides SPEC.md and the test files, the use cases, the architecture decisions,
// the module files, the plan steps and the backlog items through MOD-documents' schemas, and the group files through
// MOD-group-document: a node for each, with its title and blob, an edge for each name it states — realises, forced_by,
// designs, follows, refines, uses, changes, builds_on — and a names edge for each name its text writes (MOD-identifiers'
// identifiersIn); a file it cannot read is listed in unread and the graph holds the others. The checks across artifacts
// (ITM-306), the impact list (ITM-307), the coverage gaps (ITM-308), the code files with their imports (UC-025) and what tracesTo
// derives are not part of ITM-305 and are not tested here.
// Run: node --test tests/trace-graph-documents.test.mjs
//
// Module: MOD-trace-graph
// Guards: UC-006; UC-007; UC-018; UC-019; THE TRACEABILITY MATRIX IS DERIVED; EVERY ARTIFACT NAMES ITS ORIGIN; A REQUIREMENT SHOWS WHAT TRACES TO IT
// Level: unit
//
// The fixture repository is small and ours, never Agent M's own: a SPEC.md of two requirements, a use case, an architecture
// decision, a module file, a plan step, a backlog item and a group file, each a few lines, given to traceGraph through a
// TextSource built here. Each test states its input and its expected result before it runs (given /
// input / expect); an expected line is read off the fixture (lineOf), not counted; where a test expects that something is
// not there, the same graph is first shown to hold its known positive. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { traceGraph } from "../src/trace-graph/index.mjs";

// A TextSource over a fixed set of files: every key is listed in `paths`, `read` resolves its text.
function source(files) {
  return {
    paths: Object.keys(files),
    read: async (path) => (Object.prototype.hasOwnProperty.call(files, path) ? files[path] : null),
  };
}

// git's blob SHA-1 of a text, as `git hash-object` gives it for the file: the SHA-1 of "blob <bytes>", a zero byte and the bytes.
const gitBlob = (text) => createHash("sha1").update(`blob ${Buffer.byteLength(text)}\0`).update(text).digest("hex");

// A node and an edge as the cases below assert them: what ITM-305 built. The facts that later items add — a node's folder, provides,
// level, tests and sources, an edge's interface — are left out here and asserted in tests/trace-graph-facts.test.mjs.
const core = ({ id, kind, path, line, title, blob }) => ({ id, kind, path, line, title, blob });
const kept = ({ from, to, via, path, line }) => ({ from, to, via, path, line });

// The line, from 1, on which a fixture file has exactly this text; the fixture must hold it once.
function lineOf(lines, text) {
  const at = lines.flatMap((line, i) => (line === text ? [i + 1] : []));
  assert.equal(at.length, 1, `the fixture holds the line ${JSON.stringify(text)} once`);
  return at[0];
}

// The edges that start at one node, in the order they stand in its file: by line, then by kind of edge, then by target.
const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const edgesFrom = (graph, id) => graph.edges.filter((edge) => edge.from === id)
  .sort((a, b) => a.line - b.line || compare(a.via, b.via) || compare(a.to, b.to)).map(kept);

const RULE = "A SAMPLE RULE";
const OTHER_RULE = "ANOTHER SAMPLE RULE";

// ---------------------------------------------------------------- the fixture repository

const SPEC_PATH = "SPEC.md";
const SPEC_LINES = [
  "# Fixture product — Specification",
  "",
  "## Section",
  "",
  `**${RULE}** *(Product Owner)*`,
  "A sample rule that a use case realises.",
  "*Check:* `tests/sample.test.mjs`",
  "",
  `**${OTHER_RULE}** *(Product Owner)*`,
  "Another sample rule.",
  "*Check:* no automatic check; at review",
  "",
];

const UC_PATH = "docs/use-cases/UC-001-read-a-file.md";
const UC_LINES = [
  "---",
  "id: UC-001",
  "title: Read a file",
  "area: reading",
  "actors:",
  "  - Reader",
  "realises:",
  `  - ${RULE}`,
  "---",
  "# UC-001 Read a file",
  "",
  `**Goal.** The reader reads a file whole; it extends UC-002 and applies \`${OTHER_RULE}\`.`,
  "",
];

const ARC_PATH = "docs/architecture/ARC-002-reading-lives-in-a-module.md";
const ARC_LINES = [
  "---",
  "id: ARC-002",
  "title: Reading lives in a module",
  "refines: ARC-001",
  "forced_by:",
  `  - ${RULE}`,
  "  - UC-001",
  "designs:",
  "  - MOD-reader",
  "---",
  "# ARC-002 Reading lives in a module",
  "",
  "## Context",
  "",
  `ARC-001 asks for \`${RULE}\`; UC-001 shows how.`,
  "",
];

const MOD_PATH = "docs/architecture/MOD-reader.md";
const MOD_LINES = [
  "---",
  "id: MOD-reader",
  "title: Reading a file",
  "folder: src/reader/",
  "realises:",
  `  - ${RULE}`,
  "  - UC-001",
  "follows:",
  "  - ARC-002",
  "uses:",
  "  - MOD-text.readLines",
  "  - MOD-text.Line",
  "provides:",
  "  - readFile",
  "---",
  "# MOD-reader Reading a file",
  "",
  "## Responsibility",
  "",
  `It reads a file whole (\`${RULE}\`) as ARC-002 decides.`,
  "",
];

const STEP_PATH = "docs/plan/ITM-001-the-reader.md";
const STEP_LINES = [
  "---",
  "id: ITM-001",
  "title: The reader",
  "level: module",
  "realises:",
  "  - UC-001",
  `  - ${RULE}`,
  "modules:",
  "  - MOD-reader",
  "tests:",
  "  - unit",
  "origin:",
  "  - UC-001 step 1",
  "---",
  "# ITM-001 The reader",
  "",
  "## Outcome",
  "",
  "MOD-reader reads a file.",
  "",
  "## Acceptance",
  "",
  "- A unit test reads a file.",
  "",
];

const ITEM_PATH = "docs/backlog/ITM-002-the-reader-page.md";
const ITEM_LINES = [
  "---",
  "id: ITM-002",
  "title: The reader page",
  "level: module",
  "realises:",
  "  - UC-001",
  "modules:",
  "  - MOD-reader",
  "builds_on:",
  "  - ITM-001",
  "tests:",
  "  - unit",
  "origin:",
  `  - ${OTHER_RULE}`,
  "---",
  "# ITM-002 The reader page",
  "",
  "## Outcome",
  "",
  "The page shows what the reader reads.",
  "",
  "## Acceptance",
  "",
  "- A unit test shows the page.",
  "",
];

const GROUP_PATH = "docs/groups/use-cases.md";
const GROUP_LINES = [
  "# Use cases — groups",
  "",
  "The hierarchy of the use cases, each member by its identifier.",
  "",
  "- Reading",
  "  - UC-001",
  "  - Details",
  "    - UC-002",
  "- Later",
  "",
];

// The files in the order a repository lists them; the text of each is its lines joined.
const FILES = [
  [SPEC_PATH, SPEC_LINES], [UC_PATH, UC_LINES], [ARC_PATH, ARC_LINES], [MOD_PATH, MOD_LINES], [STEP_PATH, STEP_LINES],
  [ITEM_PATH, ITEM_LINES], [GROUP_PATH, GROUP_LINES],
].map(([path, lines]) => [path, lines.join("\n")]);
const textOf = (path) => FILES.find(([p]) => p === path)[1];
const fixture = (files = FILES) => source(Object.fromEntries(files));

// ---------------------------------------------------------------- a use case

// TST-473135 · level: unit · module: MOD-trace-graph
// guards: EVERY ARTIFACT NAMES ITS ORIGIN; THE TRACEABILITY MATRIX IS DERIVED; UC-006; UC-007; UC-018; UC-019
// given: the fixture's UC-001 — front matter with its id, title and one realised requirement, a heading that names it again, and a line of its text that writes UC-002 and, between backticks, ANOTHER SAMPLE RULE
// input: traceGraph over the fixture repository
// expect: no file unread; a node UC-001 of kind UC at the line of its `id:`, with the title "Read a file" and the git blob SHA of the file; a realises edge to A SAMPLE RULE at the line of its list item; a names edge to UC-002 and one to ANOTHER SAMPLE RULE at the line of the text that writes them — and no edge for the heading or the `id:` line, which name the use case itself, nor a names edge on the line the realises edge already states
test("traceGraph — a use case is a node with its title and blob, a realises edge for the name it realises and a names edge for each name its text writes", async () => {
  const graph = await traceGraph(fixture());
  assert.deepEqual(graph.unread, [], "known positive: every file of the fixture was read");
  assert.deepEqual(core(graph.nodes.get("UC-001")), {
    id: "UC-001", kind: "UC", path: UC_PATH, line: lineOf(UC_LINES, "id: UC-001"), title: "Read a file", blob: gitBlob(textOf(UC_PATH)),
  });
  const goal = lineOf(UC_LINES, `**Goal.** The reader reads a file whole; it extends UC-002 and applies \`${OTHER_RULE}\`.`);
  assert.deepEqual(edgesFrom(graph, "UC-001"), [
    { from: "UC-001", to: RULE, via: "realises", path: UC_PATH, line: lineOf(UC_LINES, `  - ${RULE}`) },
    { from: "UC-001", to: OTHER_RULE, via: "names", path: UC_PATH, line: goal },
    { from: "UC-001", to: "UC-002", via: "names", path: UC_PATH, line: goal },
  ]);
});

// ---------------------------------------------------------------- an architecture decision

// TST-473136 · level: unit · module: MOD-trace-graph
// guards: EVERY ARTIFACT NAMES ITS ORIGIN; THE TRACEABILITY MATRIX IS DERIVED; UC-007; UC-019
// given: the fixture's ARC-002 — front matter with a refined decision, two forcing names (a requirement and a use case) and one designed module; and a line of its Context that writes ARC-001, A SAMPLE RULE (between backticks) and UC-001
// input: traceGraph over the fixture repository
// expect: a node ARC-002 of kind ARC with the title "Reading lives in a module" and the git blob SHA of the file; a refines edge to ARC-001, a forced_by edge to the requirement and one to the use case, a designs edge to MOD-reader, each at the line of its list item or key; a names edge to each of the three names the Context line writes — the refined ARC-001 among them, since this line is not the one the refines edge states
test("traceGraph — an architecture decision is a node with refines, forced_by and designs edges, and its text's names", async () => {
  const graph = await traceGraph(fixture());
  assert.deepEqual(core(graph.nodes.get("ARC-002")), {
    id: "ARC-002", kind: "ARC", path: ARC_PATH, line: lineOf(ARC_LINES, "id: ARC-002"), title: "Reading lives in a module",
    blob: gitBlob(textOf(ARC_PATH)),
  });
  const context = lineOf(ARC_LINES, `ARC-001 asks for \`${RULE}\`; UC-001 shows how.`);
  assert.deepEqual(edgesFrom(graph, "ARC-002"), [
    { from: "ARC-002", to: "ARC-001", via: "refines", path: ARC_PATH, line: lineOf(ARC_LINES, "refines: ARC-001") },
    { from: "ARC-002", to: RULE, via: "forced_by", path: ARC_PATH, line: lineOf(ARC_LINES, `  - ${RULE}`) },
    { from: "ARC-002", to: "UC-001", via: "forced_by", path: ARC_PATH, line: lineOf(ARC_LINES, "  - UC-001") },
    { from: "ARC-002", to: "MOD-reader", via: "designs", path: ARC_PATH, line: lineOf(ARC_LINES, "  - MOD-reader") },
    { from: "ARC-002", to: RULE, via: "names", path: ARC_PATH, line: context },
    { from: "ARC-002", to: "ARC-001", via: "names", path: ARC_PATH, line: context },
    { from: "ARC-002", to: "UC-001", via: "names", path: ARC_PATH, line: context },
  ]);
});

// ---------------------------------------------------------------- a module file

// TST-473137 · level: unit · module: MOD-trace-graph
// guards: EVERY ARTIFACT NAMES ITS ORIGIN; THE TRACEABILITY MATRIX IS DERIVED; UC-007; UC-019
// given: the fixture's MOD-reader — front matter with two realised names (a requirement and a use case), one followed decision and two used interfaces of another module, MOD-text.readLines and MOD-text.Line, and a provided name; and a line of its Responsibility that writes A SAMPLE RULE (between backticks) and ARC-002
// input: traceGraph over the fixture repository
// expect: a node MOD-reader of kind MOD with the title "Reading a file" and the git blob SHA of the file; a realises edge to each realised name, a follows edge to ARC-002 and one uses edge to each used interface — its target the interface as the file writes it, MOD-text.readLines and MOD-text.Line —, each at its list item; a names edge to each of the two names the Responsibility line writes; no edge for the folder or the provided name
test("traceGraph — a module file is a node with realises, follows and uses edges, and its text's names", async () => {
  const graph = await traceGraph(fixture());
  assert.deepEqual(core(graph.nodes.get("MOD-reader")), {
    id: "MOD-reader", kind: "MOD", path: MOD_PATH, line: lineOf(MOD_LINES, "id: MOD-reader"), title: "Reading a file",
    blob: gitBlob(textOf(MOD_PATH)),
  });
  const responsibility = lineOf(MOD_LINES, `It reads a file whole (\`${RULE}\`) as ARC-002 decides.`);
  assert.deepEqual(edgesFrom(graph, "MOD-reader"), [
    { from: "MOD-reader", to: RULE, via: "realises", path: MOD_PATH, line: lineOf(MOD_LINES, `  - ${RULE}`) },
    { from: "MOD-reader", to: "UC-001", via: "realises", path: MOD_PATH, line: lineOf(MOD_LINES, "  - UC-001") },
    { from: "MOD-reader", to: "ARC-002", via: "follows", path: MOD_PATH, line: lineOf(MOD_LINES, "  - ARC-002") },
    { from: "MOD-reader", to: "MOD-text.readLines", via: "uses", path: MOD_PATH, line: lineOf(MOD_LINES, "  - MOD-text.readLines") },
    { from: "MOD-reader", to: "MOD-text.Line", via: "uses", path: MOD_PATH, line: lineOf(MOD_LINES, "  - MOD-text.Line") },
    { from: "MOD-reader", to: RULE, via: "names", path: MOD_PATH, line: responsibility },
    { from: "MOD-reader", to: "ARC-002", via: "names", path: MOD_PATH, line: responsibility },
  ]);
});

// ---------------------------------------------------------------- a plan step

// TST-473138 · level: unit · module: MOD-trace-graph
// guards: EVERY ARTIFACT NAMES ITS ORIGIN; THE TRACEABILITY MATRIX IS DERIVED; UC-007; UC-019
// given: the fixture's plan step ITM-001, under docs/plan/ — front matter with two realised names, one changed module and an origin that writes "UC-001 step 1"; and a line of its Outcome that writes MOD-reader
// input: traceGraph over the fixture repository
// expect: a node ITM-001 of kind ITM with the title "The reader" and the git blob SHA of the file; a realises edge to each realised name and a changes edge to MOD-reader, each at its list item; a names edge to UC-001 at the origin's line and one to MOD-reader at the Outcome line
test("traceGraph — a plan step is a node with realises and changes edges, and its text's names", async () => {
  const graph = await traceGraph(fixture());
  assert.deepEqual(core(graph.nodes.get("ITM-001")), {
    id: "ITM-001", kind: "ITM", path: STEP_PATH, line: lineOf(STEP_LINES, "id: ITM-001"), title: "The reader", blob: gitBlob(textOf(STEP_PATH)),
  });
  assert.deepEqual(edgesFrom(graph, "ITM-001"), [
    { from: "ITM-001", to: "UC-001", via: "realises", path: STEP_PATH, line: lineOf(STEP_LINES, "  - UC-001") },
    { from: "ITM-001", to: RULE, via: "realises", path: STEP_PATH, line: lineOf(STEP_LINES, `  - ${RULE}`) },
    { from: "ITM-001", to: "MOD-reader", via: "changes", path: STEP_PATH, line: lineOf(STEP_LINES, "  - MOD-reader") },
    { from: "ITM-001", to: "UC-001", via: "names", path: STEP_PATH, line: lineOf(STEP_LINES, "  - UC-001 step 1") },
    { from: "ITM-001", to: "MOD-reader", via: "names", path: STEP_PATH, line: lineOf(STEP_LINES, "MOD-reader reads a file.") },
  ]);
});

// ---------------------------------------------------------------- a backlog item

// TST-473139 · level: unit · module: MOD-trace-graph
// guards: EVERY ARTIFACT NAMES ITS ORIGIN; THE TRACEABILITY MATRIX IS DERIVED; UC-007; UC-019
// given: the fixture's backlog item ITM-002, under docs/backlog/ — front matter with one realised use case, one changed module, one item it builds on, and an origin that is a requirement's name
// input: traceGraph over the fixture repository
// expect: a node ITM-002 of kind ITM with the title "The reader page" and the git blob SHA of the file; a realises edge to UC-001, a changes edge to MOD-reader and a builds_on edge to ITM-001, each at its list item; a names edge to ANOTHER SAMPLE RULE at the origin's line, which the other edges do not state
test("traceGraph — a backlog item is a node with realises, changes and builds_on edges, and its origin's name", async () => {
  const graph = await traceGraph(fixture());
  assert.deepEqual(core(graph.nodes.get("ITM-002")), {
    id: "ITM-002", kind: "ITM", path: ITEM_PATH, line: lineOf(ITEM_LINES, "id: ITM-002"), title: "The reader page", blob: gitBlob(textOf(ITEM_PATH)),
  });
  assert.deepEqual(edgesFrom(graph, "ITM-002"), [
    { from: "ITM-002", to: "UC-001", via: "realises", path: ITEM_PATH, line: lineOf(ITEM_LINES, "  - UC-001") },
    { from: "ITM-002", to: "MOD-reader", via: "changes", path: ITEM_PATH, line: lineOf(ITEM_LINES, "  - MOD-reader") },
    { from: "ITM-002", to: "ITM-001", via: "builds_on", path: ITEM_PATH, line: lineOf(ITEM_LINES, "  - ITM-001") },
    { from: "ITM-002", to: OTHER_RULE, via: "names", path: ITEM_PATH, line: lineOf(ITEM_LINES, `  - ${OTHER_RULE}`) },
  ]);
});

// ---------------------------------------------------------------- the titles of the groups

// TST-473140 · level: unit · module: MOD-trace-graph
// guards: EVERY ARTIFACT NAMES ITS ORIGIN; THE TRACEABILITY MATRIX IS DERIVED; UC-007; UC-019
// given: the fixture's group file docs/groups/use-cases.md — a group Reading (line 5) that holds UC-001 and a group Details (line 7) that holds UC-002, and a group Later (line 9) that holds nothing
// input: traceGraph over the fixture repository
// expect: one node of kind group for each of the three groups, at any depth, each with the group's title, the line of the title and the git blob SHA of the group file; no edge from the group file; UC-001, which the group Reading lists, is still the use case's node
test("traceGraph — the title of every group of a group file is read, at any depth", async () => {
  const graph = await traceGraph(fixture());
  const TITLE_LINES = { Reading: "- Reading", Details: "  - Details", Later: "- Later" };
  const group = (title) => {
    const line = lineOf(GROUP_LINES, TITLE_LINES[title]);
    return { id: `${GROUP_PATH}:${line}`, kind: "group", path: GROUP_PATH, line, title, blob: gitBlob(textOf(GROUP_PATH)) };
  };
  const groups = [...graph.nodes.values()].filter((node) => node.kind === "group").sort((a, b) => a.line - b.line).map(core);
  assert.deepEqual(groups, [group("Reading"), group("Details"), group("Later")]);
  assert.deepEqual(graph.edges.filter((edge) => edge.path === GROUP_PATH), []);
  assert.equal(graph.nodes.get("UC-001").path, UC_PATH, "a member the group file lists is not a node of the group file");
});

// ---------------------------------------------------------------- a file that cannot be read as its format

// TST-473141 · level: unit · module: MOD-trace-graph
// guards: EVERY ARTIFACT NAMES ITS ORIGIN; THE TRACEABILITY MATRIX IS DERIVED; UC-007; UC-018; UC-019
// given: the fixture repository with a file docs/use-cases/UC-009-broken.md added between its use case and its decision — a text that is no use case: it has no front matter; and the same repository without it
// input: traceGraph over each
// expect: without the broken file nothing is unread; with it, unread holds that one path, with a reason that names the missing front matter; the nodes and the edges of the two graphs are the same — the files after the broken one included —, and there is no node UC-009
test("traceGraph — a use case that cannot be read as one is listed in unread, and the graph still holds the others", async () => {
  const BROKEN_PATH = "docs/use-cases/UC-009-broken.md";
  const entries = FILES.slice();
  entries.splice(2, 0, [BROKEN_PATH, "This is not a use case.\n"]);
  const whole = await traceGraph(fixture());
  const broken = await traceGraph(fixture(entries));
  assert.deepEqual(whole.unread, [], "known positive: the fixture without the broken file is read whole");
  assert.ok(whole.nodes.has("MOD-reader"), "known positive: the module file, which stands after the broken one, is in the graph");
  assert.ok(whole.nodes.has("ITM-002"), "known positive: so is the backlog item, which stands last but one");
  assert.deepEqual(broken.unread.map((entry) => entry.path), [BROKEN_PATH]);
  assert.match(broken.unread[0].reason, /front matter/);
  assert.deepEqual([...broken.nodes.keys()], [...whole.nodes.keys()]);
  assert.deepEqual(broken.edges, whole.edges);
  assert.equal(broken.nodes.has("UC-009"), false);
});
