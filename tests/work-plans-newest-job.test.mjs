// An item's newest job, also once it has ended (ITM-864) — MOD-work-plans' itemStates, as docs/architecture/MOD-work-plans.md states
// it: "`job` the newest job whose record works on the item, also once that job has ended, and null when there is none" (Interfaces,
// ItemState), and "in progress (a job runs, or its pull request is open; and once its newest job has ended as done, until a pull
// request of it opened after that job's `start` is merged or closed without merge)" (Data). Pure: documents, JobRows and
// PullRequests are handed in; nothing is read, and `fetch` must not have been called when a test ends.
// Run: node --test tests/work-plans-newest-job.test.mjs
//
// Module: MOD-work-plans
// Guards: THE BUILD IS SHOWN AS IT HAPPENS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED; STATUS IS DERIVED FROM THE RECORDS
// Level: unit
//
// Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the
// pull request.

import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { itemStates } from "../src/work-plans/index.mjs";

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

const ID = "ITM-864";
const item = (id, fields = {}) => ({ kind: "item", path: `docs/backlog/${id}-work.md`, id,
  fields: { id, realises: ["UC-READY"], modules: [], builds_on: [], ...fields }, sections: [] });
const facts = (over = {}) => ({ statuses: new Map([["UC-READY", { id: "UC-READY", kind: "use-case", status: "accepted" }]]),
  queues: [], jobs: [], pullRequests: [], gates: [], workflow: null, ...over });
const job = (id, state, start = "2026-10-20T09:00:00Z", worksOn = [ID]) => ({ record: { id, worksOn, start: new Date(start) }, state });
const pull = (state, opened, number = 1) => ({ number, title: `${ID} work`, branch: `item/${ID}`, base: "main", head: "a".repeat(40), state,
  draft: false, url: `https://example.invalid/${number}`, opened, merged: state === "merged" ? "2026-10-20T12:00:00Z" : null,
  closed: state === "closed" ? "2026-10-20T12:00:00Z" : null });
const stateOf = (over, items = [item(ID)]) => itemStates(items, null, facts(over)).find((state) => state.item === ID);

const AFTER = "2026-10-20T10:00:00Z";   // opened after the job's start (09:00)
const BEFORE = "2026-10-20T08:00:00Z";  // opened before it

// TST-864001 · level: unit · module: MOD-work-plans
// guards: THE BUILD IS SHOWN AS IT HAPPENS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: an item whose newest job JOB-1 has ended as done at 09:00, and (a) no pull request, (b) a pull request opened at 10:00 and open, (c) one opened at 10:00 and merged
// input: itemStates for the item
// expect: (a) in progress, job JOB-1, no pull request — the item is not ready and the job is not dropped; (b) in progress, job JOB-1, the pull request 7; (c) done, job JOB-1, pull request 7
test("itemStates — an item whose newest job ended as done stays in progress, with that job, until a pull request opened after its start is merged", () => {
  const ended = [job("JOB-1", "done")];
  const none = stateOf({ jobs: ended });
  assert.equal(none.state, "in progress");
  assert.equal(none.job, "JOB-1");
  assert.equal(none.pullRequest, null);
  assert.match(none.reason, /JOB-1/);
  assert.deepEqual(stateOf({ jobs: ended, pullRequests: [pull("open", AFTER, 7)] }),
    { item: ID, state: "in progress", reason: "pull request 7 is open for review", job: "JOB-1", pullRequest: "7" });
  assert.deepEqual(stateOf({ jobs: ended, pullRequests: [pull("merged", AFTER, 7)] }),
    { item: ID, state: "done", reason: null, job: "JOB-1", pullRequest: "7" });
});

// TST-864002 · level: unit · module: MOD-work-plans
// guards: THE BUILD IS SHOWN AS IT HAPPENS; STATUS IS DERIVED FROM THE RECORDS
// given: an item whose newest job JOB-1 ended as done at 09:00, and (a) a pull request opened at 10:00 and closed without merge, (b) a merged pull request opened at 08:00, before the job's start, (c) the same merged one and a second opened at 10:00 and still open
// input: itemStates for the item
// expect: (a) ready, job JOB-1 — the closed pull request ends the stay; (b) done, job JOB-1, pull request 6 — a merged item stays done whatever job of it follows; (c) done, job JOB-1, pull request 6 — and whatever pull request of it is opened after the merge
test("itemStates — a closed pull request after the job's start returns the item to ready, and an earlier merged one keeps it done", () => {
  const ended = [job("JOB-1", "done")];
  assert.deepEqual(stateOf({ jobs: ended, pullRequests: [pull("closed", AFTER, 7)] }),
    { item: ID, state: "ready", reason: null, job: "JOB-1", pullRequest: null });
  const earlier = stateOf({ jobs: ended, pullRequests: [pull("merged", BEFORE, 6)] });
  assert.deepEqual([earlier.state, earlier.job, earlier.pullRequest], ["done", "JOB-1", "6"]);
  const both = stateOf({ jobs: ended, pullRequests: [pull("merged", BEFORE, 6), pull("open", AFTER, 8)] });
  assert.deepEqual([both.state, both.job, both.pullRequest], ["done", "JOB-1", "6"]);
});

// TST-864003 · level: unit · module: MOD-work-plans
// guards: THE BUILD IS SHOWN AS IT HAPPENS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: an item with a job in each state that is not done — failed, waiting at a gate, running, queued, cancelling, cancelled, ended without record — and none of them with a pull request
// input: itemStates for each
// expect: the job is named in every state; failed and waiting at a gate are blocked, running, queued and cancelling in progress; cancelled and ended without record are ready — only a job that ended as done keeps the item in progress
test("itemStates — a job that has not ended as done is named as before, and only done keeps the item in progress", () => {
  const expected = { failed: "blocked", "waiting at a gate": "blocked", running: "in progress", queued: "in progress",
    cancelling: "in progress", cancelled: "ready", "ended without record": "ready" };
  for (const [state, wanted] of Object.entries(expected)) {
    const got = stateOf({ jobs: [job("JOB-1", state)] });
    assert.deepEqual([state, got.state, got.job], [state, wanted, "JOB-1"]);
  }
});

// TST-864004 · level: unit · module: MOD-work-plans
// guards: THE BUILD IS SHOWN AS IT HAPPENS; PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
// given: (a) an item with a done job and pull requests "unknown"; (b) an item with a running job and a merged pull request opened before the job started; (c) an item waiting for acceptance, one waiting for an item it builds on and one waiting at a gate, each with a done job; (d) an item with no job and a merged pull request; (e) two done jobs of the item, JOB-new (started 09:00) listed before JOB-old (started 08:00), as listJobs lists them newest first, and a merged pull request of the item
// input: itemStates
// expect: (a) unknown, job JOB-1; (b) done, job JOB-1 — a merged item stays done whatever job of it runs; (c) each names its job JOB-1 in its state; (d) done, job null; (e) done, job JOB-new
test("itemStates — job is set in every branch, null when the item has no job, and names the newest of several", () => {
  const ended = [job("JOB-1", "done")];
  const unknown = stateOf({ jobs: ended, pullRequests: "unknown" });
  assert.deepEqual([unknown.state, unknown.job, unknown.pullRequest], ["unknown", "JOB-1", null]);
  const running = stateOf({ jobs: [job("JOB-1", "running")], pullRequests: [pull("merged", BEFORE, 6)] });
  assert.deepEqual([running.state, running.job], ["done", "JOB-1"]);

  const acceptance = stateOf({ jobs: ended, statuses: new Map() });
  assert.deepEqual([acceptance.state, acceptance.job], ["waiting for acceptance", "JOB-1"]);
  const builds = itemStates([item("ITM-864-base"), item(ID, { builds_on: ["ITM-864-base"] })], null, facts({ jobs: ended }))
    .find((state) => state.item === ID);
  assert.deepEqual([builds.state, builds.job], ["waiting for an item it builds on", "JOB-1"]);
  const workflow = { model: { name: "m", kind: "pulled", flow: { wip: 2, timeBox: null, sprints: false } }, phases: [], transitions: [],
    gates: [{ name: "A -> B", from: "A", to: "B", artifacts: "x", condition: "y", decider: "Product Owner", addedBy: null, practice: null }],
    roles: [], branches: {}, done: [] };
  const order = { path: "docs/plan/order.md", fields: {}, sections: [{ heading: "## Order", rows: [{ cells: { Step: ID, Phase: "B" } }] }] };
  const gated = itemStates([item(ID)], order, facts({ jobs: ended, workflow, gates: [{ gate: "A -> B", state: "pending" }] }))
    .find((state) => state.item === ID);
  assert.deepEqual([gated.state, gated.job], ["waiting", "JOB-1"]);

  const merged = stateOf({ pullRequests: [pull("merged", BEFORE, 6)] });
  assert.deepEqual([merged.state, merged.job, merged.pullRequest], ["done", null, "6"]);
  assert.equal(stateOf({}).job, null);

  const newest = stateOf({ jobs: [job("JOB-new", "done", "2026-10-20T09:00:00Z"), job("JOB-old", "done", "2026-10-20T08:00:00Z")],
    pullRequests: [pull("merged", "2026-10-20T08:30:00Z", 5)] });
  assert.deepEqual([newest.state, newest.job], ["done", "JOB-new"]);
});
