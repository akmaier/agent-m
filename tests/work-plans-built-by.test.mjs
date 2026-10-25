// An item built without a pull request that names it is done when the commits its record names as built by are on the
// default branch — MOD-work-plans' itemStates, startable and builtByCommits as docs/architecture/MOD-work-plans.md states
// them: "`done` (its pull request is merged, or every commit its `built_by` names is in `onDefault`)", "Without
// `onDefault`, `built_by` decides nothing", and "builtByCommits(items) — every commit the items' `built_by` names, each once:
// the only commits a caller needs to ask `containsCommit` about before calling `itemStates` with `onDefault`".
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
import { builtByCommits, itemStates, startable } from "../src/work-plans/index.mjs";

const C1 = "c1".repeat(20), C2 = "c2".repeat(20), C3 = "c3".repeat(20);

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
// given: ITM-001 whose built_by names C1 and C2, no pull request naming it; onDefault holding C1, C2 and an unrelated C3
// input: itemStates([ITM-001], null, facts with onDefault), once with the pull requests [] and once with the pull requests "unknown"
// expect: ITM-001 done, with reason null, job null and pullRequest null, in both: the commits on the default branch decide it, whatever the pull requests
test("TST-8101: itemStates — an item whose built_by commits are all on the default branch is done", () => {
  const items = [item("ITM-001", { built_by: [C1, C2] })];
  const onDefault = new Set([C1, C2, C3]);
  for (const pullRequests of [[], "unknown"]) {
    assert.deepEqual(stateOf(itemStates(items, null, facts({ pullRequests, onDefault })), "ITM-001"),
      { item: "ITM-001", state: "done", reason: null, job: null, pullRequest: null }, `pull requests ${JSON.stringify(pullRequests)}`);
  }
});

// TST-8102 · level: unit · module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-032
// given: ITM-001 whose built_by names C1 and C2; onDefault holding C1 only
// input: itemStates([ITM-001], null, facts with onDefault)
// expect: ITM-001 ready, not done: one of its commits is not on the default branch
test("TST-8102: itemStates — one built_by commit missing from the default branch leaves the item not done", () => {
  const states = itemStates([item("ITM-001", { built_by: [C1, C2] })], null, facts({ onDefault: new Set([C1]) }));
  assert.deepEqual(stateOf(states, "ITM-001"), { item: "ITM-001", state: "ready", reason: null, job: null, pullRequest: null });
});

// TST-8103 · level: unit · module: MOD-work-plans
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; UC-032
// given: ITM-001 whose built_by names C1; ITM-002 with an empty built_by
// input: itemStates without onDefault; then with onDefault holding C1 and C2
// expect: without onDefault, ITM-001 ready — built_by decides nothing, never guessed —; with onDefault, ITM-001 done and ITM-002, which names no commit, still ready
test("TST-8103: itemStates — without onDefault, built_by decides nothing; an empty built_by never makes an item done", () => {
  const items = [item("ITM-001", { built_by: [C1] }), item("ITM-002", { built_by: [] })];
  const without = itemStates(items, null, facts());
  assert.equal(stateOf(without, "ITM-001").state, "ready");
  assert.equal(stateOf(without, "ITM-002").state, "ready");
  const withCommits = itemStates(items, null, facts({ onDefault: new Set([C1, C2]) }));
  assert.equal(stateOf(withCommits, "ITM-001").state, "done");
  assert.equal(stateOf(withCommits, "ITM-002").state, "ready");
});

// TST-8104 · level: unit · module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-032
// given: ITM-001 whose built_by names C1 and C2, both on the default branch, and whose pull request 7 is merged
// input: itemStates([ITM-001], null, facts with that pull request and onDefault holding C1 and C2)
// expect: ITM-001 done by its merged pull request: pullRequest "7", not null — a merged pull request decides first
test("TST-8104: itemStates — a merged pull request still decides first", () => {
  const states = itemStates([item("ITM-001", { built_by: [C1, C2] })], null,
    facts({ pullRequests: [merged("ITM-001", 7)], onDefault: new Set([C1, C2]) }));
  assert.deepEqual(stateOf(states, "ITM-001"), { item: "ITM-001", state: "done", reason: null, job: null, pullRequest: "7" });
});

// TST-8105 · level: unit · module: MOD-work-plans
// guards: NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED; UC-032
// given: ITM-001 done by its built_by commit C1 on the default branch, in a model without sprints and without a work-in-progress limit
// input: startable("ITM-001", the states itemStates derives, { workflow, assignment null })
// expect: not startable; a reason names ITM-001 as done, a change to it being a new item
test("TST-8105: startable — refuses an item done by its built_by commits", () => {
  const states = itemStates([item("ITM-001", { built_by: [C1] })], null, facts({ onDefault: new Set([C1]) }));
  const workflow = { model: { flow: { sprints: false } }, phases: [], roles: [] };
  const result = startable("ITM-001", states, { workflow, assignment: null, sprint: null, held: [], wip: null, participants: [] });
  assert.equal(result.startable, false);
  assert.ok(result.reasons.some((reason) => reason.includes("ITM-001 is done")), result.reasons.join(" | "));
});

// TST-8106 · level: unit · module: MOD-work-plans
// guards: STATUS IS DERIVED FROM THE RECORDS; UC-032
// given: ITM-001 whose built_by names C1, and ITM-002 that builds on ITM-001
// input: itemStates([ITM-002, ITM-001], null, facts) with onDefault holding C1; and without onDefault
// expect: with onDefault, ITM-001 done and ITM-002 ready — no longer "waiting for an item it builds on" —; without it, ITM-002 waits for ITM-001
test("TST-8106: itemStates — the item that builds on an item done by its built_by commits no longer waits for it", () => {
  const items = [item("ITM-002", { builds_on: ["ITM-001"] }), item("ITM-001", { built_by: [C1] })];
  const done = itemStates(items, null, facts({ onDefault: new Set([C1]) }));
  assert.deepEqual(done.map((state) => [state.item, state.state]), [["ITM-001", "done"], ["ITM-002", "ready"]]);
  const without = itemStates(items, null, facts());
  assert.deepEqual(without.map((state) => [state.item, state.state]), [["ITM-001", "ready"], ["ITM-002", "waiting for an item it builds on"]]);
});

// TST-8107 · level: unit · module: MOD-work-plans
// guards: PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: ITM-001 naming C1 and C2, ITM-002 naming C2 and C3, ITM-003 naming none, ITM-004 whose built_by was read as the text "C3, C1"
// input: builtByCommits(those items); builtByCommits([])
// expect: C1, C2, C3 — every commit the items name, in the order of the items and of their lists, each once —; and [] for no items
test("TST-8107: builtByCommits — every built_by commit of the items, each once", () => {
  const items = [item("ITM-001", { built_by: [C1, C2] }), item("ITM-002", { built_by: [C2, C3] }), item("ITM-003"),
    item("ITM-004", { built_by: `${C3}, ${C1}` })];
  assert.deepEqual(builtByCommits(items), [C1, C2, C3]);
  assert.deepEqual(builtByCommits([]), []);
});
