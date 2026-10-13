// The impact list of a requirement (ITM-307) — MOD-trace-graph's requirementImpact, as docs/architecture/MOD-trace-graph.md states it:
// every artifact that names the requirement — a use case's, a module's or an item's realises, a decision's forced_by, a test's
// guards, a text that names it —, each a row { id, kind, path, line, via } of the graph that traceGraph builds (ITM-382): the
// artifact's identifier and kind, the file and the line at which it names the requirement, and the edge by which it does. The
// SPEC's rule is A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; MOD-spec-changes and the requirement editor call it.
// Run: node --test tests/trace-graph-impact.test.mjs
//
// Module: MOD-trace-graph
// Guards: UC-005; UC-006; UC-018; A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST
// Level: unit
//
// The fixture repository is small and ours, never Agent M's own: a SPEC.md of two requirements, a use case, a decision, a module
// file, a backlog item and a test file, given to traceGraph through a TextSource built here — a graph, not a hand-made object.
// A SAMPLE RULE is named by the use case, the decision, the item and the test; the module names the use case and the decision;
// ANOTHER SAMPLE RULE is named by nothing. Each test states its input and its expected result before it runs (given / input /
// expect); an expected line is read off the fixture (lineOf), not counted. The first two tests are the Acceptance's; the next two
// are the Outcome's other namings and the order of the rows, and can be cut. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as traceGraphModule from "../src/trace-graph/index.mjs";

// A name the module does not provide yet is undefined here, so that each test fails by itself and not the whole file at once.
const { traceGraph, requirementImpact } = traceGraphModule;

// A TextSource over a fixed set of files: every key is listed in `paths`, in the order of the keys; `read` resolves its text.
function source(files) {
  return {
    paths: Object.keys(files),
    read: async (path) => (Object.prototype.hasOwnProperty.call(files, path) ? files[path] : null),
  };
}

// The line, from 1, on which a file has exactly this text; the file must hold it once.
function lineOf(lines, text) {
  const at = lines.flatMap((line, i) => (line === text ? [i + 1] : []));
  assert.equal(at.length, 1, `the file holds the line ${JSON.stringify(text)} once`);
  return at[0];
}

// An edit of a file's lines: the one line `old` replaced by `news`. The file must hold `old` once.
const replace = (old, ...news) => (lines) => {
  const at = lines.indexOf(old);
  assert.ok(at >= 0 && lines.lastIndexOf(old) === at, `the file holds the line ${JSON.stringify(old)} once`);
  return [...lines.slice(0, at), ...news, ...lines.slice(at + 1)];
};

const SAMPLE = "A SAMPLE RULE";
const ANOTHER = "ANOTHER SAMPLE RULE";

// ---------------------------------------------------------------- the fixture repository

const SPEC_PATH = "SPEC.md";
const SPEC_LINES = [
  "# Fixture product — Specification",
  "",
  "## Section",
  "",
  `**${SAMPLE}** *(Product Owner)*`,
  "A sample rule that a use case, a decision, an item and a test name.",
  "*Check:* `tests/sample.test.mjs`",
  "",
  `**${ANOTHER}** *(Product Owner)*`,
  "Another sample rule that nothing names.",
  "*Check:* no automatic check; at review",
  "",
];

const UC_PATH = "docs/use-cases/UC-001-read-a-file.md";
const GOAL = "**Goal.** The reader reads a file whole.";
const UC_LINES = [
  "---",
  "id: UC-001",
  "title: Read a file",
  "area: reading",
  "actors:",
  "  - Reader",
  "realises:",
  `  - ${SAMPLE}`,
  "---",
  "# UC-001 Read a file",
  "",
  GOAL,
  "",
];

const UC2_PATH = "docs/use-cases/UC-002-show-a-file.md";
const UC2_LINES = [
  "---",
  "id: UC-002",
  "title: Show a file",
  "area: reading",
  "actors:",
  "  - Reader",
  "realises:",
  `  - ${SAMPLE}`,
  "---",
  "# UC-002 Show a file",
  "",
  "**Goal.** The reader sees a file.",
  "",
];

const ARC_PATH = "docs/architecture/ARC-001-reading-lives-in-a-module.md";
const ARC_LINES = [
  "---",
  "id: ARC-001",
  "title: Reading lives in a module",
  "forced_by:",
  `  - ${SAMPLE}`,
  "designs:",
  "  - MOD-reader",
  "---",
  "# ARC-001 Reading lives in a module",
  "",
];

const MOD_PATH = "docs/architecture/MOD-reader.md";
const MOD_LINES = [
  "---",
  "id: MOD-reader",
  "title: Reading a file",
  "folder: src/reader/",
  "realises:",
  "  - UC-001",
  "follows:",
  "  - ARC-001",
  "uses: []",
  "provides:",
  "  - readFile",
  "---",
  "# MOD-reader Reading a file",
  "",
];

const ITEM_PATH = "docs/backlog/ITM-002-the-reader-page.md";
const ITEM_LINES = [
  "---",
  "id: ITM-002",
  "title: The reader page",
  "level: module",
  "realises:",
  `  - ${SAMPLE}`,
  "modules:",
  "  - MOD-reader",
  "tests:",
  "  - unit",
  "---",
  "# ITM-002 The reader page",
  "",
];

const TEST_PATH = "tests/sample.test.mjs";
const TEST_LINES = [
  "// TST-001",
  "// level: unit",
  `// guards: ${SAMPLE}`,
  "",
];

// The files in the order a repository lists them.
const BASE = {
  [SPEC_PATH]: SPEC_LINES, [UC_PATH]: UC_LINES, [ARC_PATH]: ARC_LINES, [MOD_PATH]: MOD_LINES, [ITEM_PATH]: ITEM_LINES,
  [TEST_PATH]: TEST_LINES,
};

// The fixture with the edits given, { path: edit }, and the files `extra` { path: lines } besides, listed in reverse order when
// `reverse` is true: the lines of every file it holds, and the graph traceGraph builds from them.
async function repository(edits = {}, { extra = {}, reverse = false } = {}) {
  const lines = { ...BASE, ...extra };
  for (const [path, edit] of Object.entries(edits)) lines[path] = edit(lines[path]);
  const listed = Object.entries(lines).map(([path, own]) => [path, own.join("\n")]);
  if (reverse) listed.reverse();
  return { lines, graph: await traceGraph(source(Object.fromEntries(listed))) };
}

// The row an artifact gives for the line it names a requirement at.
const row = (id, kind, path, line, via) => ({ id, kind, path, line, via });

// ---------------------------------------------------------------- the Acceptance's two cases

// TST-473159 · level: unit · module: MOD-trace-graph
// guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; UC-005; UC-006; UC-018
// given: the fixture, where A SAMPLE RULE is named by a use case's realises, a decision's forced_by, a backlog item's realises and a test's guards, and by nothing else — its module names the use case and the decision
// input: requirementImpact of its graph, for A SAMPLE RULE
// expect: four rows, one for each of those artifacts, in the order use case, decision, item, test: its identifier and kind, the file and the line at which it names the requirement — of a test, the line its declaration begins at —, and the edge by which it does: realises, forced_by, realises, guards
test("requirementImpact — a requirement named by a use case, a decision, an item and a test yields those four rows with path, line and edge", async () => {
  const { lines, graph } = await repository();
  assert.deepEqual(requirementImpact(graph, SAMPLE), [
    row("UC-001", "UC", UC_PATH, lineOf(lines[UC_PATH], `  - ${SAMPLE}`), "realises"),
    row("ARC-001", "ARC", ARC_PATH, lineOf(lines[ARC_PATH], `  - ${SAMPLE}`), "forced_by"),
    row("ITM-002", "ITM", ITEM_PATH, lineOf(lines[ITEM_PATH], `  - ${SAMPLE}`), "realises"),
    row("TST-001", "TST", TEST_PATH, lineOf(lines[TEST_PATH], "// TST-001"), "guards"),
  ]);
});

// TST-473160 · level: unit · module: MOD-trace-graph
// guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; UC-005; UC-006; UC-018
// given: the same fixture, where ANOTHER SAMPLE RULE is a requirement of its SPEC that nothing names, and NO SUCH RULE is no requirement
// input: requirementImpact of its graph, for each of the two names — and, first, for A SAMPLE RULE, as a known positive
// expect: four rows for A SAMPLE RULE; none for each of the others
test("requirementImpact — a name nothing names yields none", async () => {
  const { graph } = await repository();
  assert.equal(graph.nodes.get(ANOTHER)?.kind, "requirement", "known positive: the requirement that nothing names");
  assert.equal(requirementImpact(graph, SAMPLE).length, 4, "known positive: a requirement that is named");
  assert.deepEqual(requirementImpact(graph, ANOTHER), []);
  assert.deepEqual(requirementImpact(graph, "NO SUCH RULE"), []);
});

// ---------------------------------------------------------------- the Outcome's other namings, and the order

// The fixture with the module also realising A SAMPLE RULE, the use case's goal naming it twice between backticks, and a second use
// case realising it; and the seven rows its graph gives, read off the lines of those files.
const MENTION = `${GOAL} It rests on \`${SAMPLE}\`, and \`${SAMPLE}\` is written twice on this line.`;
const NAMED_MORE = {
  edits: { [MOD_PATH]: replace("  - UC-001", "  - UC-001", `  - ${SAMPLE}`), [UC_PATH]: replace(GOAL, MENTION) },
  extra: { [UC2_PATH]: UC2_LINES },
};
const namedMore = (lines) => [
  row("UC-001", "UC", UC_PATH, lineOf(lines[UC_PATH], `  - ${SAMPLE}`), "realises"),
  row("UC-001", "UC", UC_PATH, lineOf(lines[UC_PATH], MENTION), "names"),
  row("UC-002", "UC", UC2_PATH, lineOf(lines[UC2_PATH], `  - ${SAMPLE}`), "realises"),
  row("ARC-001", "ARC", ARC_PATH, lineOf(lines[ARC_PATH], `  - ${SAMPLE}`), "forced_by"),
  row("MOD-reader", "MOD", MOD_PATH, lineOf(lines[MOD_PATH], `  - ${SAMPLE}`), "realises"),
  row("ITM-002", "ITM", ITEM_PATH, lineOf(lines[ITEM_PATH], `  - ${SAMPLE}`), "realises"),
  row("TST-001", "TST", TEST_PATH, lineOf(lines[TEST_PATH], "// TST-001"), "guards"),
];

// TST-473161 · level: unit · module: MOD-trace-graph
// guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; UC-005; UC-006; UC-018
// given: the fixture with its module also realising A SAMPLE RULE, the goal of its use case also naming it — twice on the one line, between backticks —, and a second use case, UC-002, realising it
// input: requirementImpact of its graph, for A SAMPLE RULE
// expect: seven rows, in the order use cases by identifier and line, decisions, modules, items, tests: UC-001's realises, UC-001's goal as names — one row, though the name stands twice on its line —, UC-002's realises, ARC-001's forced_by, MOD-reader's realises, ITM-002's realises and TST-001's guards
test("requirementImpact — a module's realises and a text that names it are rows too, one for each place and each place once", async () => {
  const { lines, graph } = await repository(NAMED_MORE.edits, { extra: NAMED_MORE.extra });
  const writing = graph.edges.filter((edge) => edge.via === "names" && edge.to === SAMPLE);
  assert.equal(writing.length, 2, "known positive: the graph holds the name twice on its line");
  assert.equal(writing[0].line, writing[1].line, "known positive: on one line");
  assert.deepEqual(requirementImpact(graph, SAMPLE), namedMore(lines));
});

// TST-473162 · level: unit · module: MOD-trace-graph
// guards: A REQUIREMENT IS NOT CHANGED WITHOUT AN IMPACT LIST; UC-005; UC-006; UC-018
// given: the fixture of the last test, listed once in its order and once in the reverse order by its TextSource
// input: requirementImpact of the graph of each, for A SAMPLE RULE
// expect: the same seven rows from both, in the same order, though the two graphs hold their edges in another order
test("requirementImpact — the rows come in one order, whatever order the repository lists its files in", async () => {
  const forward = await repository(NAMED_MORE.edits, { extra: NAMED_MORE.extra });
  const backward = await repository(NAMED_MORE.edits, { extra: NAMED_MORE.extra, reverse: true });
  assert.notDeepEqual(backward.graph.edges.map((edge) => edge.from), forward.graph.edges.map((edge) => edge.from),
    "known positive: the graphs hold their edges in another order");
  assert.deepEqual(requirementImpact(forward.graph, SAMPLE), namedMore(forward.lines));
  assert.deepEqual(requirementImpact(backward.graph, SAMPLE), namedMore(backward.lines));
});
