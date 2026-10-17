// What traces to a requirement (ITM-597) — MOD-trace-graph's `tracesTo` as docs/architecture/MOD-trace-graph.md states it: for a requirement,
// the items of its source its node keeps, and every use case, decision, module, test and item that names it; a module traces to a
// requirement also through the tests of it that guard the requirement. The sources and the tests are asserted in
// tests/trace-graph-facts.test.mjs and tests/trace-graph-guards.test.mjs; the lists asserted here are the other four.
// Run: node --test tests/trace-graph-traces.test.mjs
//
// Module: MOD-trace-graph
// Guards: A REQUIREMENT SHOWS WHAT TRACES TO IT
// Level: unit
//
// Every fixture is a small repository of its own, given to traceGraph through a TextSource built here. Each test states its input and its
// expected result before it runs (given / input / expect); the expected lists are written in the test, not read from a document. Where a
// test asserts that a list holds nothing, the same graph is first shown to fill that list for another requirement (the known positive).
// The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { traceGraph, tracesTo } from "../src/trace-graph/index.mjs";

const TICK = "`";
const source = (files) => ({ paths: Object.keys(files), read: async (path) => (Object.prototype.hasOwnProperty.call(files, path) ? files[path] : null) });

const SPEC = [
  "# Fixture — Specification", "", "## Section", "",
  "**ALPHA RULE** *(Product Owner)*", "Alpha rule.", `*Check:* ${TICK}tests/a.test.mjs${TICK}`, "",
  "**BETA RULE** *(Product Owner; Vibe Coding, ch. 9)*", "Beta rule.", "*Check:* at review", "",
  "**GAMMA RULE** *(Product Owner)*", "Gamma rule.", "*Check:* at review", "",
].join("\n");

// A document with front matter: the lists are `key: [values]`, written as the block lists the artifacts use.
function document(id, title, keys = {}, body = "") {
  const lines = ["---", `id: ${id}`, `title: ${title}`];
  for (const [key, values] of Object.entries(keys)) {
    if (Array.isArray(values)) lines.push(`${key}:`, ...values.map((value) => `  - ${value}`));
    else lines.push(`${key}: ${values}`);
  }
  return [...lines, "---", `# ${id} ${title}`, "", body, ""].join("\n");
}
const declaration = (id, guards, module) => [`// ${id}`, "// level: unit", ...(module ? [`// module: ${module}`] : []), `// guards: ${guards}`, ""].join("\n");

// UC-009 stands first among the files and UC-001 second, so that an order by identifier differs from the order of the files; UC-001 names ALPHA RULE
// twice (its front matter and a line of its text); UC-002 realises BETA RULE and names ALPHA RULE only in its text.
const FILES = {
  "SPEC.md": SPEC,
  "docs/use-cases/UC-009-ninth.md": document("UC-009", "Ninth", { realises: ["ALPHA RULE"] }),
  "docs/use-cases/UC-001-first.md": document("UC-001", "First", { realises: ["ALPHA RULE"] }, `It rests on ${TICK}ALPHA RULE${TICK}.`),
  "docs/use-cases/UC-002-second.md": document("UC-002", "Second", { realises: ["BETA RULE"] }, `It also touches ${TICK}ALPHA RULE${TICK}.`),
  "docs/architecture/ARC-001-decision.md": document("ARC-001", "Decision", { forced_by: ["ALPHA RULE"] }),
  "docs/architecture/MOD-direct.md": document("MOD-direct", "Direct", { folder: "src/direct/", realises: ["ALPHA RULE"] }),
  "docs/architecture/MOD-tested.md": document("MOD-tested", "Tested", { folder: "src/tested/", realises: ["BETA RULE"] }),
  "docs/architecture/MOD-other.md": document("MOD-other", "Other", { folder: "src/other/", realises: ["BETA RULE"] }),
  "docs/backlog/ITM-001-first-item.md": document("ITM-001", "First item", { realises: ["ALPHA RULE"], modules: ["MOD-direct"] }),
  "docs/plan/ITM-002-second-item.md": document("ITM-002", "Second item", { realises: ["BETA RULE"], modules: ["MOD-other"] }),
  // TST-001 guards ALPHA RULE and exercises MOD-tested, which does not name ALPHA RULE; TST-002 exercises `system`, TST-003 a module no file describes.
  "tests/a.test.mjs": [declaration("TST-001", "ALPHA RULE", "MOD-tested"), declaration("TST-002", "ALPHA RULE", "system"), declaration("TST-003", "ALPHA RULE", "MOD-ghost")].join("\n"),
  "tests/b.test.mjs": declaration("TST-004", "BETA RULE", "MOD-other"),
};

// TST-597101 · level: unit · module: MOD-trace-graph
// guards: A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture repository above, with UC-009 listed before UC-001 and UC-001 naming ALPHA RULE twice
// input: tracesTo of ALPHA RULE and of BETA RULE
// expect: ALPHA RULE — use cases UC-001, UC-002, UC-009; decision ARC-001; modules MOD-direct and MOD-tested; tests TST-001, TST-002, TST-003; item ITM-001. BETA RULE — use case UC-002; no decision; modules MOD-other and MOD-tested; test TST-004; item ITM-002. Each list by identifier, once
test("tracesTo gives a requirement the use cases, decisions, modules, tests and items that name it, each by identifier and once — MOD-trace-graph", async () => {
  const graph = await traceGraph(source(FILES));
  assert.deepEqual(tracesTo(graph, "ALPHA RULE"), {
    sources: ["Product Owner"],
    useCases: ["UC-001", "UC-002", "UC-009"],
    decisions: ["ARC-001"],
    modules: ["MOD-direct", "MOD-tested"],
    tests: ["TST-001", "TST-002", "TST-003"],
    items: ["ITM-001"],
  });
  assert.deepEqual(tracesTo(graph, "BETA RULE"), {
    sources: ["Product Owner", "Vibe Coding, ch. 9"],
    useCases: ["UC-002"],
    decisions: [],
    modules: ["MOD-other", "MOD-tested"],
    tests: ["TST-004"],
    items: ["ITM-002"],
  });
});

// TST-597102 · level: unit · module: MOD-trace-graph
// guards: A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture repository; TST-001 guards ALPHA RULE and exercises MOD-tested, whose file realises BETA RULE only; TST-002 exercises `system`; TST-003 exercises MOD-ghost, which no file describes
// input: tracesTo of ALPHA RULE
// expect: MOD-tested is among its modules, through TST-001 alone (known positive); neither `system` nor MOD-ghost is, since each is no module of the graph
test("a module traces to a requirement through the tests of it that guard the requirement, and only a module the graph holds — MOD-trace-graph", async () => {
  const graph = await traceGraph(source(FILES));
  assert.ok(!graph.edges.some((edge) => edge.from === "MOD-tested" && edge.to === "ALPHA RULE"), "known positive: MOD-tested's own file does not name ALPHA RULE");
  const { modules } = tracesTo(graph, "ALPHA RULE");
  assert.ok(modules.includes("MOD-tested"), "MOD-tested is a module of ALPHA RULE through TST-001");
  assert.ok(!modules.includes("system") && !modules.includes("MOD-ghost"), `no module for system or MOD-ghost: ${modules}`);
});

// TST-597103 · level: unit · module: MOD-trace-graph
// guards: A REQUIREMENT SHOWS WHAT TRACES TO IT
// given: the fixture repository, and UC-005 realising NO SUCH RULE, a name no requirement of the SPEC bears
// input: tracesTo of GAMMA RULE, which nothing names, and of NO SUCH RULE
// expect: GAMMA RULE gives its source and an empty list of every other kind (the same graph filled them for ALPHA RULE); NO SUCH RULE gives no source and UC-005 as its only use case
test("a requirement nothing names has every list empty, and a name no requirement bears still lists what names it — MOD-trace-graph", async () => {
  const graph = await traceGraph(source({ ...FILES, "docs/use-cases/UC-005-fifth.md": document("UC-005", "Fifth", { realises: ["NO SUCH RULE"] }) }));
  assert.equal(tracesTo(graph, "ALPHA RULE").useCases.length, 3, "known positive: the same graph fills the lists for another requirement");
  assert.deepEqual(tracesTo(graph, "GAMMA RULE"), { sources: ["Product Owner"], useCases: [], decisions: [], modules: [], tests: [], items: [] });
  assert.deepEqual(tracesTo(graph, "NO SUCH RULE"), { sources: [], useCases: ["UC-005"], decisions: [], modules: [], tests: [], items: [] });
});
