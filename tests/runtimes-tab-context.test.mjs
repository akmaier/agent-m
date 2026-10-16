// A tab job's context, and a job in the tab without a record (ITM-493) — MOD-runtimes' tabContext(inputs) and runOnTab with `record: null`, as the accepted text of
// docs/architecture/MOD-runtimes.md states them (Interfaces: tabContext, runOnTab), for UC-049. The values the module file leaves unstated are those of sprint 34's
// selection and of ITM-493: `connect(address)` gives the product's host for the product's address and the instance's host for the instance's address
// (`instance.snapshot.repository.web`), and `null` for any other address, making no request; `runOnTab` with `record: null` is attended and appends nothing anywhere,
// the host not being asked for anything.
// Run: node --test tests/runtimes-tab-context.test.mjs
//
// Module: MOD-runtimes
// Guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// Level: unit
//
// Each test states its expected values in its own text; none reads them from a document. The hosts are spies in memory that keep every call; the endpoint is a fixture
// behind the global `fetch`, which each test replaces and restores. Nothing reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";

const PRODUCT_ADDRESS = "https://github.com/alice/product";
const INSTANCE_ADDRESS = "https://github.com/akmaier/agent-m";
const DRAFT = { text: "the draft" };
const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "example-model", context: 200000, price: null, capabilities: ["draft text"], place: "this machine",
  route: "endpoint ep1" };
const CONNECTIONS = { endpoints: { ep1: { config: { name: "ep1", kind: "openai-compatible", baseUrl: "https://ep1.example.test/v1", model: "m", key: null }, bridge: null } },
  bridges: {} };

// A host that answers nothing and keeps the name of every method called on it.
function spyHost(label) {
  const calls = [];
  const host = new Proxy({ label }, { get: (target, name) => (name === "label" ? label : async () => { calls.push(String(name)); throw new Error(`unexpected call ${String(name)}`); }) });
  return { host, calls };
}
const snapshotOf = (web, commit) => ({ repository: { server: "github", origin: "https://github.com", path: web.slice(19), web }, ref: "main", commit, paths: [], read: async () => null, blob: () => null });

const realFetch = globalThis.fetch;
let requests = [];
function endpointAnswers() {
  requests = [];
  globalThis.fetch = async (url) => {
    requests.push(String(url));
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ draft: DRAFT, answers: [] }) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }),
      { status: 200, headers: { "content-type": "application/json" } });
  };
}
function noRequestAllowed() {
  requests = [];
  globalThis.fetch = async (url) => { requests.push(String(url)); throw new Error("no request is allowed"); };
}
test.afterEach(() => { globalThis.fetch = realFetch; });

let writerCalls = [];
const WRITER = "tab context fixture writer";
registerStrategies("tests/runtimes-tab-context.test.mjs", { writers: { [WRITER]: async (result) => { writerCalls.push(result.draft); return { commits: [], files: [], pullRequest: null, shown: null, notes: [] }; } } });
const ANSWER = { type: "object", required: ["text"], properties: { text: { type: "string" } } };
const jobOf = (review, gatePoints = []) => ({
  kind: { name: "fixture-writer", serves: [], participant: "one", needs: ["draft text"], resources: "none", preconditions: [], recipes: [], checks: [], personDecides: [],
    reviewer: null, reviewers: 0, steps: [], gatePoints, review, writer: WRITER, limit: 5, purpose: "Writes, for a test.", prompt: "Write.", answer: ANSWER },
  params: {}, drafter: DRAFTER, reviewers: [], parts: [], destinations: [], fits: true, notFitting: [], leftOut: [], blocking: [], limit: 5 });
const contextOf = (gates = []) => ({ kind: null, params: {}, product: { address: PRODUCT_ADDRESS, snapshot: null, host: null }, instance: { snapshot: null, host: null },
  connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null }, gates, person: "alice", now: new Date("2026-10-16T09:00:00Z"),
  agentM: { version: "v1", commit: "a".repeat(40) }, jobId: null });

function inputsOf(product, instance) {
  return { kind: { name: "fixture-kind" }, params: { page: "SPEC.md" }, product: { address: PRODUCT_ADDRESS, snapshot: snapshotOf(PRODUCT_ADDRESS, "p1"), host: product },
    instance: { snapshot: snapshotOf(INSTANCE_ADDRESS, "i1"), host: instance }, participants: [DRAFTER], places: { sources: {}, mailbox: null },
    gates: [{ name: "Review → Merge", point: "before-merge", passed: false }], person: "alice", agentM: { version: "v1", commit: "b".repeat(40) }, jobId: "JOB-20261016-0900-abcd" };
}

// TST-493001 · level: unit · module: MOD-runtimes
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-049
// given: the inputs a caller has read — kind `fixture-kind`, params `{ page: "SPEC.md" }`, the product at https://github.com/alice/product, one participant, one gate, person `alice`, agentM v1 and job id JOB-20261016-0900-abcd; both hosts spies; fetch that fails any request
// input: tabContext(inputs)
// expect: the context carries every input as given (kind, params, product, instance snapshot and host, participants, places, gates, person, agentM, jobId); `instance.checkout` is `null`; `now` is a Date between the moments before and after the call; no host method called and no request made
test("tabContext — gives the context of a tab job from what the caller read, and makes no request", () => {
  noRequestAllowed();
  const product = spyHost("product"), instance = spyHost("instance");
  const inputs = inputsOf(product.host, instance.host);
  const before = Date.now();
  const context = runtimes.tabContext(inputs);
  const after = Date.now();
  assert.deepEqual(context.kind, { name: "fixture-kind" });
  assert.deepEqual(context.params, { page: "SPEC.md" });
  assert.equal(context.product.address, "https://github.com/alice/product");
  assert.equal(context.product.snapshot.commit, "p1");
  assert.equal(context.product.host, product.host);
  assert.equal(context.instance.snapshot.commit, "i1");
  assert.equal(context.instance.host, instance.host);
  assert.equal(context.instance.checkout, null);
  assert.deepEqual(context.participants.map((each) => each.name), ["drafter-a"]);
  assert.deepEqual(context.places, { sources: {}, mailbox: null });
  assert.deepEqual(context.gates, [{ name: "Review → Merge", point: "before-merge", passed: false }]);
  assert.deepEqual([context.person, context.jobId], ["alice", "JOB-20261016-0900-abcd"]);
  assert.deepEqual(context.agentM, { version: "v1", commit: "b".repeat(40) });
  assert.ok(context.now instanceof Date && context.now.getTime() >= before && context.now.getTime() <= after, "now is the moment of the call");
  assert.deepEqual([product.calls, instance.calls, requests], [[], [], []]);
});

// TST-493002 · level: unit · module: MOD-runtimes
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-049
// given: the same inputs; a product host and an instance host that are spies; fetch that fails any request
// input: await context.connect(address) for the product's address, the instance's address, and https://github.com/someone/else
// expect: the product's host for https://github.com/alice/product; the instance's host for https://github.com/akmaier/agent-m; `null` for the third; no host method called and no request made
test("tabContext — connect gives the product's host, the instance's host, and null for any other address", async () => {
  noRequestAllowed();
  const product = spyHost("product"), instance = spyHost("instance");
  const { connect } = runtimes.tabContext(inputsOf(product.host, instance.host));
  assert.equal(await connect("https://github.com/alice/product"), product.host);
  assert.equal(await connect("https://github.com/akmaier/agent-m"), instance.host);
  assert.equal(await connect("https://github.com/someone/else"), null);
  assert.deepEqual([product.calls, instance.calls, requests], [[], [], []]);
});

// TST-493003 · level: unit · module: MOD-runtimes
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a job of review none whose writer commits nothing, and an endpoint that answers the draft `the draft`; a host spy; known positive first — the same job with a record
// input: runOnTab(prepared, context, connections, { host, record: null }); then the same with a record
// expect: with a record the host is asked (repositoryInfo among its calls); with `record: null` the result holds the draft, stopped because passed, the writer called once with the draft, the endpoint called once, and the host asked nothing
test("runOnTab — a job with record null runs to its result and the host is asked for nothing", async () => {
  const withRecord = spyHost("with");
  endpointAnswers();
  await runtimes.runOnTab(jobOf("none"), contextOf(), CONNECTIONS, { host: withRecord.host, record: { id: "JOB-1", path: "docs/jobs/JOB-1.md", run: null } }).catch(() => {});
  assert.ok(withRecord.calls.includes("repositoryInfo"), "known positive: with a record the host is asked");
  const without = spyHost("without");
  endpointAnswers();
  writerCalls = [];
  const result = await runtimes.runOnTab(jobOf("none"), contextOf(), CONNECTIONS, { host: without.host, record: null });
  assert.deepEqual([result.draft, result.stoppedBecause], [{ text: "the draft" }, "passed"]);
  assert.deepEqual(writerCalls, [{ text: "the draft" }]);
  assert.deepEqual(requests, ["https://ep1.example.test/v1/chat/completions"]);
  assert.deepEqual(without.calls, []);
});

// TST-493004 · level: unit · module: MOD-runtimes
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; A JOB STOPS AT EVERY GATE
// given: a job of review none with the gate point before-write whose gate in the context is not passed; a host spy; known positive first — the same job with a record, whose host is asked
// input: runOnTab with `record: null`
// expect: the result stopped at the gate `Development → Review`, the writer not called, the host asked nothing
test("runOnTab — a gate reached by a job with record null is appended nowhere", async () => {
  const gates = [{ name: "Development → Review", point: "before-write", passed: false, decider: "the product owner" }];
  const withRecord = spyHost("with");
  endpointAnswers();
  await runtimes.runOnTab(jobOf("none", ["before-write"]), contextOf(gates), CONNECTIONS, { host: withRecord.host, record: { id: "JOB-1", path: "docs/jobs/JOB-1.md", run: null } }).catch(() => {});
  assert.ok(withRecord.calls.includes("repositoryInfo"), "known positive: with a record the gate is appended through the host");
  const without = spyHost("without");
  endpointAnswers();
  writerCalls = [];
  const result = await runtimes.runOnTab(jobOf("none", ["before-write"]), contextOf(gates), CONNECTIONS, { host: without.host, record: null });
  assert.deepEqual([result.stoppedBecause, result.gate, writerCalls], ["gate", "Development → Review", []]);
  assert.deepEqual(without.calls, []);
});

// TST-493005 · level: unit · module: MOD-runtimes
// guards: A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a job whose drafter's endpoint has no configuration; a host spy; known positive first — the same job with a record, whose host is asked to end it failed
// input: runOnTab with `record: null`
// expect: it fails with `EndpointNotConfigured`, unchanged, and the host is asked nothing
test("runOnTab — a failure of a job with record null is thrown by name and appended nowhere", async () => {
  const none = { endpoints: {}, bridges: {} };
  const withRecord = spyHost("with");
  await assert.rejects(runtimes.runOnTab(jobOf("none"), contextOf(), none, { host: withRecord.host, record: { id: "JOB-1", path: "docs/jobs/JOB-1.md", run: null } }),
    (error) => error.name === "EndpointNotConfigured");
  assert.ok(withRecord.calls.includes("repositoryInfo"), "known positive: with a record the end is appended through the host");
  const without = spyHost("without");
  await assert.rejects(runtimes.runOnTab(jobOf("none"), contextOf(), none, { host: without.host, record: null }), (error) => error.name === "EndpointNotConfigured");
  assert.deepEqual(without.calls, []);
});
