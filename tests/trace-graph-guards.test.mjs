// The tests that guard a requirement (ITM-249) — MOD-trace-graph's interface as docs/architecture/MOD-trace-graph.md
// states it, as far as the release test report needs it: traceGraph reads, of its Data, only SPEC.md through
// MOD-spec-document and the test files through MOD-test-document, so that its graph holds every requirement and every
// test with what it guards, and lists a file it cannot read with the reason; tracesTo gives a requirement the tests
// that guard it. Gaps, impact lists, the module order and rows, the comparison of two graphs and the checks across
// artifacts are not part of ITM-249 and are not tested here.
// Run: node --test tests/trace-graph-guards.test.mjs
//
// Module: MOD-trace-graph
// Guards: UC-013; A REQUIREMENT SHOWS WHAT TRACES TO IT
// Level: unit
//
// Every fixture is a small repository of its own — a SPEC.md and a test file, never Agent M's own — given to traceGraph
// through a TextSource built here. Each test states its input and its expected result before it runs (given / input /
// expect); where a test asserts that nothing is found, the same graph is first shown to find something on a known
// positive (no-test-guards-the-other-requirement, in the tracesTo test). The counter-proofs are recorded in the pull
// request.

import test from "node:test";
import assert from "node:assert/strict";
import { traceGraph, tracesTo } from "../src/trace-graph/index.mjs";

// A TextSource over a fixed set of files: every key is listed in `paths`, `read` resolves its text; a path named in
// `missing` is listed in `paths` too, but `read` resolves null for it — the commit does not hold it, though the
// directory listing names it.
function source(files, missing = []) {
  return {
    paths: [...Object.keys(files), ...missing],
    read: async (path) => (Object.prototype.hasOwnProperty.call(files, path) ? files[path] : null),
  };
}

// A SPEC.md of one section and two requirements: one a test will guard, one no test guards.
const SPEC_LINES = [
  "# Fixture product — Specification",
  "",
  "## Section",
  "",
  "**A GUARDED REQUIREMENT** *(Product Owner)*",
  "A sample rule that a test guards.",
  "*Check:* `tests/sample.test.mjs`",
  "",
  "**AN UNGUARDED REQUIREMENT** *(Product Owner)*",
  "A sample rule that no test guards.",
  "*Check:* no automatic check; at review",
  "",
];
const SPEC_TEXT = SPEC_LINES.join("\n");
const GUARDED = "A GUARDED REQUIREMENT";
const UNGUARDED = "AN UNGUARDED REQUIREMENT";

const requirementNode = (id, line) => ({ id, kind: "requirement", path: "SPEC.md", line, title: null, blob: null });
const testNode = (id, path, line) => ({ id, kind: "TST", path, line, title: null, blob: null });

// ---------------------------------------------------------------- the requirements of SPEC.md are nodes

test("the requirements of SPEC.md are nodes — MOD-trace-graph", async () => {
  const graph = await traceGraph(source({ "SPEC.md": SPEC_TEXT }));
  assert.deepEqual([...graph.nodes.keys()].sort(), [GUARDED, UNGUARDED].sort());
  assert.deepEqual(graph.nodes.get(GUARDED), requirementNode(GUARDED, 5));
  assert.deepEqual(graph.nodes.get(UNGUARDED), requirementNode(UNGUARDED, 9));
  assert.deepEqual(graph.edges, []);
});

// ---------------------------------------------------------------- the tests of a test file are nodes, with a guards
// edge from each to what it guards
//
// TST-001 guards one requirement, TST-002 both — so a test with more than one guarded name gives one edge per name.

const SAMPLE_PATH = "tests/sample.test.mjs";
const SAMPLE_LINES = [
  "// TST-001",
  "// level: unit",
  `// guards: ${GUARDED}`,
  "",
  "// TST-002",
  "// level: unit",
  `// guards: ${GUARDED}; ${UNGUARDED}`,
  "",
];
const SAMPLE_TEXT = SAMPLE_LINES.join("\n");

test("the tests of a test file are nodes, with a guards edge from each to what it guards — MOD-trace-graph", async () => {
  const graph = await traceGraph(source({ [SAMPLE_PATH]: SAMPLE_TEXT }));
  assert.deepEqual([...graph.nodes.keys()].sort(), ["TST-001", "TST-002"]);
  assert.deepEqual(graph.nodes.get("TST-001"), testNode("TST-001", SAMPLE_PATH, 1));
  assert.deepEqual(graph.nodes.get("TST-002"), testNode("TST-002", SAMPLE_PATH, 5));
  assert.deepEqual(graph.edges, [
    { from: "TST-001", to: GUARDED, via: "guards", path: SAMPLE_PATH, line: 1 },
    { from: "TST-002", to: GUARDED, via: "guards", path: SAMPLE_PATH, line: 5 },
    { from: "TST-002", to: UNGUARDED, via: "guards", path: SAMPLE_PATH, line: 5 },
  ]);
});

// ---------------------------------------------------------------- a file that cannot be read

test("a file that cannot be read is listed in unread, with the reason — MOD-trace-graph", async () => {
  const graph = await traceGraph(source({}, ["SPEC.md", SAMPLE_PATH]));
  assert.deepEqual(graph.unread, [
    { path: "SPEC.md", reason: "the commit does not hold it" },
    { path: SAMPLE_PATH, reason: "the commit does not hold it" },
  ]);
  assert.deepEqual([...graph.nodes.keys()], []);
  assert.deepEqual(graph.edges, []);
});

// ---------------------------------------------------------------- tracesTo gives the tests that guard a requirement,
// and none for a requirement that no test guards
//
// TST-007 is declared before TST-003, both guarding the same requirement: tracesTo names them by identifier, not in the
// order they stand in the file — the known positive this test shows before the empty list of the other requirement.

const OTHER_PATH = "tests/other.test.mjs";
const OTHER_LINES = [
  "// TST-007",
  `// guards: ${GUARDED}`,
  "",
  "// TST-003",
  `// guards: ${GUARDED}`,
  "",
];

test("tracesTo gives the tests that guard a requirement, and none for a requirement that no test guards — MOD-trace-graph", async () => {
  const graph = await traceGraph(source({ "SPEC.md": SPEC_TEXT, [OTHER_PATH]: OTHER_LINES.join("\n") }));
  assert.deepEqual(tracesTo(graph, GUARDED),
    { sources: [], useCases: [], decisions: [], modules: [], tests: ["TST-003", "TST-007"], items: [] });
  assert.deepEqual(tracesTo(graph, UNGUARDED),
    { sources: [], useCases: [], decisions: [], modules: [], tests: [], items: [] });
});
