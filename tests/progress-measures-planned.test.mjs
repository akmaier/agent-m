// The progress of a planned model — MOD-progress-measures' progressIn, `planned`, as the accepted text of
// docs/architecture/MOD-progress-measures.md states it: "For a planned model, the grid of every accepted requirement in every phase,
// each cell done when what the phase produces for the requirement is accepted — or, for implementation and tests, merged and passing —,
// in progress while it is open or a job works on it, and open otherwise; the phases on a timeline with their gates as milestones; beside
// it the steps of the implementation plan with their states; with no accepted requirement, the phases empty" (UC-035 step 2 and 2a).
// Run: node --test tests/progress-measures-planned.test.mjs
//
// Module: MOD-progress-measures
// Guards: UC-035; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE; A PLAN COVERS THE WHOLE SPECIFICATION; A PLANNED MODEL IMPLEMENTS ITS IMPLEMENTATION PLAN
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The facts are held in memory, in the form of
// MOD-progress-measures' Facts (tests/progress-measures-facts.mjs). The product has two accepted requirements and a model of five phases,
// Requirements, Design, Implementation, Testing and Operation, with a gate leaving Requirements, Design and Testing. Its implementation plan
// holds three steps — ITM-0001 and ITM-0002 realise THE FIRST RULE, ITM-0003 THE SECOND RULE — in the phases the plan's order gives them; the
// first step names MOD-store, which follows ARC-001, the third MOD-queue, which follows ARC-002. `fetch` is replaced by a spy for every test
// and must not have been called when the test ends. The counter-proofs are recorded in the pull request.

import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { progressIn } from "../src/progress-measures/index.mjs";
import { facts, itemState, statusMap } from "./progress-measures-facts.mjs";

let fetched = [];
const realFetch = globalThis.fetch;
beforeEach(() => {
  fetched = [];
  globalThis.fetch = async (input) => { fetched.push(String(input?.url ?? input)); throw new Error("a test reached the network"); };
});
afterEach(() => {
  globalThis.fetch = realFetch;
  assert.deepEqual(fetched, [], "no request reaches the network");
});

const NOW = new Date("2026-10-22T12:00:00Z");
const FIRST = "THE FIRST RULE", SECOND = "THE SECOND RULE", THIRD = "THE THIRD RULE";
const PHASES = ["Requirements", "Design", "Implementation", "Testing", "Operation"];
const gate = (from, to) => ({ from, to, artifacts: "the artifacts", condition: "the condition", decider: "Reviewer" });
const MODEL = {
  name: "specimen-v", kind: "planned", measure: "plan entries per phase", flow: null,
  phases: [["Requirements", ["requirements"]], ["Design", ["ARC", "MOD"]], ["Implementation", ["MOD"]], ["Testing", ["TST"]], ["Operation", []]]
    .map(([name, produces]) => ({ name, roles: [], produces })),
  gates: [gate("Requirements", "Design"), gate("Design", "Implementation"), gate("Testing", "Operation")],
};
const step = (id, realises, modules) => ({ id, path: `docs/plan/${id}.md`, fields: { id, realises, modules } });
const moduleFile = (id, follows) => ({ id, path: `docs/architecture/${id}.md`, fields: { id, follows } });
const rows = (...pairs) => ({ path: "docs/plan/order.md", sections: [{ heading: "## Order", rows: pairs.map(([Step, Phase]) => ({ cells: { Step, Phase } })) }] });
const gateRecord = (name, path, date) => ({ path, fields: { gate: name, decision: "passed", date } });
const STATES = [itemState("ITM-0001", "done", { pullRequest: "11" }), itemState("ITM-0002", "in progress", { job: "JOB-1", reason: "job JOB-1 is running" }),
  itemState("ITM-0003", "ready")];
const accepted = (over = {}) => [["docs/architecture/MOD-store.md", "MOD-store", "module", "accepted"], ["docs/architecture/ARC-001-store.md", "ARC-001", "architecture-decision", "accepted"],
  ["docs/architecture/MOD-queue.md", "MOD-queue", "module", over.queue ?? "open"], ["docs/architecture/ARC-002-queue.md", "ARC-002", "architecture-decision", "accepted"]];
const FACTS = (over = {}) => facts({
  model: MODEL, modelSince: "2026-10-01", requirements: [FIRST, SECOND],
  statuses: statusMap(accepted()),
  modules: [moduleFile("MOD-store", ["ARC-001"]), moduleFile("MOD-queue", ["ARC-002"])],
  plan: {
    order: rows(["ITM-0001", "Implementation"], ["ITM-0002", "Testing"], ["ITM-0003", "Implementation"]),
    items: [step("ITM-0001", [FIRST], ["MOD-store"]), step("ITM-0002", [FIRST], ["MOD-store"]), step("ITM-0003", [SECOND], ["MOD-queue"])],
    states: STATES,
  },
  gates: [gateRecord("Requirements → Design", "docs/gates/20261005-0900-requirements-design.md", "2026-10-05 09:00 UTC"),
    gateRecord("Design → Implementation", "docs/gates/20261010-1430-design-implementation.md", "2026-10-10 14:30 UTC")],
  gateStates: [
    { gate: "Requirements → Design", state: "passed", record: "docs/gates/20261005-0900-requirements-design.md", needs: null, difference: null },
    { gate: "Design → Implementation", state: "passed", record: "docs/gates/20261010-1430-design-implementation.md", needs: null, difference: null },
    { gate: "Testing → Operation", state: "pending", record: null, needs: "a decision by Reviewer", difference: null }],
  ...over,
});
const cell = (planned, requirement, phase) => planned.grid.entries.find((entry) => entry.requirement === requirement && entry.phase === phase)?.state;
const states = (planned, requirement) => PHASES.map((phase) => cell(planned, requirement, phase));
const run = (state) => ({ id: "1", workflow: "tests", commit: "c".repeat(40), event: "push", state, url: "https://example.org/runs/1", started: null, ended: null });
const ci = (...runs) => ({ runs, configured: true, drift: [], jobWorkflow: true });

// TST-795001 · level: unit · module: MOD-progress-measures
// guards: UC-035; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE; A PLAN COVERS THE WHOLE SPECIFICATION
// given: the product above, on 2026-10-22: both requirements accepted; MOD-store and ARC-001 accepted, MOD-queue open, ARC-002 accepted; the plan's order puts ITM-0001 and ITM-0003 in Implementation and ITM-0002 in Testing; ITM-0001 is done, ITM-0002 is in progress under a job, ITM-0003 is ready; the gates Requirements → Design and Design → Implementation are passed, Testing → Operation is pending; the CI runs are unknown
// input: progressIn(facts, now)
// expect: the model's measure; the grid holds 2 requirements × 5 phases = 10 entries, the count saying so; for THE FIRST RULE Requirements done (it is accepted), Design done (MOD-store and ARC-001 accepted), Implementation done (ITM-0001 merged), Testing in progress (ITM-0002 under a job), Operation open (it produces nothing); for THE SECOND RULE Requirements done, Design in progress (MOD-queue is open), Implementation open (ITM-0003 is ready), Testing open (the one step of Testing realises THE FIRST RULE), Operation open; no sprints and no flow
test("progressIn — the grid of a planned model gives every requirement in every phase done, in progress or open", () => {
  const { measure, planned, sprints, flow } = progressIn(FACTS(), NOW);
  assert.equal(measure, "plan entries per phase");
  assert.equal(planned.grid.entries.length, 10);
  assert.equal(planned.grid.count, "2 requirements × 5 phases = 10 plan entries");
  assert.deepEqual(states(planned, FIRST), ["done", "done", "done", "in progress", "open"]);
  assert.deepEqual(states(planned, SECOND), ["done", "in progress", "open", "open", "open"]);
  assert.deepEqual([sprints, flow], [[], null]);
});

// TST-795002 · level: unit · module: MOD-progress-measures
// guards: UC-035; STATUS IS DERIVED FROM THE RECORDS
// given: the product above, whose model was declared on 2026-10-01; the record of Requirements → Design dated 2026-10-05 09:00 UTC and that of Design → Implementation dated 2026-10-10 14:30 UTC; Testing → Operation pending; as a second case, Design → Implementation passed on an earlier text; as a third, Testing → Operation passed on 2026-10-20
// input: progressIn(facts, now).planned.timeline; the same with the second and the third state
// expect: five entries in the model's order — Requirements from 2026-10-01 to 2026-10-05 with its gate passed 2026-10-05; Design from 2026-10-05 to 2026-10-10 with its gate passed 2026-10-10; Implementation from 2026-10-10 to nothing yet, no gate of its own; Testing from nothing yet, with its gate Testing → Operation not passed; Operation with neither date. With the gate passed on an earlier text, it counts as not passed: Design has no end and no passed date, Implementation no start. With Testing → Operation passed, Implementation, which has no gate of its own, ends with it on 2026-10-20, and Testing and Operation start that day
test("progressIn — the timeline gives each phase its dates and its gate as a milestone, passed only on the current text", () => {
  const timeline = progressIn(FACTS(), NOW).planned.timeline;
  assert.deepEqual(timeline, [
    { phase: "Requirements", from: "2026-10-01", to: "2026-10-05", gate: "Requirements → Design", passed: "2026-10-05" },
    { phase: "Design", from: "2026-10-05", to: "2026-10-10", gate: "Design → Implementation", passed: "2026-10-10" },
    { phase: "Implementation", from: "2026-10-10", to: null, gate: null, passed: null },
    { phase: "Testing", from: null, to: null, gate: "Testing → Operation", passed: null },
    { phase: "Operation", from: null, to: null, gate: null, passed: null },
  ]);
  const earlier = FACTS().gateStates.map((entry) => (entry.gate === "Design → Implementation"
    ? { ...entry, state: "passed on an earlier text", difference: "SPEC.md: checked abc, now def" } : entry));
  assert.deepEqual(progressIn(FACTS({ gateStates: earlier }), NOW).planned.timeline.slice(1, 3), [
    { phase: "Design", from: "2026-10-05", to: null, gate: "Design → Implementation", passed: null },
    { phase: "Implementation", from: null, to: null, gate: null, passed: null },
  ]);
  const all = FACTS();
  const released = progressIn(FACTS({
    gates: [...all.gates, gateRecord("Testing → Operation", "docs/gates/20261020-1000-testing-operation.md", "2026-10-20 10:00 UTC")],
    gateStates: all.gateStates.map((entry) => (entry.gate === "Testing → Operation"
      ? { ...entry, state: "passed", record: "docs/gates/20261020-1000-testing-operation.md", needs: null } : entry)),
  }), NOW).planned.timeline;
  assert.deepEqual(released.slice(2), [
    { phase: "Implementation", from: "2026-10-10", to: "2026-10-20", gate: null, passed: null },
    { phase: "Testing", from: "2026-10-20", to: "2026-10-20", gate: "Testing → Operation", passed: "2026-10-20" },
    { phase: "Operation", from: "2026-10-20", to: null, gate: null, passed: null },
  ]);
});

// TST-795003 · level: unit · module: MOD-progress-measures
// guards: UC-035; A PLANNED MODEL IMPLEMENTS ITS IMPLEMENTATION PLAN
// given: the product above, whose plan states are ITM-0001 done, ITM-0002 in progress under JOB-1 and ITM-0003 ready
// input: progressIn(facts, now).planned.steps
// expect: the three states of the plan, in the plan's order, each as MOD-work-plans' ItemState gives it
test("progressIn — beside the grid, the steps of the implementation plan with their states", () => {
  assert.deepEqual(progressIn(FACTS(), NOW).planned.steps, STATES);
});

// TST-795004 · level: unit · module: MOD-progress-measures
// guards: UC-035; A PLAN COVERS THE WHOLE SPECIFICATION
// given: the product above with no accepted requirement; and, as a second case, one whose requirements are unknown
// input: progressIn(facts, now).planned
// expect: no entry in the grid and the count "0 requirements × 5 phases = 0 plan entries", the phases still on the timeline and the steps still listed; for unknown requirements no entry and a count that says the requirements are unknown, never a guess
test("progressIn — without an accepted requirement the grid is empty, and the phases stay on the timeline", () => {
  const none = progressIn(FACTS({ requirements: [] }), NOW).planned;
  assert.deepEqual(none.grid, { entries: [], count: "0 requirements × 5 phases = 0 plan entries" });
  assert.deepEqual(none.timeline.map((row) => row.phase), PHASES);
  assert.deepEqual(none.steps, STATES);
  assert.deepEqual(progressIn(FACTS({ requirements: "unknown" }), NOW).planned.grid, { entries: [], count: "the requirements are unknown" });
});

// TST-795005 · level: unit · module: MOD-progress-measures
// guards: A PLAN COVERS THE WHOLE SPECIFICATION
// given: the product above, and the same with a third requirement accepted, which no step realises
// input: progressIn(facts, now).planned.grid, with two and with three requirements
// expect: 10 entries and then 15 — one more requirement adds the 5 phases of the model; the new requirement is done in Requirements and open in the other four, a step-less requirement having neither a module nor a step to be further on
test("progressIn — accepting one more requirement adds one entry per phase", () => {
  const two = progressIn(FACTS(), NOW).planned.grid;
  const three = progressIn(FACTS({ requirements: [FIRST, SECOND, THIRD] }), NOW).planned;
  assert.equal(two.entries.length, 10);
  assert.equal(three.grid.entries.length, 15);
  assert.equal(three.grid.count, "3 requirements × 5 phases = 15 plan entries");
  assert.deepEqual(states(three, THIRD), ["done", "open", "open", "open", "open"]);
  assert.deepEqual(states(three, FIRST), ["done", "done", "done", "in progress", "open"]);
});

// TST-795006 · level: unit · module: MOD-progress-measures
// guards: UC-035
// given: the product above; THE FIRST RULE's Implementation cell rests on ITM-0001, merged; the CI runs of the default branch's head are, in turn, unknown, one that succeeded, one that succeeded beside one that failed
// input: progressIn(facts, now) for each
// expect: the cell is done with unknown runs — only a known failure holds a merged step back — and with a run that succeeded; it is in progress while a run of the head failed. A cell of an accepted file is not held back by the runs: THE FIRST RULE's Design stays done
test("progressIn — a merged step counts as done while the head's CI is not failing", () => {
  const implementation = (over) => cell(progressIn(FACTS(over), NOW).planned, FIRST, "Implementation");
  assert.equal(implementation({ ci: "unknown" }), "done");
  assert.equal(implementation({ ci: ci(run("success")) }), "done");
  assert.equal(implementation({ ci: ci(run("success"), run("failure")) }), "in progress");
  assert.equal(cell(progressIn(FACTS({ ci: ci(run("failure")) }), NOW).planned, FIRST, "Design"), "done");
});

// TST-795007 · level: unit · module: MOD-progress-measures
// guards: UC-035
// given: the product above, whose MOD-queue is open and ARC-002 accepted; the same with MOD-queue accepted; the same with MOD-queue accepted and ARC-002 on no record; the same with neither on any record; the same with ITM-0003 removed from the plan
// input: THE SECOND RULE's Design cell
// expect: in progress while a file it rests on is open; done once all are accepted; in progress while one is accepted and another is on no record; open while none is on a record, and while no step of the plan names a module
test("progressIn — a phase that produces files is done when they are all accepted, in progress while some are, and open without any", () => {
  const design = (over) => cell(progressIn(FACTS(over), NOW).planned, SECOND, "Design");
  assert.equal(design({}), "in progress");
  assert.equal(design({ statuses: statusMap(accepted({ queue: "accepted" })) }), "done");
  assert.equal(design({ statuses: statusMap(accepted({ queue: "accepted" }).filter(([, id]) => id !== "ARC-002")) }), "in progress");
  assert.equal(design({ statuses: statusMap(accepted().filter(([, id]) => id !== "MOD-queue" && id !== "ARC-002")) }), "open");
  const without = FACTS().plan.items.filter(({ id }) => id !== "ITM-0003");
  assert.equal(design({ plan: { order: FACTS().plan.order, items: without, states: STATES } }), "open");
});

// TST-795009 · level: unit · module: MOD-progress-measures
// guards: UC-035
// given: the product above with a third requirement whose one step, ITM-0004, is in Testing and names MOD-store, which is accepted with ARC-001; the plan puts steps of other requirements in Implementation
// input: the third requirement's cells
// expect: Design done, the files of its trace being accepted; Implementation open, not done — a phase that has steps is built by them, and an accepted module file is no merged code —; Testing open, ITM-0004 being ready
test("progressIn — an accepted module file does not make a phase with steps done", () => {
  const plan = { order: rows(["ITM-0001", "Implementation"], ["ITM-0002", "Testing"], ["ITM-0003", "Implementation"], ["ITM-0004", "Testing"]),
    items: [...FACTS().plan.items, step("ITM-0004", [THIRD], ["MOD-store"])], states: [...STATES, itemState("ITM-0004", "ready")] };
  assert.deepEqual(states(progressIn(FACTS({ requirements: [FIRST, SECOND, THIRD], plan }), NOW).planned, THIRD),
    ["done", "done", "open", "open", "open"]);
});

// TST-795008 · level: unit · module: MOD-progress-measures
// guards: UC-035; PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE
// given: a model that is not planned, with time boxes; a model that is unknown; the planned model with no step in the facts' plan
// input: progressIn(facts, now).planned
// expect: null for the model with time boxes and for the unknown model — it has no grid; for the planned model without steps an empty list of steps, and every requirement open in the phases but Requirements
test("progressIn — only a planned model has a grid, and a plan without steps leaves every built phase open", () => {
  const pulled = { name: "scrum", kind: "pulled", measure: "remaining items per time box", flow: { wip: null, timeBox: "1 week", sprints: true } };
  assert.equal(progressIn(FACTS({ model: pulled }), NOW).planned, null);
  assert.equal(progressIn(FACTS({ model: "unknown" }), NOW).planned, null);
  const bare = progressIn(FACTS({ plan: { order: null, items: [], states: [] } }), NOW).planned;
  assert.deepEqual(bare.steps, []);
  assert.deepEqual(states(bare, FIRST), ["done", "open", "open", "open", "open"]);
});
