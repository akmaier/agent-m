// ITM-609: the accepted pure requirement/phase grid, reached through MOD-model-catalogue's public interface.
// Module: MOD-model-catalogue
// Guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031; UC-035
// Level: unit
// Run: node --test tests/model-catalogue-plan-grid.test.mjs

import test from "node:test";
import assert from "node:assert/strict";
import * as models from "../src/model-catalogue/index.mjs";

const PLANNED_PATH = "docs/process-models/specimen-flow.md";
const PULLED_PATH = "docs/process-models/specimen-pull.md";
const VERSION = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const REQUIREMENTS = ["THE DISPLAY SHOWS STATUS", "A SESSION CAN END"];

const PLANNED = [
  "---", "name: specimen-flow", "kind: planned", "measure: plan entries per phase", "---",
  "# Specimen flow", "", "## Phases", "",
  "| Name | Role | Produces |", "|---|---|---|",
  "| Explore | Team | requirements |", "| Specify | Team | ARC |", "| Assemble | Team | MOD |",
  "| Inspect | Team | TST |", "| Operate | Team | ITM |", "",
  "## Transitions", "", "| From | To | Kind |", "|---|---|---|",
  "| Explore | Specify | sequence |", "| Specify | Assemble | sequence |", "| Assemble | Inspect | sequence |",
  "| Inspect | Assemble | back |", "| Inspect | Operate | sequence |", "",
  "## Verification pairs", "", "| Phase | Checked by |", "|---|---|",
  "| Explore | Operate |", "| Assemble | Inspect |", "",
  "## Gates", "", "| Between | Artifacts | Condition | Decider |", "|---|---|---|---|",
  "| Specify \u2192 Assemble | ARC | The design is accepted | Team |", "",
  "## Roles", "", "| Name | Filled by | How many | Capabilities |", "|---|---|---|---|",
  "| Team | either | several | read the repository, write to the repository, run code and tests |", "",
].join("\n");
const PULLED = PLANNED.replace("specimen-flow", "specimen-pull").replace("kind: planned", "kind: pulled")
  .replace("measure: plan entries per phase", "measure: items per state over time")
  + ["", "## Flow control", "", "| Kind | Value |", "|---|---|", "| WIP limit | 3 |",
    "| Time box | none |", "| Sprints | no |", ""].join("\n");

// The same Snapshot pattern as the existing catalogue tests; all instance reads are constructed texts in memory.
async function fixture() {
  const files = new Map([[PLANNED_PATH, PLANNED], [PULLED_PATH, PULLED]]);
  const catalogue = await models.catalogue({
    repository: { server: "github", origin: "https://github.com", path: "fixture/instance", web: "https://github.com/fixture/instance" },
    ref: "main", commit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", paths: [...files.keys()],
    read: async (path) => files.get(path) ?? null,
    blob: (path) => files.has(path) ? VERSION : null,
  });
  assert.deepEqual(catalogue.findings[PLANNED_PATH], [], "positive control: the planned model is valid");
  assert.deepEqual(catalogue.findings[PULLED_PATH], [], "positive control: the pulled model is valid");
  return { planned: catalogue.models.find((model) => model.path === PLANNED_PATH),
    pulled: catalogue.models.find((model) => model.path === PULLED_PATH) };
}

// The contract gives no entry ordering. Sort only, keeping every entry and every public field for exact comparison.
function canonical(grid) {
  if (grid === undefined) return grid;
  return { ...grid, entries: [...grid.entries].sort((a, b) =>
    a.requirement.localeCompare(b.requirement) || a.phase.localeCompare(b.phase)) };
}

// TST-609001
// level: unit
// module: MOD-model-catalogue
// guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031; UC-035
// given: the in-memory instance holds specimen-flow and specimen-pull, complete definitions with five named phases
// input: the existing public catalogue and validation, before any call to planGrid
// expect: both definitions have no findings; planned/pulled kinds, the literal five phase names and the supplied version below
test("TST-609001 public catalogue and validation give known-positive planned and pulled inputs", async () => {
  const { planned, pulled } = await fixture();
  assert.equal(planned.kind, "planned");
  assert.equal(pulled.kind, "pulled");
  assert.deepEqual(planned.phases.map((phase) => phase.name), ["Explore", "Specify", "Assemble", "Inspect", "Operate"]);
  assert.deepEqual(pulled.phases.map((phase) => phase.name), ["Explore", "Specify", "Assemble", "Inspect", "Operate"]);
  assert.equal(planned.version, "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
});

// TST-609002
// level: unit
// module: MOD-model-catalogue
// guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031; UC-035
// given: two supplied accepted requirement names and the valid planned model with five phases, including a back transition
// input: public planGrid(REQUIREMENTS, planned)
// expect: exactly the ten literal pairs below, each once, and "2 requirements x 5 phases = 10 plan entries" with multiplication sign U+00D7
test("TST-609002 every accepted requirement appears once in every supplied phase with the exact count", async () => {
  const { planned } = await fixture();
  assert.deepEqual(canonical(models.planGrid?.(REQUIREMENTS, planned)), {
    entries: [
      { requirement: "A SESSION CAN END", phase: "Assemble" },
      { requirement: "A SESSION CAN END", phase: "Explore" },
      { requirement: "A SESSION CAN END", phase: "Inspect" },
      { requirement: "A SESSION CAN END", phase: "Operate" },
      { requirement: "A SESSION CAN END", phase: "Specify" },
      { requirement: "THE DISPLAY SHOWS STATUS", phase: "Assemble" },
      { requirement: "THE DISPLAY SHOWS STATUS", phase: "Explore" },
      { requirement: "THE DISPLAY SHOWS STATUS", phase: "Inspect" },
      { requirement: "THE DISPLAY SHOWS STATUS", phase: "Operate" },
      { requirement: "THE DISPLAY SHOWS STATUS", phase: "Specify" },
    ], count: "2 requirements \u00d7 5 phases = 10 plan entries",
  });
});

// TST-609003
// level: unit
// module: MOD-model-catalogue
// guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031; UC-035
// given: the same planned model; RECORDS STAY READABLE joins the two accepted requirements
// input: public planGrid with those three literal requirements
// expect: exactly the fifteen literal pairs below, including five for the added requirement, and the multiplication-sign count
test("TST-609003 accepting one more requirement adds its five phase entries and updates the count", async () => {
  const { planned } = await fixture();
  assert.deepEqual(canonical(models.planGrid?.(["THE DISPLAY SHOWS STATUS", "A SESSION CAN END", "RECORDS STAY READABLE"], planned)), {
    entries: [
      { requirement: "A SESSION CAN END", phase: "Assemble" },
      { requirement: "A SESSION CAN END", phase: "Explore" },
      { requirement: "A SESSION CAN END", phase: "Inspect" },
      { requirement: "A SESSION CAN END", phase: "Operate" },
      { requirement: "A SESSION CAN END", phase: "Specify" },
      { requirement: "RECORDS STAY READABLE", phase: "Assemble" },
      { requirement: "RECORDS STAY READABLE", phase: "Explore" },
      { requirement: "RECORDS STAY READABLE", phase: "Inspect" },
      { requirement: "RECORDS STAY READABLE", phase: "Operate" },
      { requirement: "RECORDS STAY READABLE", phase: "Specify" },
      { requirement: "THE DISPLAY SHOWS STATUS", phase: "Assemble" },
      { requirement: "THE DISPLAY SHOWS STATUS", phase: "Explore" },
      { requirement: "THE DISPLAY SHOWS STATUS", phase: "Inspect" },
      { requirement: "THE DISPLAY SHOWS STATUS", phase: "Operate" },
      { requirement: "THE DISPLAY SHOWS STATUS", phase: "Specify" },
    ], count: "3 requirements \u00d7 5 phases = 15 plan entries",
  });
});

// TST-609004
// level: unit
// module: MOD-model-catalogue
// guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031; UC-035
// given: the valid five-phase planned model, with no accepted requirement yet
// input: public planGrid([], planned)
// expect: exactly { entries: [], count: "0 requirements x 5 phases = 0 plan entries" }, with multiplication sign U+00D7
test("TST-609004 no accepted requirements gives no entries and the literal zero count", async () => {
  const { planned } = await fixture();
  assert.deepEqual(models.planGrid?.([], planned), { entries: [], count: "0 requirements \u00d7 5 phases = 0 plan entries" });
});

// TST-609005
// level: unit
// module: MOD-model-catalogue
// guards: A PLAN COVERS THE WHOLE SPECIFICATION; UC-031; UC-035
// given: the valid pulled model and the two literal accepted requirements; the public planned input control already succeeds
// input: public planGrid(REQUIREMENTS, pulled)
// expect: an error named NotPlanned; no additional message, error subclass or input-validation contract is asserted
test("TST-609005 a pulled model reports the accepted NotPlanned error", async () => {
  const { pulled } = await fixture();
  assert.throws(() => models.planGrid?.(REQUIREMENTS, pulled), { name: "NotPlanned" });
});
