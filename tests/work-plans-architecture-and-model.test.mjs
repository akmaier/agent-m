// The recipe `architecture-and-model` of MOD-work-plans' `workStrategies` (ITM-610), as the accepted text of docs/architecture/MOD-work-plans.md states it: "recipe
// `architecture-and-model` — the decision that states the system, the subsystems' decisions, the module files, the process model with its phases and gates, and the existing plan",
// with UC-045 step 2 ("what is sent: the decision that states the system, the subsystems' decisions, the module files, the process model with its phases and gates, and the existing
// plan") and MOD-job-runner's `JobContext` and `Part`.
// Run: node --test tests/work-plans-architecture-and-model.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-045; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// Level: unit
//
// The product is a fixture of this file: a SPEC.md, three decisions (ARC-001 states the system, ARC-002 refines it and designs two modules, ARC-003 refines it and designs none), three
// modules (MOD-reader and MOD-writer, designed by ARC-002, and MOD-loose, designed by none), a use case, the process model docs/process.md, an existing plan of two steps with its order,
// two backlog items, code under a module's folder and a test file. The readings where the file leaves one open, which the pull request names:
//   - The system's decision is the one that refines no other; the subsystems' decisions are those that refine it and design at least one module; both are read from the trace graph's
//     `refines` and `designs` edges, as MOD-run-planner's recipe reads them. A decision that refines the system and designs no module is no subsystem's and is not given.
//   - The module files are every module of the product, by identifier. The process model is the file docs/process.md. The existing plan is every file under docs/plan/, by path.
//   - A part is one file, named by its path, whole, given once; it carries the sources of every `places.contents` entry that names its path or a folder above it. The parts stand in the
//     order system, subsystems, modules, process model, plan. Nothing else is given: no SPEC, no use case, no backlog item, no code, no test.
//   - A product without docs/process.md is refused by name (UnknownWork), as MOD-run-planner's recipe refuses a file the product lacks; a product without a plan gives no plan part.
// Each test states its input and its expected result before it runs (given / input / expect); every call is made with a `fetch` that fails the test if it is called. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { prepareJob, registerStrategies } from "../src/job-runner/index.mjs";
import * as workPlans from "../src/work-plans/index.mjs";

const lines = (...rows) => `${rows.join("\n")}\n`;

// ---------------------------------------------------------------- the fixture product

const decision = (id, extra) => lines("---", `id: ${id}`, `title: ${id} decision`, ...extra, "---", `# ${id} decision`, "", "## Context", "", "c", "", "## Decision", "", "d", "",
  "## Alternatives", "", "a", "", "## Consequences", "", "q");
const module_ = (id) => lines("---", `id: ${id}`, `title: ${id}`, `folder: src/${id.slice(4)}/`, "realises:", "follows:", "  - ARC-002", "uses: []", "provides:", "  - f", "---",
  `# ${id} ${id}`, "", "## Responsibility", "", `RESPONSIBILITY-OF-${id}`, "", "## Parts", "", "p", "", "## Data", "", "d", "", "## Interfaces", "", "- `f` — i", "", "## Files", "", "f",
  "", "## Uses", "", "u");
const useCase = (id) => lines("---", `id: ${id}`, `title: ${id} case`, "area: x", "actors:", "  - A", "realises:", "  - A GUARDED RULE", "---", `# ${id} case`, "");
const item = (id, level, modules, extra = []) => lines("---", `id: ${id}`, `title: ${id} item`, `level: ${level}`, "realises:", "  - UC-001", "modules:", ...modules.map((mod) => `  - ${mod}`),
  ...extra, "tests:", "  - unit", "origin:", "  - UC-001", "---", `# ${id} item`, "", "## Outcome", "", "o", "", "## Acceptance", "", "a");

const FILES = {
  "SPEC.md": lines("# Fixture — Specification", "", "## 1. Rules", "", "**A GUARDED RULE** *(Owner)*", "A rule.", "*Check:* `tests/reader.test.mjs`"),
  "docs/process.md": lines("# Process", "", "PROCESS-MODEL-TEXT: phases and gates"),
  "docs/architecture/ARC-001-whole.md": decision("ARC-001", ["forced_by:", "  - UC-001"]),
  "docs/architecture/ARC-002-sub.md": decision("ARC-002", ["refines: ARC-001", "forced_by:", "  - UC-001", "designs:", "  - MOD-reader", "  - MOD-writer"]),
  "docs/architecture/ARC-003-aside.md": decision("ARC-003", ["refines: ARC-001", "forced_by:", "  - UC-001"]),
  "docs/architecture/MOD-reader.md": module_("MOD-reader"),
  "docs/architecture/MOD-writer.md": module_("MOD-writer"),
  "docs/architecture/MOD-loose.md": module_("MOD-loose"),
  "docs/use-cases/UC-001-load.md": useCase("UC-001"),
  "docs/plan/ITM-010-reader.md": item("ITM-010", "module", ["MOD-reader"]),
  "docs/plan/ITM-011-writer.md": item("ITM-011", "module", ["MOD-writer"], ["builds_on:", "  - ITM-010"]),
  "docs/plan/order.md": lines("| Step | Phase |", "| --- | --- |", "| ITM-010 | implementation |", "| ITM-011 | implementation |"),
  "docs/backlog/ITM-020-other.md": item("ITM-020", "module", ["MOD-loose"]),
  "docs/backlog/ITM-021-other.md": item("ITM-021", "module", ["MOD-loose"]),
  "src/reader/index.mjs": "export const read = 1;\n",
  "tests/reader.test.mjs": lines("// TST-001", "// level: unit", "// module: MOD-reader", "// guards: UC-001", "", "// the case follows"),
};

const snapshotOf = (files) => ({ paths: Object.keys(files), read: async (path) => (Object.prototype.hasOwnProperty.call(files, path) ? files[path] : null) });
const contextOf = (files, contents = []) => ({
  kind: null, params: {}, product: { address: "https://github.com/acme/product", snapshot: snapshotOf(files), host: null }, instance: { snapshot: snapshotOf({}), host: null, checkout: null },
  connect: async () => null, participants: [], places: { sources: {}, mailbox: null, contents }, gates: [], person: "alice", now: new Date("2026-10-17T08:00:00Z"),
  agentM: { version: "unreleased", commit: "a".repeat(40) }, jobId: null,
});

// Runs `body` with a fetch that records its calls; the test asserts there were none.
async function offline(body) {
  const real = globalThis.fetch, calls = [];
  globalThis.fetch = async (...args) => { calls.push(args); throw new Error("the recipe must make no request"); };
  try {
    return await body();
  } finally {
    globalThis.fetch = real;
    assert.deepEqual(calls, [], "no request was made");
  }
}
const recipe = (files, contents) => offline(() => workPlans.workStrategies.recipes["architecture-and-model"](contextOf(files, contents), {}));
const namesOf = (parts) => parts.map((part) => part.name);

const ALL = [
  "docs/architecture/ARC-001-whole.md", "docs/architecture/ARC-002-sub.md",
  "docs/architecture/MOD-loose.md", "docs/architecture/MOD-reader.md", "docs/architecture/MOD-writer.md",
  "docs/process.md",
  "docs/plan/ITM-010-reader.md", "docs/plan/ITM-011-writer.md", "docs/plan/order.md",
];

// TST-610001 · level: unit · module: MOD-work-plans
// guards: UC-045
// given: the fixture product, whose system decision is ARC-001 and whose one subsystem decision is ARC-002 (ARC-003 refines ARC-001 and designs no module), with three modules, docs/process.md, a plan of two steps and its
// order, two backlog items, a SPEC, a use case, code and a test
// input: the recipe architecture-and-model
// expect: nine parts, by name, in this order: ARC-001's file, ARC-002's file; the module files MOD-loose, MOD-reader, MOD-writer; docs/process.md; the plan's files docs/plan/ITM-010-reader.md, ITM-011-writer.md, order.md;
// and none of ARC-003, SPEC.md, the use case, the backlog items, the code or the test
test("the recipe gives the system's decision, the subsystems' decisions, every module file, the process model and the existing plan, in that order — MOD-work-plans", async () => {
  const parts = await recipe(FILES);
  assert.deepEqual(namesOf(parts), ALL);
});

// TST-610002 · level: unit · module: MOD-work-plans
// guards: UC-045
// given: the fixture product
// input: the recipe architecture-and-model
// expect: each part is one file given whole (its text is the file's text), required, with a `sources` array; MOD-reader's file still holds its Responsibility line, so a module file is not cut to a section
test("a part is one file given whole, required and carrying its sources — MOD-work-plans", async () => {
  const parts = await recipe(FILES);
  assert.equal(parts.length, 9, "known positive: the parts are there to be checked");
  assert.ok(parts.every((part) => part.required === true && typeof part.text === "string" && Array.isArray(part.sources)));
  for (const part of parts) assert.equal(part.text, FILES[part.name], `${part.name} is given whole`);
  assert.match(parts.find((part) => part.name === "docs/architecture/MOD-reader.md").text, /RESPONSIBILITY-OF-MOD-reader/);
});

// TST-610003 · level: unit · module: MOD-work-plans
// guards: UC-045; RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
// given: the fixture product, and places.contents naming SRC-secret for the folder docs/plan and for docs/architecture/MOD-writer.md, and SRC-other for the one file docs/process.md
// input: the recipe architecture-and-model
// expect: the three plan parts and MOD-writer's file carry ["SRC-secret"]; docs/process.md carries ["SRC-other"]; every other part carries none; with places.contents empty no part carries any source
test("a part carries a source only where places.contents puts its path under that source — MOD-work-plans", async () => {
  const contents = [{ source: "SRC-secret", paths: ["docs/plan", "docs/architecture/MOD-writer.md"] }, { source: "SRC-other", paths: ["docs/process.md"] }];
  const parts = await recipe(FILES, contents);
  assert.deepEqual(Object.fromEntries(parts.map((part) => [part.name, part.sources])), {
    "docs/architecture/ARC-001-whole.md": [], "docs/architecture/ARC-002-sub.md": [], "docs/architecture/MOD-loose.md": [], "docs/architecture/MOD-reader.md": [],
    "docs/architecture/MOD-writer.md": ["SRC-secret"], "docs/process.md": ["SRC-other"],
    "docs/plan/ITM-010-reader.md": ["SRC-secret"], "docs/plan/ITM-011-writer.md": ["SRC-secret"], "docs/plan/order.md": ["SRC-secret"],
  });
  const none = await recipe(FILES, []);
  assert.deepEqual(none.map((part) => part.sources), none.map(() => []));
});

// TST-610004 · level: unit · module: MOD-work-plans
// guards: UC-045
// given: the fixture product without its plan (no file under docs/plan/)
// input: the recipe architecture-and-model
// expect: six parts — ARC-001, ARC-002, the three module files, docs/process.md — and no plan part; the product with its plan gives nine (TST-610001), so the absence is the product's, not the recipe's omission
test("a product without a plan gives no plan part — MOD-work-plans", async () => {
  const files = Object.fromEntries(Object.entries(FILES).filter(([path]) => !path.startsWith("docs/plan/")));
  assert.equal((await recipe(FILES)).length, 9, "known positive: the plan's files are parts when the product has them");
  assert.deepEqual(namesOf(await recipe(files)), ALL.slice(0, 6));
});

// TST-610005 · level: unit · module: MOD-work-plans
// guards: UC-045
// given: the fixture product, and the same product without docs/process.md
// input: the recipe architecture-and-model
// expect: the first gives its nine parts; the second is refused with UnknownWork { id: "docs/process.md" }
test("a product without its process model is refused by name — MOD-work-plans", async () => {
  assert.equal((await recipe(FILES)).length, 9, "known positive");
  const { "docs/process.md": _gone, ...without } = FILES;
  await assert.rejects(recipe(without), (error) => error.name === "UnknownWork" && error.id === "docs/process.md");
});

// TST-610006 · level: unit · module: MOD-work-plans
// guards: UC-045; ONE DEFINITION, THREE DRIVERS
// given: the fixture product, the recipe registered under the owner MOD-work-plans with stand-ins for the other strategies the kind `draft-plan` names (the precondition `rests-on-accepted` and the writer `plan-steps`); the check `plan-checks` is MOD-work-plans' own (ITM-613)
// input: prepareJob("draft-plan", context, no drafter)
// expect: it does not throw UnknownStrategy, and its parts of the recipe `architecture-and-model` are the nine parts of TST-610001, in that order
test("the kind draft-plan prepares with the recipe registered — MOD-work-plans", async () => {
  registerStrategies("MOD-work-plans", workPlans.workStrategies);
  registerStrategies("tests/work-plans-architecture-and-model.test.mjs", {
    preconditions: { "rests-on-accepted": async () => null },
    writers: { "plan-steps": async () => ({ commits: [], files: [], pullRequest: null, shown: null, notes: [] }) },
  });
  const prepared = await offline(() => prepareJob("draft-plan", contextOf(FILES), { drafter: null, reviewers: [] }));
  assert.deepEqual(namesOf(prepared.parts.filter((part) => part.recipe === "architecture-and-model")), ALL);
});
