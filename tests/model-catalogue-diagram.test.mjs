// ITM-630: the supplied process model's semantic facts through the public modelDiagram interface.
// Module: MOD-model-catalogue
// Guards: UC-031; THE MODEL DETERMINES THE PHASES AND THE GATES
// Level: unit
// Run: node --test tests/model-catalogue-diagram.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import * as models from "../src/model-catalogue/index.mjs";
import { readDocument } from "../src/documents/index.mjs";

const PLANNED_PATH = "docs/process-models/specimen-design.md";
const PULLED_PATH = "docs/process-models/specimen-board.md";
const VERSION = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const PLANNED = [
  "---", "name: specimen-design", "kind: planned", "measure: plan entries per phase", "---", "# Specimen design", "",
  "## Phases", "", "| Name | Role | Produces |", "|---|---|---|",
  "| Survey | Steward | requirements |", "| Design | Steward | ARC |", "| Build | Maker | MOD, TST |", "| Inspect | Checker | TST |", "",
  "## Transitions", "", "| From | To | Kind |", "|---|---|---|",
  "| Survey | Design | sequence |", "| Design | Build | alternative |", "| Design | Inspect | alternative |",
  "| Build | Inspect | sequence |", "| Inspect | Design | back |", "",
  "## Verification pairs", "", "| Phase | Checked by |", "|---|---|", "| Survey | Inspect |", "| Design | Inspect |", "",
  "## Gates", "", "| Between | Artifacts | Condition | Decider |", "|---|---|---|---|",
  "| Design \u2192 Build | ARC | Design accepted | Steward |",
  "| Build \u2192 Inspect | MOD and TST | Checks pass | check: compile-and-test |", "",
  "## Roles", "", "| Name | Filled by | How many | Capabilities |", "|---|---|---|---|",
  "| Steward | either | one | read the repository |", "| Maker | agent | several | write to the repository |",
  "| Checker | either | several | run code and tests |", "",
].join("\n");
const PULLED = [
  "---", "name: specimen-board", "kind: pulled", "measure: items per state over time", "---", "# Specimen board", "",
  "## Phases", "", "| Name | Role | Produces |", "|---|---|---|",
  "| Queue | Reviewer | ITM |", "| Work | Contributor | MOD |", "| Review | Reviewer | TST |", "",
  "## Transitions", "", "| From | To | Kind |", "|---|---|---|",
  "| Queue | Work | sequence |", "| Queue | Review | alternative |", "| Work | Review | sequence |",
  "| Review | Work | back |", "| Review | Queue | back |", "",
  "## Verification pairs", "", "| Phase | Checked by |", "|---|---|", "| Work | Review |", "",
  "## Gates", "", "| Between | Artifacts | Condition | Decider |", "|---|---|---|---|",
  "| Work \u2192 Review | MOD | Patch reviewed | Reviewer |", "| Review \u2192 Queue | TST | Checks pass | check: board-tests |", "",
  "## Roles", "", "| Name | Filled by | How many | Capabilities |", "|---|---|---|---|",
  "| Reviewer | either | one | read the repository |", "| Contributor | agent | several | write to the repository |", "",
  "## Flow control", "", "| Kind | Value |", "|---|---|", "| WIP limit | 3 |", "| Time box | none |", "| Sprints | no |", "",
].join("\n");

// Existing public catalogue/Document fixture pattern; expected facts never come from runtime formal documents.
async function fixture(t) {
  const files = new Map([[PLANNED_PATH, PLANNED], [PULLED_PATH, PULLED]]);
  const invalid = PLANNED.replace("| Survey | Design | sequence |", "| Survey | Unknown | sequence |");
  assert.ok(models.modelFindings(readDocument(models.modelSchema.model, PLANNED_PATH, invalid))
    .some((finding) => finding.rule === "THE MODEL DETERMINES THE PHASES AND THE GATES"), "known-positive validator finding");
  for (const [path, text] of files) assert.deepEqual(models.modelFindings(readDocument(models.modelSchema.model, path, text)), []);
  const catalogue = await models.catalogue({
    repository: { server: "github", origin: "https://github.com", path: "fixture/instance", web: "https://github.com/fixture/instance" },
    ref: "main", commit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", paths: [...files.keys()],
    read: async (path) => files.get(path) ?? null, readMany: async () => {}, blob: (path) => files.has(path) ? VERSION : null,
  });
  assert.deepEqual(catalogue.findings[PLANNED_PATH], []);
  assert.deepEqual(catalogue.findings[PULLED_PATH], []);
  const planned = catalogue.models.find((model) => model.path === PLANNED_PATH);
  const pulled = catalogue.models.find((model) => model.path === PULLED_PATH);
  assert.equal(planned.kind, "planned");
  assert.equal(pulled.kind, "pulled");
  assert.deepEqual(planned.phases.map(({ name }) => name), ["Survey", "Design", "Build", "Inspect"]);
  assert.deepEqual(pulled.phases.map(({ name }) => name), ["Queue", "Work", "Review"]);
  const grid = models.planGrid(["A SPECIMEN RULE"], planned);
  assert.deepEqual({ ...grid, entries: [...grid.entries].sort((a, b) => a.phase.localeCompare(b.phase)) }, {
    entries: [{ requirement: "A SPECIMEN RULE", phase: "Build" }, { requirement: "A SPECIMEN RULE", phase: "Design" },
      { requirement: "A SPECIMEN RULE", phase: "Inspect" }, { requirement: "A SPECIMEN RULE", phase: "Survey" }],
    count: "1 requirements \u00d7 4 phases = 4 plan entries",
  });
  readerControl();
  t.diagnostic("Known-positive catalogue, modelFindings, planGrid and label/connection observer controls passed.");
  return { planned, pulled };
}

const words = (text) => String(text).replace(/<br\s*\/?\s*>|\\n/g, " ").replace(/#quot;|&quot;/g, '"')
  .replace(/#lt;|&lt;/g, "<").replace(/#gt;|&gt;/g, ">").replace(/\s+/g, " ").trim();

// Read named nodes and labelled connections, like the existing diagram tests, without fixed IDs, order, shape or layout.
// Facts may annotate an edge or an intermediate gate node. This is an observer, not a diagram generator or expected oracle.
function observed(source, wanted) {
  if (source === undefined) return undefined;
  assert.equal(typeof source, "string");
  const nodes = new Map();
  let edgesText = source.replace(/^\s*%%.*$/gm, "");
  edgesText = edgesText.replace(/\b([\w.-]+)\s*(?:\[\[?|\(\(?|\{\{?)\s*"([^"]*)"\s*(?:\]\]?|\)\)?|\}\}?)/g,
    (_, id, label) => { nodes.set(id, words(label)); return id; });
  edgesText = edgesText.replace(/\b([\w.-]+)\s*[\[({]([^\[\](){}\n]+)[\])}]/g,
    (_, id, label) => { nodes.set(id, words(label)); return id; });
  edgesText = edgesText.replace(/\b([\w.-]+)\s+--\s+([^\n]+?)\s+-->\s*([\w.-]+)/g, "$1 -->|$2| $3");
  const edges = [...edgesText.matchAll(/([\w.-]+)\s*(<[-=.]+>|[-=.]+>)\s*(?:\|([^|]*)\|\s*)?([\w.-]+)/g)]
    .flatMap(([, from, arrow, label = "", to]) => {
      const edge = { from, to, label: words(label) };
      return arrow.startsWith("<") ? [edge, { ...edge, from: to, to: from }] : [edge];
    });
  const named = (id, name) => (nodes.get(id) ?? id).split(/\s*[\n:;]\s*|<br\s*\/?\s*>/)[0] === name
    || (nodes.get(id) ?? id) === name || (nodes.get(id) ?? id).startsWith(`${name} `);
  const phaseNames = ["Survey", "Design", "Build", "Inspect", "Queue", "Work", "Review", "Outline", "First", "Last"];
  const paths = (from, to) => edges.filter((edge) => named(edge.from, from)).flatMap((edge) =>
    named(edge.to, to) ? [edge.label] : phaseNames.some((name) => named(edge.to, name)) ? []
      : edges.filter((next) => next.from === edge.to && named(next.to, to))
        .map((next) => `${edge.label} ${nodes.get(edge.to) ?? ""} ${next.label}`));
  return wanted.filter((fact) => {
    if (fact.phase && !fact.checkedBy) return [...nodes].some(([id]) => named(id, fact.phase))
      || edges.some(({ from, to }) => named(from, fact.phase) || named(to, fact.phase));
    if (fact.checkedBy) return [...paths(fact.phase, fact.checkedBy), ...paths(fact.checkedBy, fact.phase)]
      .some((label) => /verif|checks|checked by|pair/i.test(label));
    const labels = paths(fact.from, fact.to);
    return labels.some((label) => fact.kind ? label.includes(fact.kind)
      : [fact.artifacts, fact.condition, fact.decider].every((value) => label.includes(value)));
  });
}

function readerControl() {
  const wanted = [{ phase: "First" }, { from: "First", to: "Last", kind: "sequence" }];
  assert.deepEqual(observed('flowchart LR\n z["Last"]\n x["First"]\n x -->|sequence| z', wanted), wanted);
  assert.deepEqual(observed('graph TD; other("First") -->|sequence| tail{"Last"}', wanted), wanted);
  assert.deepEqual(observed('graph TD\n x["First"]\n z["Last"]\n z -->|sequence| x', wanted), [{ phase: "First" }]);
  assert.deepEqual(observed('graph LR\n a["First"] -->|sequence| mid["Build"]\n mid -->|sequence| b["Last"]', wanted),
    [{ phase: "First" }], "another process phase does not stand in for the direct transition");
  const gate = [{ from: "First", to: "Last", artifacts: "ARC", condition: "Accepted", decider: "Owner" }];
  assert.deepEqual(observed('graph LR\n a["First"] --> g{"ARC: Accepted; Owner"}\n g --> b["Last"]', gate), gate);
}

// TST-630001
// level: unit
// module: MOD-model-catalogue
// guards: UC-031; THE MODEL DETERMINES THE PHASES AND THE GATES
// given: the valid planned specimen-design and the passing public input/observer controls
// input: public modelDiagram(planned)
// expect: phases Survey, Design, Build, Inspect; Survey -> Design sequence and Build -> Inspect sequence, with arbitrary node IDs/layout
test("TST-630001 planned phases and sequence endpoints remain visible", async (t) => {
  const { planned } = await fixture(t);
  const expected = [{ phase: "Survey" }, { phase: "Design" }, { phase: "Build" }, { phase: "Inspect" },
    { from: "Survey", to: "Design", kind: "sequence" }, { from: "Build", to: "Inspect", kind: "sequence" }];
  assert.deepEqual(observed(models.modelDiagram?.(planned), expected), expected);
});

// TST-630002
// level: unit
// module: MOD-model-catalogue
// guards: UC-031; THE MODEL DETERMINES THE PHASES AND THE GATES
// given: the same valid planned model, branching from Design and returning from Inspect
// input: public modelDiagram(planned)
// expect: Design -> Build alternative; Design -> Inspect alternative; Inspect -> Design back, not reversed
test("TST-630002 alternative and back transitions retain their endpoints and kinds", async (t) => {
  const { planned } = await fixture(t);
  const expected = [{ from: "Design", to: "Build", kind: "alternative" },
    { from: "Design", to: "Inspect", kind: "alternative" }, { from: "Inspect", to: "Design", kind: "back" }];
  assert.deepEqual(observed(models.modelDiagram?.(planned), expected), expected);
});

// TST-630003
// level: unit
// module: MOD-model-catalogue
// guards: UC-031; THE MODEL DETERMINES THE PHASES AND THE GATES
// given: the valid planned model pairs Survey with Inspect and Design with Inspect
// input: public modelDiagram(planned)
// expect: both stated verification pairs represented, independently of transition arrows and diagram ordering
test("TST-630003 verification pairs connect the stated phases", async (t) => {
  const { planned } = await fixture(t);
  const expected = [{ phase: "Survey", checkedBy: "Inspect" }, { phase: "Design", checkedBy: "Inspect" }];
  assert.deepEqual(observed(models.modelDiagram?.(planned), expected), expected);
});

// TST-630004
// level: unit
// module: MOD-model-catalogue
// guards: UC-031; THE MODEL DETERMINES THE PHASES AND THE GATES; A GATE NAMES WHAT IT CHECKS; A GATE NAMES WHO DECIDES IT
// given: two valid gates, one decided by a role and one by an automated check
// input: public modelDiagram(planned)
// expect: Design -> Build: ARC, Design accepted, Steward; Build -> Inspect: MOD and TST, Checks pass, check: compile-and-test
test("TST-630004 gates attach complete facts and role/check deciders to their endpoints", async (t) => {
  const { planned } = await fixture(t);
  const expected = [{ from: "Design", to: "Build", artifacts: "ARC", condition: "Design accepted", decider: "Steward" },
    { from: "Build", to: "Inspect", artifacts: "MOD and TST", condition: "Checks pass", decider: "check: compile-and-test" }];
  assert.deepEqual(observed(models.modelDiagram?.(planned), expected), expected);
});

// TST-630005
// level: unit
// module: MOD-model-catalogue
// guards: UC-031; THE MODEL DETERMINES THE PHASES AND THE GATES; THE CATALOGUE IS DATA
// given: distinct valid pulled specimen-board, WIP 3, with Queue/Work/Review rather than the planned model's facts
// input: public modelDiagram(pulled)
// expect: all three phases, all five literal transitions, Work checked by Review and both complete gates below
test("TST-630005 a pulled model renders its own supplied facts", async (t) => {
  const { pulled } = await fixture(t);
  const expected = [{ phase: "Queue" }, { phase: "Work" }, { phase: "Review" },
    { from: "Queue", to: "Work", kind: "sequence" }, { from: "Queue", to: "Review", kind: "alternative" },
    { from: "Work", to: "Review", kind: "sequence" }, { from: "Review", to: "Work", kind: "back" },
    { from: "Review", to: "Queue", kind: "back" }, { phase: "Work", checkedBy: "Review" },
    { from: "Work", to: "Review", artifacts: "MOD", condition: "Patch reviewed", decider: "Reviewer" },
    { from: "Review", to: "Queue", artifacts: "TST", condition: "Checks pass", decider: "check: board-tests" }];
  assert.deepEqual(observed(models.modelDiagram?.(pulled), expected), expected);
});

// TST-630006
// level: unit
// module: MOD-model-catalogue
// guards: UC-031; THE MODEL DETERMINES THE PHASES AND THE GATES; THE CATALOGUE IS DATA
// given: the same planned model name with supplied Design renamed Outline, a changed transition kind/pair and changed gate facts
// input: public modelDiagram of the changed Model, then of the original positive-control Model
// expect: changed facts below, no Design phase or old Design gate; original call still has its original Design gate
test("TST-630006 supplied fact changes apply without model-name special cases or stale output", async (t) => {
  const { planned } = await fixture(t);
  const changed = { ...planned, phases: planned.phases.map((phase) => phase.name === "Design" ? { ...phase, name: "Outline" } : phase),
    transitions: [
      { from: "Survey", to: "Outline", kind: "sequence" }, { from: "Outline", to: "Build", kind: "sequence" },
      { from: "Outline", to: "Inspect", kind: "alternative" }, { from: "Build", to: "Inspect", kind: "sequence" },
      { from: "Inspect", to: "Outline", kind: "back" }],
    pairs: [{ phase: "Build", checkedBy: "Inspect" }],
    gates: [{ from: "Outline", to: "Build", artifacts: "requirements and ARC", condition: "Outline approved", decider: "Checker" },
      { from: "Build", to: "Inspect", artifacts: "MOD and TST", condition: "Checks pass", decider: "check: revised-tests" }],
  };
  const expected = [{ phase: "Survey" }, { phase: "Outline" }, { phase: "Build" }, { phase: "Inspect" },
    { from: "Outline", to: "Build", kind: "sequence" }, { from: "Inspect", to: "Outline", kind: "back" },
    { phase: "Build", checkedBy: "Inspect" },
    { from: "Outline", to: "Build", artifacts: "requirements and ARC", condition: "Outline approved", decider: "Checker" },
    { from: "Build", to: "Inspect", artifacts: "MOD and TST", condition: "Checks pass", decider: "check: revised-tests" }];
  const diagram = models.modelDiagram?.(changed);
  assert.deepEqual(observed(diagram, expected), expected);
  assert.deepEqual(observed(diagram, [{ phase: "Design" }]), []);
  const originalGate = [{ from: "Design", to: "Build", artifacts: "ARC", condition: "Design accepted", decider: "Steward" }];
  assert.deepEqual(observed(diagram, originalGate), []);
  assert.deepEqual(observed(models.modelDiagram?.(planned), originalGate), originalGate);
});
