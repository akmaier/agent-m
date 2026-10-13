// The derived ItemState list for backlog items and plan steps (ITM-295) — MOD-work-plans' itemStates interface from
// docs/architecture/MOD-work-plans.md, for UC-002 and UC-032. It consumes only supplied Documents, approval status facts,
// Queue facts, JobRows, PullRequests, gateStates output and Workflow records; it stores no state and reads no repository.
// Run: node --test tests/work-plans-item-states.test.mjs
//
// Module: MOD-work-plans
// Guards: STATUS IS DERIVED FROM THE RECORDS; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; PROGRESS AND JOB STATE ARE
//         DERIVED, NOT STORED
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { itemStates, startable } from "../src/work-plans/index.mjs";

const item = (id, fields = {}) => ({
  kind: "item",
  path: `docs/backlog/${id}-work.md`,
  id,
  fields: { id, realises: ["UC-READY"], modules: [], builds_on: [], ...fields },
  sections: [],
});
const order = (ids) => ({ path: "docs/backlog/order.md", fields: {}, sections: [{ heading: "## Order",
  rows: ids.map((Item) => ({ cells: { Item } })) }] });
const planOrder = (rows) => ({ path: "docs/plan/order.md", fields: {}, sections: [{ heading: "## Order",
  rows: rows.map(({ Step, Phase }) => ({ cells: { Step, Phase } })) }] });
const statusMap = (entries) => new Map(entries.map(([id, status, kind = "requirement"]) => [id, { id, kind, status }]));
const facts = (overrides = {}) => ({
  statuses: statusMap([["UC-READY", "accepted", "use-case"]]),
  queues: [],
  jobs: [],
  pullRequests: [],
  gates: [],
  workflow: null,
  ...overrides,
});
const stateOf = (states, id) => states.find((state) => state.item === id);
const job = (id, state, extra = {}) => ({ record: { id: `JOB-${id}`, worksOn: [id], ...extra }, state });
const pull = (id, state, number = 1) => ({ number, title: `${id} work`, branch: `codex/${id}`,
  base: "main", head: "a".repeat(40), state, draft: false, url: `https://example.invalid/${number}`,
  opened: "2026-10-13T08:00:00Z", merged: state === "merged" ? "2026-10-13T09:00:00Z" : null, closed: null });

const workflow = {
  model: { name: "team-scrum", kind: "pulled", flow: { wip: 2, timeBox: null, sprints: true } },
  phases: [
    { name: "Planning", roles: ["Product Owner"], produces: ["ITM"] },
    { name: "Development", roles: ["Developers"], produces: ["MOD", "TST"] },
  ],
  transitions: [{ from: "Planning", to: "Development", kind: "handoff" }],
  gates: [{ name: "Planning -> Development", from: "Planning", to: "Development", artifacts: "plan",
    condition: "the plan is accepted", decider: "Product Owner", addedBy: null, practice: null }],
  roles: [
    { name: "Product Owner", filledBy: "person", howMany: "one", capabilities: ["read the repository"] },
    { name: "Developers", filledBy: "agent", howMany: "several",
      capabilities: ["read the repository", "write to the repository", "run code and tests"] },
  ],
  branches: {},
  done: [],
};

// TST-295001 · level: unit · module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
// given: supplied backlog Documents in a declared order, one accepted use case, one open requirement, one changed requirement, one withdrawn/missing requirement, and one open Queue entry naming a proposed requirement
// input: itemStates(items, order, facts) with the public status Map and Queue shapes
// expect: the accepted item is ready; the other four wait for acceptance and each reason names the status, missing name, or queue record that prevents work
test("TST-295001: itemStates derives acceptance waits from supplied statuses and queues", () => {
  const items = [
    item("ITM-295-ready"),
    item("ITM-295-open", { realises: ["REQ-OPEN"] }),
    item("ITM-295-changed", { realises: ["REQ-CHANGED"] }),
    item("ITM-295-withdrawn", { realises: ["REQ-WITHDRAWN"] }),
    item("ITM-295-queued", { realises: ["REQ-QUEUED"] }),
  ];
  const states = itemStates(items, order(items.map((entry) => entry.id)), facts({
    statuses: statusMap([
      ["UC-READY", "accepted", "use-case"],
      ["REQ-OPEN", "open"],
      ["REQ-CHANGED", "changed"],
    ]),
    queues: [{ folder: "docs/spec-freigaben/q", title: "queue", target: "SPEC.md", entries: [{
      number: 1, file: "SPEC.md", anchor: "REQ-QUEUED", until: null, proposal: { path: "docs/spec-freigaben/q/01.md",
        blob: "b".repeat(40) }, rationale: "", record: null, decision: null, state: "open", createdBy: null,
    }] }],
  }));
  assert.deepEqual(states.map((state) => state.item), items.map((entry) => entry.id), "states keep the supplied order");
  assert.equal(stateOf(states, "ITM-295-ready").state, "ready", "known positive: accepted work without other facts is ready");
  for (const [id, named] of [
    ["ITM-295-open", "REQ-OPEN"],
    ["ITM-295-changed", "REQ-CHANGED"],
    ["ITM-295-withdrawn", "REQ-WITHDRAWN"],
    ["ITM-295-queued", "docs/spec-freigaben/q#1"],
  ]) {
    assert.equal(stateOf(states, id).state, "waiting for acceptance");
    assert.match(stateOf(states, id).reason, new RegExp(named));
  }
});

// TST-295002 · level: unit · module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: backlog Documents without a plan order, an item that builds on another item, JobRows, known PullRequests and unknown PullRequests
// input: itemStates with each supplied fact varied
// expect: dependency order is derived before the dependent item; unfinished prerequisites, running jobs, review PRs, failed/person-waiting jobs, merged PRs and unknown PR facts each produce the accepted ItemState shape
test("TST-295002: itemStates derives dependency, job, pull-request, done and unknown states", () => {
  const items = [item("ITM-295-dependent", { builds_on: ["ITM-295-base"] }), item("ITM-295-base")];
  let states = itemStates(items, null, facts());
  assert.deepEqual(states.map((state) => state.item), ["ITM-295-base", "ITM-295-dependent"], "backlog order follows builds_on");
  assert.equal(stateOf(states, "ITM-295-dependent").state, "waiting for an item it builds on");
  assert.match(stateOf(states, "ITM-295-dependent").reason, /ITM-295-base/);

  states = itemStates(items, null, facts({ pullRequests: [pull("ITM-295-base", "open", 17)] }));
  assert.equal(stateOf(states, "ITM-295-base").state, "in progress");
  assert.equal(stateOf(states, "ITM-295-base").pullRequest, "17");
  assert.match(stateOf(states, "ITM-295-base").reason, /review|open/i);

  states = itemStates([item("ITM-295-running")], null, facts({ jobs: [job("ITM-295-running", "running")] }));
  assert.deepEqual(stateOf(states, "ITM-295-running"), {
    item: "ITM-295-running", state: "in progress", reason: "job JOB-ITM-295-running is running",
    job: "JOB-ITM-295-running", pullRequest: null,
  });

  states = itemStates([item("ITM-295-failed")], null, facts({ jobs: [job("ITM-295-failed", "failed")] }));
  assert.equal(stateOf(states, "ITM-295-failed").state, "blocked");
  assert.match(stateOf(states, "ITM-295-failed").reason, /JOB-ITM-295-failed/);

  states = itemStates([item("ITM-295-person")], null, facts({ jobs: [
    job("ITM-295-person", "waiting at a gate", { gates: [{ gate: "Planning -> Development", decider: "Product Owner",
      resumedBy: null }], question: null }),
  ] }));
  assert.equal(stateOf(states, "ITM-295-person").state, "blocked");
  assert.match(stateOf(states, "ITM-295-person").reason, /Product Owner/);

  states = itemStates(items, null, facts({ pullRequests: [pull("ITM-295-base", "merged", 18)] }));
  assert.equal(stateOf(states, "ITM-295-base").state, "done");
  assert.equal(stateOf(states, "ITM-295-dependent").state, "ready");

  states = itemStates([item("ITM-295-unknown")], null, facts({ pullRequests: "unknown" }));
  assert.deepEqual(stateOf(states, "ITM-295-unknown"), {
    item: "ITM-295-unknown", state: "unknown", reason: "pull request facts are unknown", job: null, pullRequest: null,
  });
});

// TST-295003 · level: unit · module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-032; A JOB GOES ONLY TO A HOLDER OF ITS ROLE
// given: plan order Step/Phase rows, workflow gates from MOD-product-process and the existing startable interface
// input: itemStates for a Development step with a pending gate, then startable for that derived waiting state
// expect: the step follows the plan order; the waiting state names the gate and decider, and startable returns that derived reason without reading anything else
test("TST-295003: itemStates derives phase-gate waits that startable consumes", () => {
  const states = itemStates([
    item("ITM-295-second"),
    item("ITM-295-first"),
  ], planOrder([
    { Step: "ITM-295-first", Phase: "Planning" },
    { Step: "ITM-295-second", Phase: "Development" },
  ]), facts({ workflow, gates: [{ gate: "Planning -> Development", state: "pending", needs: "a decision by Product Owner" }] }));

  assert.deepEqual(states.map((state) => state.item), ["ITM-295-first", "ITM-295-second"]);
  assert.equal(stateOf(states, "ITM-295-first").state, "ready", "known positive: no gate stands before Planning");
  assert.equal(stateOf(states, "ITM-295-second").state, "waiting");
  assert.match(stateOf(states, "ITM-295-second").reason, /Planning -> Development/);
  assert.match(stateOf(states, "ITM-295-second").reason, /Product Owner/);

  const refused = startable("ITM-295-second", states, { workflow: { ...workflow, model: { ...workflow.model,
    flow: { ...workflow.model.flow, sprints: false } } }, assignment: null, sprint: null, held: [], wip: null,
    participants: [] });
  assert.equal(refused.startable, false);
  assert.match(refused.reasons.join("\n"), /Planning -> Development/);
  assert.match(refused.reasons.join("\n"), /Product Owner/);
});
