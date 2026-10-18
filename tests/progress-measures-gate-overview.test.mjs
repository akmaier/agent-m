// The workflow's gates, passed, pending and not reached — MOD-progress-measures' gateOverview, as the accepted text of
// docs/architecture/MOD-progress-measures.md states it: "the workflow's gates in their order: passed with who decided, when and on which
// text, and the record; pending with what it still needs; not reached; a gate whose record names a text that has changed since, as passed on
// an earlier text, with the difference; each gate a process requirement adds, with its requirement and source". It reads facts.workflow,
// facts.gateStates and facts.gates; the states are those MOD-product-process' gateStates gives over the records, called here as productFacts
// calls it. Of the module, this is gateOverview alone.
// Run: node --test tests/progress-measures-gate-overview.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-035; THE GATE IS RECORDED; STATUS IS DERIVED FROM THE RECORDS
// Level: unit
//
// The workflow is held in memory in the form of MOD-product-process' Workflow; the records are read with its gateSchema. Nothing is read from
// the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { readDocument } from "../src/documents/index.mjs";
import { gateSchema, gateStates } from "../src/product-process/index.mjs";
import { gateOverview } from "../src/progress-measures/index.mjs";
import { facts } from "./progress-measures-facts.mjs";

const BLOB_A = "a".repeat(40), BLOB_B = "b".repeat(40), COMMIT = "c".repeat(40);
const ARTIFACT = "docs/increment.md", OTHER = "docs/sprint.md", ADDED = "A GENERATED ARTIFACT IS A PROPOSAL";

const gate = (from, to, over = {}) => ({ name: `${from} → ${to}`, from, to, artifacts: "", condition: "", decider: "Product Owner", addedBy: null, practice: null, ...over });
const WORKFLOW = {
  model: null, practices: [], phases: ["Plan", "Build", "Test", "Review", "Ship", "Release", "Docs"].map((name) => ({ name, roles: [], produces: [] })),
  transitions: [["Plan", "Build"], ["Plan", "Test"], ["Plan", "Review"], ["Plan", "Ship"], ["Test", "Release"], ["Build", "Docs"]]
    .map(([from, to]) => ({ from, to, kind: "forward" })),
  pairs: [], roles: [], branches: {}, done: [],
  gates: [gate("Plan", "Build"), gate("Plan", "Test"), gate("Plan", "Review"), gate("Plan", "Ship"), gate("Test", "Release"),
    gate("Build", "Docs", { name: ADDED, addedBy: { requirement: ADDED, source: "PO A. Maier" } })],
};

// A gate record read with gateSchema, as docs/gates holds it; `at` makes its date and path.
function record(gateName, { decider = "po-opus", decision = "passed", on = [`${ARTIFACT}@${BLOB_A}`, COMMIT], at = "10:00", reason = null } = {}) {
  const path = `docs/gates/20261012-${at.replace(":", "")}-${gateName.toLowerCase().replace(/[^a-z]+/g, "-")}-ab12.md`;
  const text = ["---", `gate: ${gateName}`, "job:", `decider: ${decider}`, "role: Product Owner", `decision: ${decision}`, "on:", ...on.map((entry) => `  - ${entry}`),
    `date: 2026-10-12 ${at} UTC`, "---", `# ${gateName}`, "", "**REGISTER**", "", ...(reason ? ["## Reason", "", reason, ""] : [])].join("\n");
  return readDocument(gateSchema, path, text);
}

/** The Facts of the fixture product: its workflow, its records, and the states gateStates gives over them and the blobs now. */
const factsOf = (records, texts, workflow = WORKFLOW) => facts({ workflow, gates: records, gateStates: gateStates(workflow, records, texts) });

const passed = record("Plan → Build", { at: "10:00" });
const earlier = record("Plan → Test", { at: "11:00", on: [`${OTHER}@${BLOB_A}`] });
const rejected = record("Plan → Review", { at: "12:00", decision: "rejected", reason: "A test is missing." });

// TST-797001 · level: unit · module: MOD-progress-measures
// guards: UC-035; THE GATE IS RECORDED; STATUS IS DERIVED FROM THE RECORDS
// given: a workflow of six gates in this order: Plan → Build passed by po-opus on 2026-10-12 10:00 UTC on docs/increment.md@aaa… and a commit, still at that blob; Plan → Test passed on docs/sprint.md@aaa…, now at bbb…; Plan → Review rejected by a record; Plan → Ship with no record; Test → Release, whose phase Test is not entered; and a gate that the requirement A GENERATED ARTIFACT IS A PROPOSAL (source PO A. Maier) adds from Build, with no record
// input: gateOverview(facts) with the states gateStates gives over those records
// expect: six entries in the workflow's order; passed has decided { by po-opus, date, on "docs/increment.md@aaa…, ccc…", record: the record's path }, no needs, no difference; passed on an earlier text has the difference "docs/sprint.md: checked aaaaaaaaaaaa, now bbbbbbbbbbbb", needs a decision on the current text, and its record; rejected has its record, no needs; pending has decided null and needs "a decision by Product Owner"; not reached has decided null and needs the phase Test to be entered; only the added gate has addedBy { requirement, source "PO A. Maier" }
test("gateOverview — each gate in the workflow's order in each state, with who decided, when, on which text and the record", () => {
  const overview = gateOverview(factsOf([passed, earlier, rejected], { [ARTIFACT]: BLOB_A, [OTHER]: BLOB_B }));
  const decided = (record, by, date, on) => ({ by, date, on, record: record.path });
  assert.deepEqual(overview, [
    { gate: "Plan → Build", state: "passed", decided: decided(passed, "po-opus", "2026-10-12 10:00 UTC", `${ARTIFACT}@${BLOB_A}, ${COMMIT}`), needs: null, difference: null, addedBy: null },
    { gate: "Plan → Test", state: "passed on an earlier text", decided: decided(earlier, "po-opus", "2026-10-12 11:00 UTC", `${OTHER}@${BLOB_A}`),
      needs: "a decision on the current text", difference: `${OTHER}: checked aaaaaaaaaaaa, now bbbbbbbbbbbb`, addedBy: null },
    { gate: "Plan → Review", state: "rejected", decided: decided(rejected, "po-opus", "2026-10-12 12:00 UTC", `${ARTIFACT}@${BLOB_A}, ${COMMIT}`), needs: null, difference: null, addedBy: null },
    { gate: "Plan → Ship", state: "pending", decided: null, needs: "a decision by Product Owner", difference: null, addedBy: null },
    { gate: "Test → Release", state: "not reached", decided: null, needs: "the phase Test to be entered", difference: null, addedBy: null },
    { gate: ADDED, state: "pending", decided: null, needs: "a decision by Product Owner", difference: null, addedBy: { requirement: ADDED, source: "PO A. Maier" } },
  ]);
});

// TST-797002 · level: unit · module: MOD-progress-measures
// guards: UC-035; STATUS IS DERIVED FROM THE RECORDS
// given: the record of Plan → Build, which checked docs/increment.md at aaa…; (a) the file is still at aaa…; (b) the file is now at bbb…
// input: gateOverview of each
// expect: (a) passed, no difference; (b) passed on an earlier text with the difference "docs/increment.md: checked aaaaaaaaaaaa, now bbbbbbbbbbbb", and no pass counted: the gate Plan → Build is not "passed", so the phase Build is not entered and the added gate from Build is not reached
test("gateOverview — a record on a changed text gives passed on an earlier text, which is not passed", () => {
  const first = (texts) => gateOverview(factsOf([passed], texts));
  assert.equal(first({ [ARTIFACT]: BLOB_A })[0].state, "passed", "known positive: the text is the one checked");
  const changed = first({ [ARTIFACT]: BLOB_B });
  assert.equal(changed[0].state, "passed on an earlier text");
  assert.equal(changed[0].difference, `${ARTIFACT}: checked aaaaaaaaaaaa, now bbbbbbbbbbbb`);
  assert.equal(changed.find((entry) => entry.gate === ADDED).state, "not reached");
});

// TST-797003 · level: unit · module: MOD-progress-measures
// guards: UC-035; STATUS IS DERIVED FROM THE RECORDS
// given: facts whose workflow is "unknown", or null (no declared process), whose gateStates are []
// input: gateOverview of each
// expect: an empty list: there is no gate to state, and none is guessed
test("gateOverview — a workflow that is unknown or absent has no gate to state", () => {
  assert.deepEqual(gateOverview(facts({ workflow: "unknown" })), []);
  assert.deepEqual(gateOverview(facts({ workflow: null })), []);
});
