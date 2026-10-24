// The derived ItemState list for backlog items and plan steps (ITM-295) — MOD-work-plans' itemStates interface from
// docs/architecture/MOD-work-plans.md, for UC-002 and UC-032. It consumes only supplied Documents, approval status facts,
// Queue facts, JobRows, PullRequests, gateStates output and Workflow records; it stores no state and reads no repository.
// Run: node --test tests/work-plans-item-states.test.mjs
//
// Module: MOD-work-plans
// Guards: STATUS IS DERIVED FROM THE RECORDS; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
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

  states = itemStates([item("ITM-295-case")], null, facts({ pullRequests: [
    { ...pull("ITM-295-case", "merged", 19), title: "the case-sensitive branch name", branch: "codex/itm-295-case" },
  ] }));
  assert.equal(stateOf(states, "ITM-295-case").state, "done", "a lower-case branch name still names the uppercase backlog item");

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

// TST-1196001 · level: unit · module: MOD-work-plans
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-032
// given: two items that realise a use case changed since its approval, one with a merged pull request naming it and one without
// input: itemStates(items, null, facts) with the use case's status "changed"
// expect: the item with the merged pull request is done and names that pull request; the item without waits for acceptance and names the use case
test("TST-1196001: an item whose pull request is merged stays done when a use case it realises is changed", () => {
  const items = [item("ITM-1196-merged", { realises: ["UC-CHANGED"] }), item("ITM-1196-open", { realises: ["UC-CHANGED"] })];
  const states = itemStates(items, null, facts({
    statuses: statusMap([["UC-CHANGED", "changed", "use-case"]]),
    pullRequests: [pull("ITM-1196-merged", "merged", 31)],
  }));
  assert.equal(stateOf(states, "ITM-1196-open").state, "waiting for acceptance", "known positive: without a merged pull request the changed use case holds the item");
  assert.match(stateOf(states, "ITM-1196-open").reason, /UC-CHANGED/);
  assert.equal(stateOf(states, "ITM-1196-merged").state, "done");
  assert.equal(stateOf(states, "ITM-1196-merged").pullRequest, "31");
});

// TST-1196002 · level: unit · module: MOD-work-plans
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-032
// given: a chain of three items, the first with an open pull request, the second with a merged one, the third with none
// input: itemStates(items, null, facts) for the chain, and for the same chain without the second item's merged pull request
// expect: the second item is done though the item it builds on is open, and the third is ready; without the merged pull request the second waits for the first, and the third waits for the second
test("TST-1196002: an item whose pull request is merged stays done when an item it builds on is not done", () => {
  const items = [item("ITM-1196-top", { builds_on: ["ITM-1196-middle"] }), item("ITM-1196-middle", { builds_on: ["ITM-1196-base"] }),
    item("ITM-1196-base")];
  let states = itemStates(items, null, facts({ pullRequests: [pull("ITM-1196-base", "open", 40), pull("ITM-1196-middle", "merged", 41)] }));
  assert.equal(stateOf(states, "ITM-1196-base").state, "in progress");
  assert.equal(stateOf(states, "ITM-1196-middle").state, "done");
  assert.equal(stateOf(states, "ITM-1196-top").state, "ready", "the item above builds on a done item");

  states = itemStates(items, null, facts({ pullRequests: [pull("ITM-1196-base", "open", 40)] }));
  assert.equal(stateOf(states, "ITM-1196-middle").state, "waiting for an item it builds on", "known positive: no merged pull request, the open prerequisite holds it");
  assert.match(stateOf(states, "ITM-1196-middle").reason, /ITM-1196-base/);
  assert.equal(stateOf(states, "ITM-1196-top").state, "waiting for an item it builds on");
});

// TST-1196003 · level: unit · module: MOD-work-plans
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-032
// given: items with no merged pull request: one realising an open requirement, one building on an item that is not done, one with only a closed pull request
// input: itemStates(items, null, facts)
// expect: the first waits for acceptance, the second waits for the item it builds on, and the third, which realises an accepted use case, is ready
test("TST-1196003: an item without a merged pull request still waits for acceptance and for the items it builds on", () => {
  const items = [item("ITM-1196-unaccepted", { realises: ["REQ-OPEN"] }), item("ITM-1196-prereq"),
    item("ITM-1196-dependent", { builds_on: ["ITM-1196-prereq"] }), item("ITM-1196-closed")];
  const states = itemStates(items, null, facts({
    statuses: statusMap([["UC-READY", "accepted", "use-case"], ["REQ-OPEN", "open"]]),
    pullRequests: [pull("ITM-1196-prereq", "open", 50), pull("ITM-1196-closed", "closed", 51)],
  }));
  assert.equal(stateOf(states, "ITM-1196-unaccepted").state, "waiting for acceptance");
  assert.match(stateOf(states, "ITM-1196-unaccepted").reason, /REQ-OPEN/);
  assert.equal(stateOf(states, "ITM-1196-dependent").state, "waiting for an item it builds on");
  assert.match(stateOf(states, "ITM-1196-dependent").reason, /ITM-1196-prereq/);
  assert.equal(stateOf(states, "ITM-1196-closed").state, "ready", "known positive: a closed pull request is no merged one");
});
