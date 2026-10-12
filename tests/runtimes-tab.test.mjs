// A job run in this tab (ITM-319) — MOD-runtimes' tab route, as the accepted text of docs/architecture/MOD-runtimes.md states it: `queueJob` on the
// route `{ kind: "tab" }` ("on the tab's route the start and its taking are one commit"), and `runOnTab(prepared, context, connections, hooks)`:
// "runs the prepared job in this tab with MOD-job-runner, attended unless its record names a run: builds the drafter's and the reviewers' drivers from
// their routes — an endpoint's driver from its configuration, `endpointDriver` where its `bridge` is `null` ... —, appends a gate reached and the end to
// the job's record through the host, and returns the result for the page to show. Fails as the drivers fail, by name." For UC-005 step 4, UC-007 step 3
// and UC-019 step 6. The Bridge route (tests/runtimes-bridge.test.mjs, ITM-325), `routesFor`, `liveState` and the other functions are not part of it.
// Run: node --test tests/runtimes-tab.test.mjs
//
// Module: MOD-runtimes
// Guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; ONE DEFINITION, THREE DRIVERS; THE ROUNDS ARE COUNTED AND SHOWN; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// Where the module file is silent, these tests take the following readings, each from the text that writes or reads the part. (1) The start and the
// taking: MOD-job-ledger's `startRecord` text with its `## Taken` appended (`by: tab`, Data), at the job's start, in one commit. (2) The end: its `results`
// hold, for a writer that committed, a line `commit <sha>` for each commit, `file <path>` for each file and `pull request <address>`, and a line `note: <note>`
// for each note of the writer's outcome (ITM-390); `no change` where it committed nothing (UC-010 4a); `waits for a person` where nothing was written (Data);
// its `draft:` is the draft a kind handed back to a job that ran away from the page (`written.shown` of a job whose record names a run). A failed job's
// end has state `failed` and, as `reason:`, the failure's name and message; the failure is then thrown again unchanged. A cancelled job (`Cancelled`) is
// ended by `cancelJob`, not here. (3) A gate reached is appended alone: the job waits, it has no end; its `decider:` is the gate's `decider` where the
// context's gate carries one, else its name. (4) The endpoint of a participant whose route is `endpoint <name>` is `connections.endpoints[<name>]`.
// The repository is a fake host in memory; the endpoint is a fixture standing behind the global `fetch`, which the test replaces and restores; nothing
// reaches the network. Each test states its input and its expected result before it runs (given / input / expect); where a test asserts a refusal or an
// absence, the same call is first shown to succeed. A name the module does not provide yet is undefined here, so that each test fails by itself. The
// counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { recordsNewestFirst, startRecord } from "../src/job-ledger/index.mjs";
import { registerStrategies } from "../src/job-runner/index.mjs";

const { queueJob } = runtimes;
const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };
const TAB = { kind: "tab" };
const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text"], place: "this machine", route: "endpoint ep1" };
const REVIEWER = { ...DRAFTER, name: "reviewer-b", model: "other-model", route: "endpoint ep2" };
const ENDPOINT = (name) => ({ name, kind: "openai-compatible", baseUrl: `https://${name}.example.test/v1`, model: "m", key: null });
const CONNECTIONS = { endpoints: { ep1: { config: ENDPOINT("ep1"), bridge: null }, ep2: { config: ENDPOINT("ep2"), bridge: null } }, bridges: {} };

const DRAFT = { text: "the draft" };
const START = {
  id: "JOB-20261012-0930-abcd", kind: "fixture-writer", worksOn: ["ITM-319"], participant: "drafter-a", model: "example-model", route: "tab",
  run: null, retries: null, startedBy: "alice", start: new Date("2026-10-12T09:30:00Z"), agentM: { version: "unreleased", commit: "a".repeat(40) },
  inputs: ["SPEC.md@deadbeef"], limit: 5, destinations: [{ participant: "drafter-a", place: "this machine", parts: ["the draft"] }], params: {},
};
const RECORD_PATH = `docs/jobs/${START.id}.md`;

// ---------------------------------------------------------------- the fake repository

// One repository in memory, default branch `trunk`; a commit is made only if the branch still stands at the expected head, else Moved { head }.
function fakeRepository(files = {}) {
  const tree = new Map(Object.entries(files));
  const writes = [];
  let head = "c0", made = 0;
  const snapshot = () => ({ repository: REPOSITORY, ref: "trunk", commit: head, paths: [...tree.keys()].sort(), read: async (path) => tree.get(path) ?? null,
    blob: () => null });
  return {
    writes, tree, head: () => head,
    host: {
      async repositoryInfo() { return { defaultBranch: "trunk", visibility: "public", canWrite: true, archived: false, description: "" }; },
      async readSnapshot() { return snapshot(); },
      async commitFiles({ branch, expectedHead, files, message }) {
        if (expectedHead !== head) throw Object.assign(new Error("Moved"), { name: "Moved", head });
        for (const file of files) tree.set(file.path, file.text);
        head = `c${++made}`;
        writes.push({ branch, expectedHead, files, message });
        return { commit: head };
      },
    },
    record: async () => { for await (const each of recordsNewestFirst(snapshot())) return each; return null; },
    text: (path = RECORD_PATH) => tree.get(path),
  };
}

// ---------------------------------------------------------------- the job, its writer and its endpoint

let outcome = { commits: [], files: [], pullRequest: null, shown: null, notes: [] };
let writerCalls = [];
const WRITER = "tab fixture writer";
registerStrategies("tests/runtimes-tab.test.mjs", { writers: { [WRITER]: async (result) => { writerCalls.push(result.draft); return outcome; } } });

const CHECK = "tab fixture check";
const FLAW = { artifact: "the draft", line: 1, kind: "error", rule: "A DRAFT IS FINAL", what: "the draft is the first", fix: "write the second" };
registerStrategies("tests/runtimes-tab.test.mjs", { checks: { [CHECK]: (draft) => (draft.text === "first" ? [FLAW] : []) } });

const ANSWER = { type: "object", required: ["text"], properties: { text: { type: "string" } } };
const kindOf = (review, gatePoints = []) => ({ name: "fixture-writer", serves: [], participant: "one", needs: ["draft text"], resources: "none", preconditions: [],
  recipes: [], checks: [], personDecides: [], reviewer: null, reviewers: 0, steps: [], gatePoints, review, writer: WRITER, limit: 5,
  purpose: "Writes, for a test.", prompt: "Write.", answer: ANSWER });
const jobOf = (review = "person", gatePoints = [], { reviewed = false, checked = false } = {}) => ({
  kind: { ...kindOf(review, gatePoints), ...(reviewed ? { reviewer: "review-architecture", reviewers: 1 } : {}), ...(checked ? { checks: [CHECK] } : {}) },
  params: {}, drafter: DRAFTER, reviewers: reviewed ? [REVIEWER] : [], parts: [], destinations: [],
  fits: true, notFitting: [], leftOut: [], blocking: [], limit: 5 });
const contextOf = (gates = []) => ({ kind: null, params: {}, product: { address: REPOSITORY.web, snapshot: null, host: null },
  instance: { snapshot: null, host: null }, connect: async () => null, participants: [DRAFTER, REVIEWER], places: { sources: {}, mailbox: null }, gates,
  person: "alice", now: new Date("2026-10-12T09:30:00Z"), agentM: START.agentM, jobId: START.id });

// The global fetch while a test runs: the drafter's endpoint (ep1) answers the drafts given in turn (the last again), or the status given, or a text that is no
// answer; the reviewer's endpoint (ep2) finds nothing; every request is kept.
let requests = [];
const realFetch = globalThis.fetch;
function endpointAnswers(status = 200, { drafts = [DRAFT], unreadable = false } = {}) {
  requests = [];
  const queue = [...drafts];
  const reply = (content) => new Response(JSON.stringify({ choices: [{ message: { content } }], usage: { prompt_tokens: 10, completion_tokens: 5 } }),
    { status: 200, headers: { "content-type": "application/json" } });
  globalThis.fetch = async (url) => {
    requests.push(String(url));
    if (status !== 200) return new Response(JSON.stringify({ error: { message: "refused" } }), { status });
    if (String(url).includes("ep2")) return reply(JSON.stringify({ draft: { findings: [] }, answers: [] }));
    if (unreadable) return reply("this is not JSON");
    return reply(JSON.stringify({ draft: queue.length > 1 ? queue.shift() : queue[0], answers: [] }));
  };
}
test.afterEach(() => { globalThis.fetch = realFetch; });

// A repository that holds the queued job: start and taking in one commit, as the tab's route does it.
async function queued(extra = {}) {
  const fake = fakeRepository();
  await queueJob(fake.host, { ...START, ...extra }, TAB, fake.head());
  return fake;
}
const hooksOf = (fake, record = { ...START, path: RECORD_PATH, run: null }) => ({ host: fake.host, record });
const run = (job, fake, { context = contextOf(), record } = {}) => runtimes.runOnTab(job, context, CONNECTIONS, hooksOf(fake, record));

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-010 step 2
// given: a repository whose default branch is `trunk` (not `main`), with no job workflow; a job's start on the tab's route
// input: queueJob(host, START, { kind: "tab" }, the head read)
// expect: one commit, on `trunk`, on the head that was read, holding the one file at the record's path: the start record as MOD-job-ledger's startRecord
//         gives it, with its `## Taken` — `by: tab`, at the job's start — in the same commit; the path and commit returned; no workflow is needed
test("queueJob — the tab's route commits the job's start and its taking in one commit", async () => {
  const fake = fakeRepository();
  const head = fake.head();
  const result = await queueJob(fake.host, START, TAB, head);
  assert.equal(fake.writes.length, 1, "one commit");
  const [change] = fake.writes;
  assert.deepEqual([change.branch, change.expectedHead, change.files.map((file) => file.path)], ["trunk", head, [RECORD_PATH]]);
  const { text } = startRecord(START);
  assert.ok(change.files[0].text.startsWith(text.replace(/\n+$/, "")), "the start record as startRecord gives it");
  assert.match(change.files[0].text, /\n## Taken\n\nat: 2026-10-12 09:30 UTC\nby: tab\n+$/, "with its taking");
  assert.deepEqual(result, { path: RECORD_PATH, commit: fake.head() });
  const record = await fake.record();
  assert.deepEqual([record.id, record.taken?.by], [START.id, "tab"]);
});

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a product whose default branch moved on since the head given was read
// input: queueJob on the tab's route with the stale head; known positive first — the head read now
// expect: the known positive is committed; the stale one is refused with the host's Moved, naming the new head, and nothing is written
test("queueJob — the tab's route refuses a moved head, with nothing written", async () => {
  const fake = fakeRepository();
  const stale = fake.head();
  await queueJob(fake.host, { ...START, id: "JOB-20261012-0929-aaaa" }, TAB, stale);
  assert.equal(fake.writes.length, 1, "known positive");
  await assert.rejects(queueJob(fake.host, START, TAB, stale), (error) => error.name === "Moved" && error.head === fake.head());
  assert.equal(fake.writes.length, 1, "nothing more written");
});

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; ONE DEFINITION, THREE DRIVERS; UC-019 step 6
// given: a queued job of a kind whose result a person reviews (`review: person`), attended; a drafter on an endpoint that answers a draft
// input: runOnTab(prepared, context, connections, { host, record })
// expect: the result for the page holds the draft, stopped because passed, and nothing written (the writer not called); the endpoint was called at its
//         own address; the record has its end — state done, `waits for a person` — and the round record, appended in one commit on the head that was read
test("runOnTab — an attended job whose result waits for a person returns its draft with nothing written", async () => {
  endpointAnswers();
  writerCalls = [];
  const fake = await queued({ id: "JOB-20261012-0945-beef" });
  const before = [fake.head(), fake.writes.length];
  const result = await run(jobOf("person"), fake, { record: { ...START, path: "docs/jobs/JOB-20261012-0945-beef.md", run: null } });
  assert.deepEqual([result.draft, result.stoppedBecause, result.written], [{ text: "the draft" }, "passed", null]);
  assert.deepEqual(writerCalls, []);
  assert.deepEqual(requests, ["https://ep1.example.test/v1/chat/completions"]);
  const end = (await fake.record()).end;
  assert.deepEqual([end.state, end.results], ["done", ["waits for a person"]]);
  assert.equal(end.rounds.length, 1, "the rounds are in the record");
  assert.equal(fake.writes.length, before[1] + 1, "the end is one commit");
  assert.equal(fake.writes.at(-1).expectedHead, before[0], "on the head that was read");
});

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; THE ROUNDS ARE COUNTED AND SHOWN
// given: the same job of a kind with `review: none`; a writer that committed `c0ffee` and changed one file
// input: runOnTab
// expect: the writer called once, with the draft, at once; the result's `written` its outcome; the end — done — lists `commit c0ffee` and the file;
//         and the pull request; the end holds the usage the endpoint reported (10 and 5 tokens), and the round record under `## Rounds`
test("runOnTab — a kind of review none is written at once, and its end lists the commit and the usage", async () => {
  endpointAnswers();
  writerCalls = [];
  outcome = { commits: ["c0ffee"], files: ["docs/use-cases/UC-001-x.md"], pullRequest: "https://github.com/alice/product/pull/7", shown: null, notes: [] };
  const fake = await queued();
  const result = await run(jobOf("none"), fake);
  assert.deepEqual(writerCalls, [DRAFT]);
  assert.deepEqual(result.written, outcome);
  const end = (await fake.record()).end;
  assert.deepEqual([end.state, end.results], ["done", ["commit c0ffee", "file docs/use-cases/UC-001-x.md", "pull request https://github.com/alice/product/pull/7"]]);
  assert.deepEqual([end.usage.inputTokens, end.usage.outputTokens], [10, 5]);
  assert.match(fake.text(), /\n## Rounds\n/);
});

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-007 4a
// given: a job of review none whose writer changed the draft while writing and committed, with two notes; and one whose every file already stood, so it
//        committed nothing and has no note
// input: runOnTab of each
// expect: the first end lists the commit and, one line each in their order, `note: <note>`, and not `no change`; the second end lists exactly `no change`
test("runOnTab — the writer's notes are listed in the end, and a writer that committed nothing ends with no change", async () => {
  endpointAnswers();
  outcome = { commits: ["c0ffee"], files: [], pullRequest: null, shown: null, notes: ["removed the realised name EXPORT", "changed the class of UC-002"] };
  let fake = await queued();
  await run(jobOf("none"), fake);
  assert.deepEqual((await fake.record()).end.results, ["commit c0ffee", "note: removed the realised name EXPORT", "note: changed the class of UC-002"]);
  outcome = { commits: [], files: [], pullRequest: null, shown: null, notes: [] };
  fake = await queued();
  await run(jobOf("none"), fake);
  assert.deepEqual((await fake.record()).end.results, ["no change"]);
});

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-011 step 5
// given: a queued job of `review: person` whose record names a run; known positive first — the same job whose record names none
// input: runOnTab of each
// expect: attended unless the record names a run: the first (no run) is attended, its writer not called; the second is written at once, the writer
//         called with the draft, and its end — the kind hands its draft back (`written.shown`) — holds that draft as `draft:` and `waits for a person`
test("runOnTab — attended unless its record names a run", async () => {
  endpointAnswers();
  outcome = { commits: [], files: [], pullRequest: null, shown: DRAFT, notes: [] };
  writerCalls = [];
  await run(jobOf("person"), await queued());
  assert.deepEqual(writerCalls, [], "known positive: attended, nothing written");
  const fake = await queued({ run: "JOB-20261012-0900-run1" });
  await run(jobOf("person"), fake, { record: { ...START, path: RECORD_PATH, run: "JOB-20261012-0900-run1" } });
  assert.deepEqual(writerCalls, [DRAFT]);
  const end = (await fake.record()).end;
  assert.deepEqual([end.draft, end.results], [DRAFT, ["waits for a person"]]);
});

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a queued job whose endpoint refuses the key (401); known positive first — the same job against an endpoint that answers
// input: runOnTab
// expect: rejected with the driver's own failure, by its name `EndpointFailed`, unchanged; the record has its end — state failed, `reason:` naming
//         `EndpointFailed` and the endpoint's message —, appended once; the writer not called
test("runOnTab — a failing driver ends the job by name, with the end appended", async () => {
  writerCalls = [];
  endpointAnswers();
  await run(jobOf("person"), await queued());
  endpointAnswers(401);
  const fake = await queued();
  await assert.rejects(run(jobOf("none"), fake), (error) => error.name === "EndpointFailed" && error.diagnosis.reason === "key refused");
  const end = (await fake.record()).end;
  assert.equal(end.state, "failed");
  assert.match(end.reason, /^EndpointFailed: .*refused/);
  assert.deepEqual(writerCalls, []);
});

// guards: A JOB STOPS AT EVERY GATE; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a queued job of a kind with the gate point before-write, whose gate in the context is not passed
// input: runOnTab
// expect: the result stopped at the gate, its writer not called; the record gains a `Gate reached` naming the gate and its decider, and no End —
//         the job waits at the gate
test("runOnTab — a gate reached is appended to the record and the job has no end", async () => {
  endpointAnswers();
  writerCalls = [];
  const fake = await queued();
  const result = await run(jobOf("none", ["before-write"]), fake,
    { context: contextOf([{ name: "Development → Review", point: "before-write", passed: false, decider: "the product owner" }]) });
  assert.deepEqual([result.stoppedBecause, result.gate, writerCalls], ["gate", "Development → Review", []]);
  const record = await fake.record();
  assert.deepEqual(record.gates.map((gate) => [gate.gate, gate.decider]), [["Development → Review", "the product owner"]]);
  assert.equal(record.end, null);
});

// guards: A RUNTIME IS INTERCHANGEABLE; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: a drafter whose endpoint is configured with a Bridge to call it that the connections do not hold, an agent's route to a Bridge they do not hold, and one with no configuration at all
// input: runOnTab of each
// expect: both refused before any request, by name — `BridgeNotConnected` for a Bridge among no `connections.bridges` (ITM-325 builds the Bridge's driver; tests/runtimes-bridge.test.mjs), and `EndpointNotConfigured` naming
//         the endpoint — and the record ended failed
test("runOnTab — a Bridge that is not connected, and an endpoint without a configuration, are refused by name", async () => {
  endpointAnswers();
  const attempts = [
    [{ endpoints: { ep1: { config: ENDPOINT("ep1"), bridge: "lab-pc" } }, bridges: {} }, "BridgeNotConnected"],
    [{ endpoints: {}, bridges: {} }, "EndpointNotConfigured"],
  ];
  const agent = { ...jobOf("none"), drafter: { ...DRAFTER, route: "bridge lab-pc agent claude" } };
  for (const [connections, name] of attempts) {
    const fake = await queued();
    await assert.rejects(runtimes.runOnTab(jobOf("none"), contextOf(), connections, hooksOf(fake)), (error) => error.name === name, name);
    assert.deepEqual(requests, []);
    assert.equal((await fake.record()).end.state, "failed");
  }
  const fake = await queued();
  await assert.rejects(runtimes.runOnTab(agent, contextOf(), CONNECTIONS, hooksOf(fake)), (error) => error.name === "BridgeNotConnected" && error.bridge === "lab-pc");
  assert.deepEqual(requests, []);
});

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; THE ROUNDS ARE COUNTED AND SHOWN
// given: a queued job with a check that finds the first draft wanting, and a reviewer on a second endpoint; the drafter answers "first", then "second"
// input: runOnTab
// expect: in each of the two rounds the drafter's endpoint called, then the reviewer's, each at its own address; two rounds in the record; the end's usage
//         the sum of all four exchanges (40 and 20 tokens)
test("runOnTab — the drafter and the reviewer each call their own endpoint, and the end sums every exchange's usage", async () => {
  endpointAnswers(200, { drafts: [{ text: "first" }, { text: "second" }] });
  const fake = await queued();
  const result = await run(jobOf("person", [], { reviewed: true, checked: true }), fake);
  const [ep1, ep2] = ["ep1", "ep2"].map((name) => `https://${name}.example.test/v1/chat/completions`);
  assert.deepEqual(requests, [ep1, ep2, ep1, ep2]);
  assert.deepEqual([result.draft, result.rounds.length], [{ text: "second" }, 2]);
  const end = (await fake.record()).end;
  assert.deepEqual([end.usage.inputTokens, end.usage.outputTokens, end.rounds.length], [40, 20, 2]);
});

// guards: A CANCELLED JOB WRITES NOTHING MORE; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a queued job and a signal aborted before it runs; known positive first — the same job without the signal
// input: runOnTab with the signal in the hooks
// expect: rejected as Cancelled, the endpoint not called; the record gets no end here — cancelJob ends a cancelled job
test("runOnTab — a cancelled job is refused as Cancelled and its record is left to cancelJob", async () => {
  endpointAnswers();
  await run(jobOf("person"), await queued());
  assert.ok(requests.length > 0, "known positive: the job calls its endpoint");
  endpointAnswers();
  const fake = await queued();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(runtimes.runOnTab(jobOf("none"), contextOf(), CONNECTIONS, { ...hooksOf(fake), signal: controller.signal }), (error) => error.name === "Cancelled");
  assert.deepEqual(requests, []);
  assert.equal((await fake.record()).end, null);
});

// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; THE ROUNDS ARE COUNTED AND SHOWN
// given: a queued job whose endpoint answers a text that is no answer, in every round
// input: runOnTab
// expect: the result unusable, returned, not thrown; the end — state failed, `reason:` saying the answer could not be read — with its rounds
test("runOnTab — an answer that cannot be read ends the job as failed, with its rounds", async () => {
  endpointAnswers(200, { unreadable: true });
  const fake = await queued();
  const result = await run(jobOf("person"), fake);
  assert.equal(result.stoppedBecause, "unusable");
  const end = (await fake.record()).end;
  assert.deepEqual([end.state, end.results], ["failed", []]);
  assert.match(end.reason, /could not be read/);
  assert.ok(end.rounds.length >= 1);
});
