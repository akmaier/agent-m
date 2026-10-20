// MOD-work-plans' planFindings takes the graph of the commit (ITM-1156), as the accepted text of docs/architecture/MOD-work-plans.md states it: "`planFindings(plan, steps, architecture, workflow,
// source, history?, graph?)` … `graph`, the graph `traceGraph` gives, is passed only by a caller whose steps are the commit's own — the plan page, with the graph it asked for with its commit —;
// `graphFindings` then runs on it and `source` is read for no graph. Without `graph`, the graph is built from `source`, as above", and "check `plan-checks` — `planFindings` on a drafted plan, with the
// product's workflow and no `graph`, since its steps are drafted".
// Run: node --test tests/work-plans-plan-findings-graph.test.mjs
//
// Module: MOD-work-plans
// Guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A PLAN STEP NAMES THE TESTS OF ITS LEVEL; UC-045
// Level: unit
//
// The product is the small fixture of tests/work-plans-plan-checks.test.mjs (copied in part), held in memory; the TextSource keeps every read, and the fixture holds a test file only the graph reads.
// Nothing reaches the network. Where the module file leaves a reading open, the test states the one it takes, and the pull request names it:
//   - A step of level `module` that names the tests of another level (`component`) is the finding the graph gives: A PLAN STEP NAMES THE TESTS OF ITS LEVEL, naming the step.
//   - "Source is read for no graph" is: the file only the graph reads (tests/sample.test.mjs) is not read through `source`.
//   - That the graph given is the graph used is seen by giving a graph of the sound files while `source` holds the wrong step: the finding of the wrong step does not appear.
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { artifactSchemas, readDocument } from "../src/documents/index.mjs";
import { traceGraph } from "../src/trace-graph/index.mjs";
import * as workPlans from "../src/work-plans/index.mjs";

const lines = (...rows) => `${rows.join("\n")}\n`;
const WORKFLOW = { phases: [{ name: "Implementation" }, { name: "Testing" }], gates: [], model: { name: "v-model" } };
const LEVEL = "A PLAN STEP NAMES THE TESTS OF ITS LEVEL";
const ONLY_THE_GRAPH = "tests/sample.test.mjs";

const decision = (id, extra) => lines("---", `id: ${id}`, `title: ${id} decision`, ...extra, "---", `# ${id} decision`, "", "## Context", "", "c", "", "## Decision", "", "d", "", "## Alternatives", "", "a", "", "## Consequences", "", "q");
const module_ = (id) => lines("---", `id: ${id}`, `title: ${id}`, `folder: src/${id.slice(4)}/`, "realises:", "follows:", "  - ARC-002", "uses: []", "provides:", "  - read", "---", `# ${id} ${id}`, "", "## Responsibility", "", "r", "",
  "## Parts", "", "p", "", "## Data", "", "d", "", "## Interfaces", "", "- `read` — i", "", "## Files", "", "f", "", "## Uses", "", "u");
const step = (id, level, modules, tests) => lines("---", `id: ${id}`, `title: ${id} step`, `level: ${level}`, "realises:", "  - A RULE", "modules:", ...modules.map((each) => `  - ${each}`), "tests:", ...tests.map((each) => `  - ${each}`),
  "origin:", "  - UC-001", "---", `# ${id} step`, "", "## Outcome", "", "o", "", "## Acceptance", "", "a");
const order = (rows) => lines("## Order", "", "| Step | Phase |", "| --- | --- |", ...rows.map(([id, phase]) => `| ${id} | ${phase} |`));

const ARCHITECTURE = {
  "docs/architecture/ARC-001-whole.md": decision("ARC-001", ["forced_by:", "  - UC-001"]),
  "docs/architecture/ARC-002-sub.md": decision("ARC-002", ["refines: ARC-001", "forced_by:", "  - UC-001", "designs:", "  - MOD-reader"]),
  "docs/architecture/MOD-reader.md": module_("MOD-reader"),
};
const stepsWith = (moduleTests) => ({
  "docs/plan/ITM-010-reader.md": step("ITM-010", "module", ["MOD-reader"], moduleTests), "docs/plan/ITM-012-sub.md": step("ITM-012", "subsystem", ["MOD-reader"], ["component"]),
  "docs/plan/ITM-013-system.md": step("ITM-013", "system", ["MOD-reader"], ["system", "release"]),
});
const ORDER = [["ITM-010", "Implementation"], ["ITM-012", "Testing"], ["ITM-013", "Testing"]];
const filesOf = (moduleTests) => ({ "SPEC.md": lines("# Fixture", "", "## 1. Rules", "", "**A RULE** *(Owner)*", "A rule.", "*Check:* no automatic check; at review."), ...ARCHITECTURE, ...stepsWith(moduleTests),
  "docs/plan/order.md": order(ORDER), [ONLY_THE_GRAPH]: lines("// TST-001", "// level: unit", "// guards: A RULE", "") });

// The documents planFindings gets, and a TextSource over the same files that keeps what is read through it.
function setting(moduleTests) {
  const files = filesOf(moduleTests), reads = [];
  const schemas = artifactSchemas();
  const source = { paths: Object.keys(files), read: async (path) => { reads.push(path); return files[path] ?? null; } };
  const plain = { paths: Object.keys(files), read: async (path) => files[path] ?? null };
  return { files, reads, source, plain, plan: readDocument(workPlans.planSchemas.planOrder, "docs/plan/order.md", files["docs/plan/order.md"]),
    steps: Object.keys(stepsWith(moduleTests)).map((path) => readDocument(schemas.item, path, files[path])),
    architecture: Object.keys(ARCHITECTURE).map((path) => readDocument(/\/ARC-/.test(path) ? schemas.decision : schemas.module, path, files[path])) };
}
const levelFindings = (findings) => findings.filter((each) => each.rule === LEVEL);

// TST-1156001 · level: unit · module: MOD-work-plans
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A PLAN STEP NAMES THE TESTS OF ITS LEVEL; UC-045
// given: a plan whose module step ITM-010 names the tests of another level (component); the graph of the same files, built apart
// input: planFindings with that graph; and, as the known positive, planFindings without it
// expect: with the graph, the finding of ITM-010 under A PLAN STEP NAMES THE TESTS OF ITS LEVEL stands and the test file only the graph reads is not read through `source`; without it, the same finding and that file is read
test("planFindings — given the graph of the commit, the findings of the graph come from it and source is read for no graph", async () => {
  const wrong = setting(["component"]);
  const graph = await traceGraph(wrong.plain);
  const withGraph = await workPlans.planFindings(wrong.plan, wrong.steps, wrong.architecture, WORKFLOW, wrong.source, undefined, graph);
  assert.ok(levelFindings(withGraph).some((each) => /ITM-010/.test(each.what)), "the graph's finding is raised");
  assert.equal(wrong.reads.filter((path) => path === ONLY_THE_GRAPH).length, 0, "source is read for no graph");
  const built = setting(["component"]);
  const without = await workPlans.planFindings(built.plan, built.steps, built.architecture, WORKFLOW, built.source);
  assert.deepEqual(without.map((each) => each.what), withGraph.map((each) => each.what), "the same findings");
  assert.ok(built.reads.filter((path) => path === ONLY_THE_GRAPH).length >= 1, "known positive: without the graph it is built from source");
});

// TST-1156002 · level: unit · module: MOD-work-plans
// guards: A PAGE LOAD READS THE REPOSITORY IN BATCHES; A PLAN STEP NAMES THE TESTS OF ITS LEVEL
// given: `source` holding the wrong step ITM-010 (tests: component) and the graph of the sound files (tests: unit)
// input: planFindings with the sound graph; and planFindings without a graph on the same source
// expect: with the sound graph no finding under A PLAN STEP NAMES THE TESTS OF ITS LEVEL — the graph given is the graph used, not source's; without a graph the finding of ITM-010 is raised (the counter-proof)
test("planFindings — the graph given is the one graphFindings runs on, not a graph of source", async () => {
  const wrong = setting(["component"]), sound = setting(["unit"]);
  const soundGraph = await traceGraph(sound.plain);
  const given = await workPlans.planFindings(wrong.plan, wrong.steps, wrong.architecture, WORKFLOW, wrong.source, undefined, soundGraph);
  assert.deepEqual(levelFindings(given), []);
  const other = setting(["component"]);
  const built = await workPlans.planFindings(other.plan, other.steps, other.architecture, WORKFLOW, other.source);
  assert.ok(levelFindings(built).some((each) => /ITM-010/.test(each.what)), "counter-proof: from source the finding is raised");
});
