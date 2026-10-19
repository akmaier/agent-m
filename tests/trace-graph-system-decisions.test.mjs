// MOD-trace-graph's systemDecisions (ITM-633), as the accepted text of docs/architecture/MOD-trace-graph.md:227-228 states it: "`systemDecisions(graph: Graph) -> { system: string[], subsystems: string[] }` — the decisions that
// refine no other, and the subsystems' decisions: those that refine one of them and design at least one module; each list by identifier." The two recipes that select these decisions, the system step of MOD-run-planner's
// `implementation-inputs` (src/run-planner/inputs.mjs) and MOD-work-plans' `architecture-and-model` (src/work-plans/strategies.mjs), call it and keep no rule of their own (MOD-run-planner.md:149, MOD-work-plans.md:276).
// Run: node --test tests/trace-graph-system-decisions.test.mjs
//
// Module: MOD-trace-graph
// Guards: UC-045; UC-024
// Level: unit
//
// The graph of the first tests is built by hand in MOD-trace-graph's form (nodes by identifier, edges { from, to, via }); the last of the group reads a product's files with traceGraph. The readings the pull request names:
//   - "those that refine one of them" are the decisions with a `refines` edge to a decision that refines no other; a decision that refines a subsystem's decision is neither a system's nor a subsystem's.
//   - A decision that refines the system and designs no module is in neither list. Several decisions that refine no other are all in `system`.
//   - A recipe "calls it and copies no rule" when its file imports `systemDecisions` from MOD-trace-graph's index and holds no `refines` of its own.
// The counter-proofs are recorded in the pull request. Each test states its input and its expected result before it runs (given / input / expect).

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as traceGraphModule from "../src/trace-graph/index.mjs";

const { systemDecisions, traceGraph } = traceGraphModule;

const node = (id, kind) => [id, { id, kind, path: `docs/architecture/${id}.md` }];
const graphOf = (nodes, edges) => ({ nodes: new Map(nodes.map(([id, kind]) => node(id, kind))), edges: edges.map(([from, to, via]) => ({ from, to, via })) });
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

// TST-633001 · level: unit · module: MOD-trace-graph
// guards: UC-045; UC-024
// given: a graph with the decisions ARC-001 (refines none), ARC-002 (refines ARC-001, designs MOD-a), ARC-003 (refines ARC-001, designs none), ARC-004 (refines ARC-002, designs MOD-b), and a second system ARC-010 (refines none) with ARC-012 (refines ARC-010, designs MOD-c and MOD-d)
// input: systemDecisions(graph)
// expect: system ["ARC-001", "ARC-010"]; subsystems ["ARC-002", "ARC-012"]; ARC-003 (designs no module) and ARC-004 (refines a subsystem, not the system) are in neither
test("systemDecisions — the decisions that refine no other, and the ones that refine them and design a module, by identifier", () => {
  assert.equal(typeof systemDecisions, "function", "MOD-trace-graph provides systemDecisions");
  const graph = graphOf([["ARC-004", "ARC"], ["ARC-012", "ARC"], ["ARC-001", "ARC"], ["ARC-010", "ARC"], ["ARC-003", "ARC"], ["ARC-002", "ARC"], ["MOD-a", "MOD"], ["MOD-b", "MOD"], ["MOD-c", "MOD"], ["MOD-d", "MOD"]],
    [["ARC-002", "ARC-001", "refines"], ["ARC-002", "MOD-a", "designs"], ["ARC-003", "ARC-001", "refines"], ["ARC-004", "ARC-002", "refines"], ["ARC-004", "MOD-b", "designs"],
      ["ARC-012", "ARC-010", "refines"], ["ARC-012", "MOD-c", "designs"], ["ARC-012", "MOD-d", "designs"]]);
  assert.deepEqual(systemDecisions(graph), { system: ["ARC-001", "ARC-010"], subsystems: ["ARC-002", "ARC-012"] });
});

// TST-633002 · level: unit · module: MOD-trace-graph
// guards: UC-045
// given: a graph with no decision; and a graph whose only decisions are two that refine each other's system without designing a module
// input: systemDecisions on each
// expect: the first gives empty lists; the second gives the system and no subsystem; a node of another kind (a module, a use case) is never listed
test("systemDecisions — no decision, no subsystem, and no node of another kind", () => {
  assert.deepEqual(systemDecisions(graphOf([["MOD-a", "MOD"], ["UC-001", "UC"]], [])), { system: [], subsystems: [] });
  const graph = graphOf([["ARC-001", "ARC"], ["ARC-002", "ARC"], ["ARC-003", "ARC"], ["MOD-a", "MOD"]], [["ARC-002", "ARC-001", "refines"], ["ARC-003", "ARC-001", "refines"], ["MOD-a", "ARC-001", "refines"]]);
  assert.deepEqual(systemDecisions(graph), { system: ["ARC-001"], subsystems: [] });
});

// TST-633003 · level: unit · module: MOD-trace-graph
// guards: UC-045
// given: a product's files: ARC-001 stating the system, ARC-002 refining it and designing MOD-reader and MOD-writer, ARC-003 refining it and designing none, MOD-reader and MOD-writer
// input: traceGraph on them; systemDecisions of that graph
// expect: system ["ARC-001"], subsystems ["ARC-002"]: the graph's own edges give the same answer as the hand-made one
test("systemDecisions — over a graph read from a product's files", async () => {
  const lines = (...rows) => `${rows.join("\n")}\n`;
  const decision = (id, extra) => lines("---", `id: ${id}`, `title: ${id} decision`, ...extra, "---", `# ${id} decision`, "", "## Context", "", "c", "", "## Decision", "", "d", "", "## Alternatives", "", "a", "", "## Consequences", "", "q");
  const module_ = (id) => lines("---", `id: ${id}`, `title: ${id}`, `folder: src/${id.slice(4)}/`, "realises:", "follows:", "  - ARC-002", "uses: []", "provides:", "  - f", "---", `# ${id} ${id}`, "", "## Responsibility", "", "r");
  const files = { "docs/architecture/ARC-001-whole.md": decision("ARC-001", ["forced_by:", "  - UC-001"]),
    "docs/architecture/ARC-002-sub.md": decision("ARC-002", ["refines: ARC-001", "forced_by:", "  - UC-001", "designs:", "  - MOD-reader", "  - MOD-writer"]),
    "docs/architecture/ARC-003-extra.md": decision("ARC-003", ["refines: ARC-001", "forced_by:", "  - UC-001"]),
    "docs/architecture/MOD-reader.md": module_("MOD-reader"), "docs/architecture/MOD-writer.md": module_("MOD-writer") };
  const graph = await traceGraph({ paths: Object.keys(files), read: async (path) => files[path] ?? null });
  assert.deepEqual(systemDecisions(graph), { system: ["ARC-001"], subsystems: ["ARC-002"] });
});

// TST-633004 · level: unit · module: MOD-run-planner, MOD-work-plans
// guards: UC-045; UC-024
// given: the files of the two recipes
// input: their text
// expect: each imports systemDecisions from MOD-trace-graph's index and calls it, and neither holds a `"refines"` of its own: the rule stands in MOD-trace-graph alone
test("the recipes of MOD-run-planner and MOD-work-plans call systemDecisions and copy no rule of their own", () => {
  for (const path of ["src/run-planner/inputs.mjs", "src/work-plans/strategies.mjs"]) {
    const text = read(path);
    assert.match(text, /import \{[^}]*\bsystemDecisions\b[^}]*\} from "\.\.\/trace-graph\/index\.mjs"/, `${path} imports systemDecisions`);
    assert.match(text, /\bsystemDecisions\(/, `${path} calls it`);
    assert.doesNotMatch(text, /["']refines["']/, `${path} keeps no rule of refining`);
  }
});
