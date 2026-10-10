// The derived state of each backlog item and the reasons work cannot start (ITM-295) — MOD-work-plans' public
// itemStates and startable interfaces from docs/architecture/MOD-work-plans.md, for UC-002 and UC-032.
// Run: node --test tests/work-plans-states.test.mjs
//
// Module: MOD-work-plans
// Level: unit
//
// The fixtures are supplied Documents, JobRows, PullRequests, Workflow, declaration and Participants in the public
// shapes their producing modules define. They establish a ready/startable positive before each derived refusal. No
// fixture reads a repository or persists a state.

import test from "node:test";
import assert from "node:assert/strict";
import { itemStates, startable } from "../src/work-plans/index.mjs";

const workflow = {
  phases: [
    { name: "Planning", role: "Product Owner", produces: ["ITM"] },
    { name: "Development", role: "Developers", produces: ["MOD", "TST"] },
  ],
  gates: [{ name: "Planning → Development", from: "Planning", to: "Development", artifacts: "plan",
    condition: "the plan is accepted", decider: "Product Owner" }],
  roles: [
    { name: "Product Owner", holders: ["po"], capabilities: ["read the repository"] },
    { name: "Developers", holders: ["dev"], capabilities: ["read the repository", "write to the repository", "run code and tests"] },
  ],
};

const declaration = { path: "docs/process.md", fields: {}, sections: [{ heading: "## Roles", rows: [
  { cells: { Role: "Product Owner", Participants: ["po"] } },
  { cells: { Role: "Developers", Participants: ["dev"] } },
] }] };

const participants = [{ name: "dev", type: "CLI agent", model: "fixture", context: 1000,
  capabilities: ["read the repository", "write to the repository", "run code and tests"], place: "fixture", route: "bridge fixture agent codex" }];

const item = (id, fields = {}) => ({ path: `docs/backlog/${id}.md`, id, fields: {
  realises: ["UC-032"], builds_on: [], phase: "Development", ...fields,
}, sections: [] });
const order = (ids) => ({ path: "docs/backlog/order.md", fields: {}, sections: [{ heading: "## Order", rows:
  ids.map((Item) => ({ cells: { Item } })) }] });
const accepted = (ids) => new Map(ids.map((id) => [id, { id, kind: id.startsWith("UC-") ? "use-case" : "requirement", status: "accepted" }]));
const facts = (more = {}) => ({ statuses: accepted(["UC-032"]), queues: [], jobs: [], pullRequests: [],
  gates: [{ gate: "Planning → Development", state: "passed" }], workflow, ...more });
const stateOf = (states, id) => states.find((state) => state.item === id);
const job = (worksOn, state) => ({ record: { worksOn: [worksOn] }, state });
const pull = (branch, state, number = 1) => ({ number, title: branch, branch, base: "sprint/1", head: "a".repeat(40),
  state, draft: false, url: `https://example.invalid/${number}`, opened: "2026-10-10", merged: state === "merged" ? "2026-10-10" : null, closed: null });

// TST-295001
// level: unit
// module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
// given: ordered backlog Documents with accepted, open and changed realised artifacts, plus an item that still names a withdrawn artifact absent from current statuses
// input: itemStates with their public status Map and the accepted empty Queue list
// expect: the accepted item is ready; each open, changed or absent withdrawn artifact yields waiting for acceptance with that artifact named
test("TST-295001: itemStates derives acceptance and changed-or-withdrawn waits from supplied records", () => {
  const items = [item("ITM-295-a"), item("ITM-295-b", { realises: ["REQ-OPEN"] }), item("ITM-295-c", { realises: ["REQ-CHANGED"] }), item("ITM-295-d", { realises: ["REQ-WITHDRAWN"] })];
  const statuses = accepted(["UC-032"]);
  statuses.set("REQ-OPEN", { id: "REQ-OPEN", kind: "requirement", status: "open" });
  statuses.set("REQ-CHANGED", { id: "REQ-CHANGED", kind: "requirement", status: "changed" });
  const states = itemStates(items, order(items.map((entry) => entry.id)), facts({ statuses, queues: [] }));
  assert.equal(stateOf(states, "ITM-295-a").state, "ready", "known positive: accepted inputs are ready");
  for (const id of ["ITM-295-b", "ITM-295-c", "ITM-295-d"]) {
    assert.equal(stateOf(states, id).state, "waiting for acceptance");
    assert.match(stateOf(states, id).reason, /REQ-(OPEN|CHANGED|WITHDRAWN)/);
  }
});

// TST-295002
// level: unit
// module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS
// given: an accepted item after an unfinished item it builds on, then that prerequisite's merged request
// input: itemStates with supplied PullRequests
// expect: the dependent item waits for its prerequisite until its request is merged, then becomes ready without stored state
test("TST-295002: itemStates derives prerequisite, open-review, failure, person-wait, done, and unknown request states", () => {
  const items = [item("ITM-295-prerequisite"), item("ITM-295-dependent", { builds_on: ["ITM-295-prerequisite"] })];
  const input = order(items.map((entry) => entry.id));
  let states = itemStates(items, input, facts());
  assert.equal(stateOf(states, "ITM-295-prerequisite").state, "ready", "known positive: accepted item without work is ready");
  assert.equal(stateOf(states, "ITM-295-dependent").state, "waiting for an item it builds on");
  assert.match(stateOf(states, "ITM-295-dependent").reason, /ITM-295-prerequisite/);
  states = itemStates(items, input, facts({ pullRequests: [pull("ITM-295-prerequisite", "open")] }));
  assert.equal(stateOf(states, "ITM-295-prerequisite").state, "in progress");
  assert.match(stateOf(states, "ITM-295-prerequisite").reason, /review|open/i);
  states = itemStates(items, input, facts({ jobs: [job("ITM-295-prerequisite", "failed")] }));
  assert.equal(stateOf(states, "ITM-295-prerequisite").state, "blocked");
  states = itemStates(items, input, facts({ jobs: [job("ITM-295-prerequisite", "waiting at a gate")] }));
  assert.equal(stateOf(states, "ITM-295-prerequisite").state, "blocked");
  states = itemStates(items, input, facts({ pullRequests: [pull("ITM-295-prerequisite", "merged")] }));
  assert.equal(stateOf(states, "ITM-295-prerequisite").state, "done");
  assert.equal(stateOf(states, "ITM-295-dependent").state, "ready");
  states = itemStates(items, input, facts({ pullRequests: "unknown" }));
  assert.equal(stateOf(states, "ITM-295-prerequisite").state, "unknown");
});

// TST-295003
// level: unit
// module: MOD-work-plans
// guards: NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT; A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT; A JOB GOES ONLY TO A HOLDER OF ITS ROLE
// given: a ready item, its derived ItemState list, the public workflow/declaration and an active sprint
// input: startable before and after selection, WIP, gate and role-holder facts change
// expect: the ready selected item starts; every refusal names selection, active work including review, gate, or the missing implementing holder and role needs
test("TST-295003: startable returns every supplied selection, WIP, gate, and implementing-role refusal", () => {
  const ready = [{ item: "ITM-295-ready", state: "ready", reason: null, job: null, pullRequest: null }];
  const context = { workflow, declaration, sprint: { fields: { selection: ["ITM-295-ready"] } }, wip: 2, participants };
  assert.deepEqual(startable("ITM-295-ready", ready, context), { startable: true }, "known positive: ready selected work below WIP has an eligible developer");
  const unselected = startable("ITM-295-ready", ready, { ...context, sprint: { fields: { selection: [] } } });
  assert.equal(unselected.startable, false); assert.match(unselected.reasons.join("\n"), /selected|sprint/i);
  const full = startable("ITM-295-ready", [...ready, { item: "ITM-running", state: "in progress", reason: "open pull request waiting for review", job: null, pullRequest: "1" }, { item: "ITM-review", state: "in progress", reason: "waiting for review", job: null, pullRequest: "2" }], context);
  assert.equal(full.startable, false); assert.match(full.reasons.join("\n"), /ITM-running/); assert.match(full.reasons.join("\n"), /ITM-review/);
  const waiting = itemStates([item("ITM-295-ready")], order(["ITM-295-ready"]), facts({
    gates: [{ gate: "Planning → Development", state: "pending" }],
  }));
  assert.equal(waiting[0].state, "waiting", "known gate input produces the ItemState startable consumes");
  const blockedGate = startable("ITM-295-ready", waiting, context);
  assert.equal(blockedGate.startable, false); assert.match(blockedGate.reasons.join("\n"), /Planning → Development/);
  const absentDeveloper = startable("ITM-295-ready", ready, { ...context, participants: [] });
  assert.equal(absentDeveloper.startable, false); assert.match(absentDeveloper.reasons.join("\n"), /Developers/); assert.match(absentDeveloper.reasons.join("\n"), /write to the repository/);
});
