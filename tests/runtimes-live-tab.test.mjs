// A job in this tab, its live state, its log and its cancel (ITM-535) — MOD-runtimes' `runOnTab` keeping the abort of each job it runs with a record, by the record's id, until the job
// ends, and `liveState`, `jobLog` and `cancelJob` for a job taken by the tab, as the accepted text of docs/architecture/MOD-runtimes.md states it (Interfaces) and ITM-535's Outcome
// settles it, for UC-049 and UC-036. The CI route, the untaken job and the Bridge are tests/runtimes-live-state.test.mjs.
// Run: node --test tests/runtimes-live-tab.test.mjs
//
// Module: MOD-runtimes
// Guards: ONE DASHBOARD SHOWS EVERY JOB; A CANCELLED JOB WRITES NOTHING MORE; UC-049
// Level: unit
//
// Each test states its expected values in its own text; none reads them from a document. The readings, each from ITM-535's Outcome: a record whose `## Taken` has `by: tab` is the
// tab's; the tab holds a job from the start of its `runOnTab` until that call settles, whichever way; a job the tab does not hold has `known: false` and the live state of a job no
// runtime knows (`reason` null, as in tests/runtimes-live-state.test.mjs); `cancelJob` of such a job still ends it at once, since there is nothing to abort. The end a cancel appends
// is that of tests/runtimes-live-state.test.mjs. The drafter's endpoint is a fixture standing behind the global `fetch`, which a test replaces and restores: it holds its answer until
// the request's abort signal fires, then rejects with an AbortError, as the platform's fetch does. Nothing reaches the network. A name the module does not provide yet is undefined
// here, so that each test fails by itself. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";
import { START, fakeHost } from "./runtimes-live-fixture.mjs";

const TAB = { kind: "tab" };
const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "example-model", context: 200000, price: null, capabilities: ["draft text"], place: "this machine", route: "endpoint ep1" };
const CONNECTIONS = { endpoints: { ep1: { config: { name: "ep1", kind: "openai-compatible", baseUrl: "https://ep1.example.test/v1", model: "m", key: null }, bridge: null } }, bridges: {} };
const UNKNOWN = { reachable: true, reason: null, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] };
const HELD = { reachable: true, reason: null, known: true, running: true, cancelling: false, log: null, usage: null, writtenAfterCancel: [] };

const WRITER = "live tab fixture writer";
registerStrategies("tests/runtimes-live-tab.test.mjs", { writers: { [WRITER]: async () => ({ commits: [], files: [], pullRequest: null, shown: null, notes: [] }) } });
const ANSWER = { type: "object", required: ["text"], properties: { text: { type: "string" } } };
const prepared = () => ({ kind: { name: "fixture-writer", serves: [], participant: "one", needs: ["draft text"], resources: "none", preconditions: [], recipes: [], checks: [],
  personDecides: [], reviewer: null, reviewers: 0, steps: [], gatePoints: [], review: "none", writer: WRITER, limit: 5, purpose: "Writes, for a test.", prompt: "Write.", answer: ANSWER },
  params: {}, drafter: DRAFTER, reviewers: [], parts: [], destinations: [], fits: true, notFitting: [], leftOut: [], blocking: [], limit: 5 });
const context = () => ({ kind: null, params: {}, product: { address: "https://github.com/alice/product", snapshot: null, host: null }, instance: { snapshot: null, host: null },
  connect: async () => null, participants: [DRAFTER], places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-10-16T11:00:00Z"),
  agentM: START.agentM, jobId: START.id });

// The endpoint behind fetch. `hold` makes it wait for the abort; otherwise it answers a draft. `arrived` resolves when the request has arrived.
const realFetch = globalThis.fetch;
let arrive = () => {};
let arrived = Promise.resolve();
function endpoint({ hold }) {
  arrived = new Promise((resolve) => { arrive = resolve; });
  globalThis.fetch = async (url, init) => {
    arrive();
    if (hold) {
      await new Promise((_, reject) => init.signal.addEventListener("abort", () => reject(Object.assign(new Error("The operation was aborted."), { name: "AbortError" }))));
    }
    return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ draft: { text: "the draft" }, answers: [] }) } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }),
      { status: 200, headers: { "content-type": "application/json" } });
  };
}
test.afterEach(() => { globalThis.fetch = realFetch; });

// A repository that holds the job as the tab's route queued it: start and taking in one commit.
async function queued() {
  const fake = fakeHost({ taken: "tab" });
  return { fake, record: await fake.record(), loose: { ...START, path: `docs/jobs/${START.id}.md`, run: null } };
}
const settle = (promise) => promise.then(() => "resolved", (error) => error);

// TST-535011 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job taken by the tab whose runOnTab has not been called; then runOnTab started with a drafter whose endpoint holds its answer
// input: liveState and jobLog before the call; the same while the call is pending
// expect: before: the live state of a job no runtime knows { reachable: true, reason: null, known: false, running: false, cancelling: false, log: null, usage: null, writtenAfterCancel: [] }; while pending: { reachable: true, reason: null, known: true, running: true, cancelling: false, log: null, usage: null, writtenAfterCancel: [] }; the log of both is { gone: true }
test("liveState and jobLog — the tab holds a job while its runOnTab is pending, and keeps no log", async () => {
  assert.equal(typeof runtimes.liveState, "function");
  const { fake, record, loose } = await queued();
  const product = { host: fake.host };
  assert.deepEqual(await runtimes.liveState(record, product, {}), UNKNOWN, "before the job runs");
  endpoint({ hold: true });
  const running = settle(runtimes.runOnTab(prepared(), context(), CONNECTIONS, { host: fake.host, record: loose }));
  await arrived;
  assert.deepEqual(await runtimes.liveState(record, product, {}), HELD, "while it runs");
  assert.deepEqual(await runtimes.jobLog(record, product, {}), { gone: true });
  await runtimes.cancelJob(record, product, {});
  await running;
});

// TST-535012 · level: unit · module: MOD-runtimes
// guards: ONE DASHBOARD SHOWS EVERY JOB; UC-049
// given: a job in the tab that ends normally (the endpoint answers a draft); and one that fails (the endpoint answers 500)
// input: runOnTab to its end; liveState after it
// expect: while the call is pending liveState is held (known true, running true) — the known positive —; after the call settled, for the job that ended and for the one that failed, the live state of a job the tab does not hold: known false, running false
test("runOnTab — the tab holds a job until the call ends, whether it ends or fails", async () => {
  for (const status of [200, 500]) {
    const { fake, record, loose } = await queued();
    globalThis.fetch = async (url, init) => {
      arrive();
      await new Promise((resolve) => setTimeout(resolve, 5));
      return status === 200
        ? new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ draft: { text: "the draft" }, answers: [] }) } }], usage: null }), { status: 200, headers: { "content-type": "application/json" } })
        : new Response(JSON.stringify({ error: { message: "broken" } }), { status });
    };
    arrived = new Promise((resolve) => { arrive = resolve; });
    const running = settle(runtimes.runOnTab(prepared(), context(), CONNECTIONS, { host: fake.host, record: loose }));
    await arrived;
    assert.equal((await runtimes.liveState(record, { host: fake.host }, {})).known, true, `held while the call is pending (${status})`);
    await running;
    assert.deepEqual(await runtimes.liveState(record, { host: fake.host }, {}), UNKNOWN, `not held once the call settled (${status})`);
  }
});

// TST-535013 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-049
// given: a job taken by the tab, pending on its endpoint, after the queueing commit c0
// input: cancelJob(record, { host }, {}), then the endpoint's rejection settles runOnTab
// expect: "cancelled"; the endpoint's request was aborted (runOnTab rejects); exactly one commit after the queueing: the end, on head c0, message "Job JOB-20261016-1100-c0de: end", state cancelled, reason "cancelled by a person", log null; after runOnTab settled still that one commit — the job's own failure to read the aborted request is not appended; liveState afterwards is the unknown state
test("cancelJob — a job in the tab is aborted and ended as cancelled, and writes nothing more", async () => {
  const { fake, record, loose } = await queued();
  endpoint({ hold: true });
  const running = settle(runtimes.runOnTab(prepared(), context(), CONNECTIONS, { host: fake.host, record: loose }));
  await arrived;
  assert.equal(fake.writes.length, 0, "known state: nothing committed since the queueing");
  assert.equal(await runtimes.cancelJob(record, { host: fake.host }, {}), "cancelled");
  const outcome = await running;
  assert.notEqual(outcome, "resolved", "the job's call was aborted");
  assert.equal(fake.writes.length, 1, "one commit: the end");
  assert.deepEqual([fake.writes[0].expectedHead, fake.writes[0].message], ["c0", `Job ${START.id}: end`]);
  const { state, reason, log, results } = (await fake.record()).end;
  assert.deepEqual({ state, reason, log, results }, { state: "cancelled", reason: "cancelled by a person", log: null, results: [] });
  assert.deepEqual(await runtimes.liveState(record, { host: fake.host }, {}), UNKNOWN);
});

// TST-535014 · level: unit · module: MOD-runtimes
// guards: A CANCELLED JOB WRITES NOTHING MORE; UC-049
// given: job JOB-20261016-1100-c0de, which the tab holds (its runOnTab pending); job JOB-20261016-1100-0000 of another record, taken by the tab, which the tab does not hold (it was reloaded)
// input: cancelJob on the job the tab does not hold; then liveState of the held job; then cancelJob on the held job
// expect: the first: "cancelled" with one commit on its own repository, its end cancelled; the held job is untouched: liveState known true, running true, and no commit on its repository; then its cancel gives "cancelled" with its end committed
test("cancelJob — a job the tab does not hold is ended at once, and aborts no other job", async () => {
  const { fake, record, loose } = await queued();
  endpoint({ hold: true });
  const running = settle(runtimes.runOnTab(prepared(), context(), CONNECTIONS, { host: fake.host, record: loose }));
  await arrived;
  const other = fakeHost({ id: "JOB-20261016-1100-0000", taken: "tab" });
  assert.equal(await runtimes.cancelJob(await other.record(), { host: other.host }, {}), "cancelled");
  assert.deepEqual([other.writes.length, (await other.record()).end.state], [1, "cancelled"]);
  assert.deepEqual([(await runtimes.liveState(record, { host: fake.host }, {})).running, fake.writes.length], [true, 0], "the held job is untouched");
  assert.equal(await runtimes.cancelJob(record, { host: fake.host }, {}), "cancelled");
  await running;
  assert.equal((await fake.record()).end.state, "cancelled");
});
