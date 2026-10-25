// An item built without a pull request that names it is done when its record names the commits that built it — MOD-work-plans'
// itemStates and startable as docs/architecture/MOD-work-plans.md states them: "`done` (its pull request is merged, or its record
// names the commits that built it, `built_by`)". The record decides; no request is made for it.
// Run: node --test tests/work-plans-built-by.test.mjs
//
// Module: MOD-work-plans
// Guards: UC-032; STATUS IS DERIVED FROM THE RECORDS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
// Level: unit
//
// Each test states its input and its expected values in its own text (given / input / expect). The items are Documents in the
// form MOD-documents' readDocument gives them; the pull requests in the form of MOD-repository-hosts' PullRequest. Nothing is
// read and nothing reaches the network. The counter-proofs are recorded in the commit that makes these tests pass.

import test from "node:test";
import assert from "node:assert/strict";
import { itemStates, startable } from "../src/work-plans/index.mjs";

const C1 = "c1".repeat(20), C2 = "c2".repeat(20);

const item = (id, fields = {}) => ({
  kind: "item",
  path: `docs/backlog/${id}-work.md`,
  id,
  fields: { id, realises: ["UC-032"], modules: ["MOD-work-plans"], builds_on: [], ...fields },
  sections: [],
});
const facts = (overrides = {}) => ({
  statuses: new Map([["UC-032", { id: "UC-032", kind: "use-case", status: "accepted" }]]),
  queues: [],
  jobs: [],
  pullRequests: [],
  gates: [],
  workflow: null,
  ...overrides,
});
const stateOf = (states, id) => states.find((state) => state.item === id);
const merged = (id, number) => ({ number, title: `${id} work`, branch: `work/${id}`, base: "main", head: "a".repeat(40), state: "merged",
  draft: false, url: `https://example.invalid/${number}`, opened: "2026-10-13T08:00:00Z", merged: "2026-10-13T09:00:00Z", closed: null });

// TST-8101 · level: unit · module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-032
// given: ITM-001 whose built_by names C1 and C2, no pull request naming it
// input: itemStates([ITM-001], null, facts), once with the pull requests [] and once with the pull requests "unknown"
// expect: ITM-001 done, with reason null, job null and pullRequest null, in both: its record decides it, whatever the pull requests
test("TST-8101: itemStates — an item whose record names the commits that built it is done", () => {
  const items = [item("ITM-001", { built_by: [C1, C2] })];
  for (const pullRequests of [[], "unknown"]) {
    assert.deepEqual(stateOf(itemStates(items, null, facts({ pullRequests })), "ITM-001"),
      { item: "ITM-001", state: "done", reason: null, job: null, pullRequest: null }, `pull requests ${JSON.stringify(pullRequests)}`);
  }
});

// TST-8102 · level: unit · module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-032
// given: ITM-001 with an empty built_by, and ITM-002 without the field; no pull request names either
// input: itemStates([ITM-001, ITM-002], null, facts)
// expect: both ready: a record that names no commit makes no item done
test("TST-8102: itemStates — an empty or missing built_by makes no item done", () => {
  const states = itemStates([item("ITM-001", { built_by: [] }), item("ITM-002")], null, facts());
  assert.equal(stateOf(states, "ITM-001").state, "ready");
  assert.equal(stateOf(states, "ITM-002").state, "ready");
});

// TST-8104 · level: unit · module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-032
// given: ITM-001 whose built_by names C1, and whose pull request 7 is merged
// input: itemStates([ITM-001], null, facts with that pull request)
// expect: ITM-001 done by its merged pull request: pullRequest "7", not null — a merged pull request decides first
test("TST-8104: itemStates — a merged pull request still decides first", () => {
  const states = itemStates([item("ITM-001", { built_by: [C1] })], null, facts({ pullRequests: [merged("ITM-001", 7)] }));
  assert.deepEqual(stateOf(states, "ITM-001"), { item: "ITM-001", state: "done", reason: null, job: null, pullRequest: "7" });
});

// TST-8105 · level: unit · module: MOD-work-plans
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-032
// given: ITM-001 done by its built_by, in a model without sprints and without a work-in-progress limit
// input: startable("ITM-001", the states itemStates derives, { workflow, assignment null })
// expect: not startable; a reason names ITM-001 as done, a change to it being a new item
test("TST-8105: startable — refuses an item done by its built_by", () => {
  const states = itemStates([item("ITM-001", { built_by: [C1] })], null, facts());
  const workflow = { model: { flow: { sprints: false } }, phases: [], roles: [] };
  const result = startable("ITM-001", states, { workflow, assignment: null, sprint: null, held: [], wip: null, participants: [] });
  assert.equal(result.startable, false);
  assert.ok(result.reasons.some((reason) => reason.includes("ITM-001 is done")), result.reasons.join(" | "));
});

// TST-8106 · level: unit · module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-032
// given: ITM-001 whose built_by names C1, and ITM-002 that builds on ITM-001; then the same without ITM-001's built_by
// input: itemStates([ITM-002, ITM-001], null, facts)
// expect: with built_by, ITM-001 done and ITM-002 ready — no longer "waiting for an item it builds on" —; without it, ITM-002 waits for ITM-001
test("TST-8106: itemStates — the item that builds on an item done by its built_by no longer waits for it", () => {
  const done = itemStates([item("ITM-002", { builds_on: ["ITM-001"] }), item("ITM-001", { built_by: [C1] })], null, facts());
  assert.deepEqual(done.map((state) => [state.item, state.state]), [["ITM-001", "done"], ["ITM-002", "ready"]]);
  const without = itemStates([item("ITM-002", { builds_on: ["ITM-001"] }), item("ITM-001")], null, facts());
  assert.deepEqual(without.map((state) => [state.item, state.state]), [["ITM-001", "ready"], ["ITM-002", "waiting for an item it builds on"]]);
});
