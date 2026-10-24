// A job handed over to a Bridge, and an agent on a Bridge as a driver (ITM-325) — MOD-runtimes' Bridge route, as the accepted text of docs/architecture/MOD-runtimes.md states it:
// `queueJob` ("commits the job's start record, on the head that was read, as the person's commit ... a Bridge takes the job when it next reads the repository, or at once when `bridge`
// is given and the job is handed over to it ... fails with what the Bridge client names"), `bridgeDriver(bridge, target, participant)` ("a driver whose `send` hands the input to the named
// agent on the Bridge, or to the endpoint the Bridge calls, through Access's `ask` ... and returns its answer and the usage reported. Fails with what the Bridge client names"), and `runOnTab`
// ("an endpoint's driver ... `bridgeDriver` with the endpoint on the Bridge its `bridge` names, and an agent on a Bridge through `bridgeDriver`, each Bridge by its name among `bridges`").
// For UC-011 steps 2 and 2a. A job of a run, resuming, live state, log, cancel and retry, and jobs run on a Bridge with a reviewer, are not part of it.
// Run: node --test tests/runtimes-bridge.test.mjs
//
// Module: MOD-runtimes
// Guards: UC-011; A RUNTIME IS INTERCHANGEABLE; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; A REMOTE INTERFACE NAMES HOW IT FAILS
// Level: unit
//
// The repository is a fake host in memory (default branch `trunk`); the Bridge is a fixture standing behind the global `fetch`, which a test replaces and restores, and the Bridge client is the
// real one (MOD-bridge-client), so that its errors are the ones it names: the fixture speaks the Bridge's API as MOD-bridge-http's table gives it (`POST /v1/jobs`, `POST /v1/ask`, `GET /v1/ask/{ask}`,
// the token in the header `bridgeApi.tokenHeader` names). Nothing reaches the network. The module file leaves open: the Bridge handle `queueJob` is given is its fifth parameter; `product` of the hand-over is the
// web address of the repository the head was read from (the product's address); the input of `ask` is the driver input's `prompt` (the parts are in it already); a hand-over that fails after the
// commit is thrown as the client's own error, to which `queued` — `{ path, commit }` — is added; a Bridge the participant's route names but `connections.bridges` lacks is `BridgeNotConnected { bridge }`.
// The abort signal is not passed on: `ask` takes none. Each test states its input and its expected result before it runs (given / input / expect); where a test asserts a refusal or an absence, the
// same call is first shown to succeed. A name the module does not provide yet is undefined here, so that each test fails by itself. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { bridgeApi } from "../src/bridge-http/index.mjs";
import { bridgeAt } from "../src/bridge-client/index.mjs";
import { recordsNewestFirst, startRecord } from "../src/job-ledger/index.mjs";
import { formatFinding } from "../src/text-tools/index.mjs";

const { queueJob } = runtimes;
const REPOSITORY = { server: "github", origin: "https://github.com", path: "alice/product", web: "https://github.com/alice/product" };
const BRIDGE_ADDRESS = "http://127.0.0.1:4712", OTHER_ADDRESS = "http://127.0.0.1:4713";
const bridgeNamed = (name, address = BRIDGE_ADDRESS) => bridgeAt({ name, address, token: `token-${name}` });
const START = {
  id: "JOB-20261013-0930-abcd", kind: "fixture-writer", worksOn: ["ITM-325"], participant: "claude-lab", model: "agent", route: "bridge lab-pc",
  run: null, retries: null, startedBy: "alice", start: new Date("2026-10-13T09:30:00Z"), agentM: { version: "unreleased", commit: "a".repeat(40) },
  inputs: ["SPEC.md@deadbeef"], limit: 5, destinations: [{ participant: "claude-lab", place: "this machine", parts: ["the draft"] }], params: {},
};
const RECORD_PATH = `docs/jobs/${START.id}.md`;
const BRIDGE_ROUTE = { kind: "bridge", bridge: "lab-pc" };

// ---------------------------------------------------------------- the fake repository

function fakeRepository() {
  const tree = new Map(), writes = [];
  let head = "c0", made = 0;
  const snapshot = () => ({ repository: REPOSITORY, ref: "trunk", commit: head, paths: [...tree.keys()].sort(), read: async (path) => tree.get(path) ?? null, blob: () => null });
  return {
    writes, tree, head: () => head, moveOn: () => { head = `moved${++made}`; },
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
  };
}

// ---------------------------------------------------------------- the Bridge behind fetch

// What the Bridges answer: every request is kept with the commits made so far; `refuse` sets a refusal for POST /v1/jobs; `running` is the number of polls of an ask that answer `running`.
let requests = [], refuse = null, running = 0, failAsk = false, fake = null;
const realFetch = globalThis.fetch;
function bridgesAnswer() {
  requests = []; refuse = null; running = 0; failAsk = false;
  let polls = 0;
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
  globalThis.fetch = async (url, init) => {
    const where = new URL(String(url));
    const body = init.body ? JSON.parse(init.body) : null;
    requests.push({ origin: where.origin, method: init.method, path: where.pathname, token: init.headers[bridgeApi.tokenHeader], body, writes: fake ? fake.writes.length : null });
    if (init.method === "POST" && where.pathname === "/v1/jobs") {
      if (refuse === "gone") throw new TypeError("fetch failed");
      if (refuse === "token") return json(401, { error: "token-refused", message: "no" });
      if (refuse === "paused") return json(503, { error: "paused", message: "Bridge is paused." });
      return json(200, { accepted: START.id });
    }
    if (init.method === "POST" && where.pathname === "/v1/ask") return json(200, { ask: "ask-1" });
    if (where.pathname === "/v1/ask/ask-1") {
      if (failAsk) return json(200, { state: "failed", text: null, usage: null, error: "the agent ended with an error" });
      if (polls++ < running) return json(200, { state: "running", text: null, usage: null, error: null });
      return json(200, { state: "done", text: JSON.stringify({ draft: { text: "from the Bridge" }, answers: [] }), usage: { inputTokens: 12, outputTokens: 7, minutes: null, cost: null }, error: null });
    }
    return json(404, { error: "not-found", message: "no" });
  };
}
test.afterEach(() => { globalThis.fetch = realFetch; fake = null; });

// TST-472695 · level: unit · module: MOD-runtimes
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-011
// given: a repository whose default branch is `trunk`; a job's start on a Bridge's route; the Bridge `lab-pc`
// input: queueJob(host, START, { kind: "bridge", bridge: "lab-pc" }, head, bridge); and, as a known positive of the absence, the same without a Bridge handle
// expect: one commit, on `trunk`, on the head read, of the start record alone — as startRecord gives it, with no `## Taken`: the Bridge takes the job —, made before the hand-over request; then one request, POST /v1/jobs to the Bridge, with its token, naming the product's address, the record's path and that commit; the path and commit returned; without a handle, the commit alone and no request
test("queueJob — the Bridge route commits the start, then hands the job over to the named Bridge with its path and commit", async () => {
  assert.equal(typeof queueJob, "function");
  bridgesAnswer();
  fake = fakeRepository();
  const head = fake.head();
  const result = await queueJob(fake.host, START, BRIDGE_ROUTE, head, bridgeNamed("lab-pc"));
  const [change] = fake.writes;
  assert.deepEqual([fake.writes.length, change.branch, change.expectedHead, change.files.map((file) => file.path)], [1, "trunk", head, [RECORD_PATH]]);
  assert.equal(change.files[0].text, startRecord(START).text);
  assert.ok(!change.files[0].text.includes("## Taken"));
  assert.deepEqual(result, { path: RECORD_PATH, commit: fake.head() });
  assert.deepEqual(requests.map((each) => [each.method, each.path, each.origin, each.token, each.writes]), [["POST", "/v1/jobs", BRIDGE_ADDRESS, "token-lab-pc", 1]]);
  assert.deepEqual(requests[0].body, { product: REPOSITORY.web, record: RECORD_PATH, commit: fake.head() });
  bridgesAnswer();
  fake = fakeRepository();
  await queueJob(fake.host, START, BRIDGE_ROUTE, fake.head());
  assert.deepEqual([fake.writes.length, requests.length], [1, 0], "without a handle the commit stands alone, for the Bridge to take when it next reads the repository");
});

// TST-472696 · level: unit · module: MOD-runtimes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-011
// given: a Bridge that gives no answer, one that refuses the token, and one that is paused; known positive first — a Bridge that accepts
// input: queueJob on the Bridge route with each
// expect: the Bridge client's own error by name — NoAnswer, TokenRefused, BridgeFailed with `paused` — thrown after the commit; the start stays committed (one commit, a record without `## Taken`, which the Bridge takes when it next reads the repository), and the error carries what was queued, `{ path, commit }`
test("queueJob — a hand-over refused after the commit is reported by name, the start left committed", async () => {
  bridgesAnswer();
  fake = fakeRepository();
  await queueJob(fake.host, START, BRIDGE_ROUTE, fake.head(), bridgeNamed("lab-pc"));
  for (const [how, name, check] of [["gone", "NoAnswer", () => true], ["token", "TokenRefused", () => true], ["paused", "BridgeFailed", (error) => error.error === "paused"]]) {
    bridgesAnswer();
    refuse = how;
    fake = fakeRepository();
    await assert.rejects(queueJob(fake.host, START, BRIDGE_ROUTE, fake.head(), bridgeNamed("lab-pc")),
      (error) => error.name === name && check(error) && error.queued?.path === RECORD_PATH && error.queued?.commit === fake.head(), how);
    assert.equal(fake.writes.length, 1, `${how}: the start stays committed`);
    const record = await fake.record();
    assert.deepEqual([record.id, record.taken], [START.id, null], `${how}: queued, not taken`);
  }
});

// TST-472697 · level: unit · module: MOD-runtimes
// guards: A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a product whose default branch moved on since the head was read
// input: queueJob on the Bridge route with the stale head
// expect: the host's Moved, naming the new head; nothing committed and nothing handed over
test("queueJob — the Bridge route refuses a moved head, with nothing written and nothing handed over", async () => {
  bridgesAnswer();
  fake = fakeRepository();
  const stale = fake.head();
  fake.moveOn();
  await assert.rejects(queueJob(fake.host, START, BRIDGE_ROUTE, stale, bridgeNamed("lab-pc")), (error) => error.name === "Moved" && error.head === fake.head());
  assert.deepEqual([fake.writes.length, requests.length], [0, 0]);
});

const PARTICIPANT = { name: "claude-lab", type: "CLI agent", model: "agent", context: 200000, price: null, capabilities: ["draft text"], place: "this machine", route: "bridge lab-pc agent claude" };
const INPUT = { prompt: "Write the draft.", parts: [], output: null, findings: [], previous: null, workdir: null };

const CONTEXT_PART = { name: "source", text: "BRIDGE_RECIPE_CONTEXT", size: 0, sources: [], required: true, recipe: "fixture", artifacts: [] };
const CONTEXT_INPUT = { ...INPUT, prompt: `Write the correction.\n\n### source\n\n${CONTEXT_PART.text}`, parts: [CONTEXT_PART] };
const CURRENT_DRAFT = JSON.stringify({ text: "BRIDGE_CURRENT_DRAFT" }, null, 2);
const CONTEXT_FINDINGS = [
  { artifact: "UC-019", line: 7, kind: "error", rule: "A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT", what: "BRIDGE_MISSING_CHECK", fix: "include the check" },
  { artifact: "SPEC", line: 8, kind: "warning", rule: "ONE STATEMENT PER REQUIREMENT", what: "BRIDGE_TWO_STATEMENTS", fix: "split or justify the rule" },
];
const occurrences = (text, value) => text.split(value).length - 1;

async function contextAsks(t, extra, verify) {
  const config = { name: "fixture", kind: "openai-compatible", baseUrl: "https://fixture.example.test/v1", model: "fixture-model", key: null };
  for (const target of [{ agent: "claude" }, { endpoint: config }]) {
    const name = Object.keys(target)[0];
    await t.test(name, async () => {
      bridgesAnswer();
      const actualDriver = runtimes.bridgeDriver(bridgeNamed("lab-pc"), target, PARTICIPANT);
      const send = async (input, expectedCalls) => {
        assert.equal(JSON.parse((await actualDriver.send(input)).text).draft.text, "from the Bridge");
        const asks = requests.filter((request) => request.method === "POST" && request.path === "/v1/ask");
        assert.equal(asks.length, expectedCalls, "one send makes one Bridge ask");
        assert.equal(requests.length, expectedCalls * 2, "each ask has one completion poll");
        const request = asks.at(-1);
        assert.equal(request.origin, BRIDGE_ADDRESS);
        assert.equal(request.token, "token-lab-pc");
        assert.deepEqual(request.body[name], target[name]);
        assert.deepEqual(Object.keys(request.body).sort(), [name, "input"].sort(), "the existing Bridge wire contract is unchanged");
        const text = request.body.input;
        assert.equal(occurrences(text, CONTEXT_INPUT.prompt), 1, "ordinary prompt reaches the Bridge once");
        assert.equal(occurrences(text, CONTEXT_PART.text), 1, "recipe parts already in prompt are not added again");
        return text;
      };
      assert.equal(await send(CONTEXT_INPUT, 1), CONTEXT_INPUT.prompt, "known positive: ordinary DriverInput is unchanged");
      if (extra !== null) verify(await send({ ...CONTEXT_INPUT, ...extra }, 2), name);
    });
  }
}

// TST-398020
// level: unit
// module: MOD-runtimes
// guards: ONE DEFINITION, THREE DRIVERS; A RUNTIME IS INTERCHANGEABLE; UC-019
// given: a constructed Bridge response through the real Bridge client, for both agent and endpoint targets
// input: bridgeDriver sends ordinary DriverInput whose prompt already holds its recipe part
// expect: each target receives one ask carrying the exact prompt and its part once in the existing wire contract
test("TST-398020: Bridge targets receive ordinary DriverInput exactly once", async (t) => {
  await contextAsks(t, null);
});

// TST-398021
// level: unit
// module: MOD-runtimes
// guards: UC-019; A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
// given: both Bridge target kinds after a known-positive ordinary exchange
// input: bridgeDriver sends a second DriverInput with the current draft in previous and no findings
// expect: one additional ask contains the entire current draft once without duplicating prompt parts
test("TST-398021: Bridge targets receive previous current draft exactly once", async (t) => {
  await contextAsks(t, { previous: CURRENT_DRAFT }, (text, name) => {
    assert.equal(occurrences(text, CURRENT_DRAFT), 1, `Bridge ${name} receives the complete previous current draft once`);
  });
});

// TST-398022
// level: unit
// module: MOD-runtimes
// guards: A DRAFT THAT FAILS A CHECK GOES BACK TO ITS PARTICIPANT; A FINDING READS LIKE A COMPILER MESSAGE
// given: both Bridge target kinds after a known-positive ordinary exchange
// input: bridgeDriver sends a previous draft with one error and one warning
// expect: each complete canonical formatFinding line and the complete draft occur exactly once in one additional ask
test("TST-398022: Bridge targets receive canonical correction findings exactly once", async (t) => {
  await contextAsks(t, { previous: CURRENT_DRAFT, findings: CONTEXT_FINDINGS }, (text, name) => {
    for (const finding of CONTEXT_FINDINGS) assert.equal(occurrences(text, formatFinding(finding)), 1, `Bridge ${name} receives canonical ${finding.kind} once`);
    assert.equal(occurrences(text, CURRENT_DRAFT), 1, "the findings travel with the draft they concern");
  });
});

// TST-472698 · level: unit · module: MOD-runtimes
// guards: A RUNTIME IS INTERCHANGEABLE; UC-011
// given: an agent `claude` on the Bridge, whose ask answers `running` twice and then `done` with a text and the usage its runtime reported; and a model endpoint the Bridge calls
// input: bridgeDriver(bridge, { agent: "claude" }, participant).send(input); bridgeDriver(bridge, { endpoint: config }, participant).send(input)
// expect: the driver's participant the one given; the agent's text and usage returned as the Bridge gave them; the requests POST /v1/ask with { agent: "claude", input: <the prompt> }, then GET /v1/ask/ask-1 until done, all with the token; for the endpoint POST /v1/ask with { endpoint: <the configuration>, input: <the prompt> } and the answer returned
test("bridgeDriver — hands the input to the named agent or to the endpoint the Bridge calls, and returns the answer and usage", async () => {
  assert.equal(typeof runtimes.bridgeDriver, "function");
  bridgesAnswer();
  running = 2;
  const bridge = bridgeNamed("lab-pc");
  const driver = runtimes.bridgeDriver(bridge, { agent: "claude" }, PARTICIPANT);
  assert.equal(driver.participant, PARTICIPANT);
  const sent = await driver.send(INPUT);
  assert.deepEqual(sent, { text: JSON.stringify({ draft: { text: "from the Bridge" }, answers: [] }), usage: { inputTokens: 12, outputTokens: 7, minutes: null, cost: null } });
  assert.deepEqual(requests.map((each) => [each.method, each.path, each.token]), [["POST", "/v1/ask", "token-lab-pc"], ["GET", "/v1/ask/ask-1", "token-lab-pc"], ["GET", "/v1/ask/ask-1", "token-lab-pc"], ["GET", "/v1/ask/ask-1", "token-lab-pc"]]);
  assert.deepEqual(requests[0].body, { agent: "claude", input: "Write the draft." });
  bridgesAnswer();
  const config = { name: "ep1", kind: "openai-compatible", baseUrl: "https://ep1.example.test/v1", model: "m", key: "secret-key" };
  const answer = await runtimes.bridgeDriver(bridge, { endpoint: config }, { ...PARTICIPANT, route: "endpoint ep1" }).send(INPUT);
  assert.equal(JSON.parse(answer.text).draft.text, "from the Bridge");
  assert.deepEqual(requests[0].body, { endpoint: config, input: "Write the draft." });
});

// TST-472699 · level: unit · module: MOD-runtimes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS
// given: known positive first — a Bridge that answers; then a Bridge that gives no answer, one that refuses the token, one that is paused, and an agent whose ask ends `failed`
// input: bridgeDriver(...).send(input) with each
// expect: the Bridge client's own error by name, unchanged: NoAnswer, TokenRefused, BridgeFailed with `paused`, AskFailed with the agent's message
test("bridgeDriver — fails with the Bridge client's error by name", async () => {
  bridgesAnswer();
  const driver = () => runtimes.bridgeDriver(bridgeNamed("lab-pc"), { agent: "claude" }, PARTICIPANT);
  assert.ok((await driver().send(INPUT)).text, "known positive");
  for (const [how, name, check] of [["gone", "NoAnswer", () => true], ["token", "TokenRefused", () => true], ["paused", "BridgeFailed", (error) => error.error === "paused"]]) {
    bridgesAnswer();
    globalThis.fetch = ((inner) => async (url, init) => {
      if (init.method === "POST" && new URL(String(url)).pathname === "/v1/ask") {
        if (how === "gone") throw new TypeError("fetch failed");
        return new Response(JSON.stringify(how === "token" ? { error: "token-refused", message: "no" } : { error: "paused", message: "Bridge is paused." }), { status: how === "token" ? 401 : 503 });
      }
      return inner(url, init);
    })(globalThis.fetch);
    await assert.rejects(driver().send(INPUT), (error) => error.name === name && check(error), how);
  }
  bridgesAnswer();
  failAsk = true;
  await assert.rejects(driver().send(INPUT), (error) => error.name === "AskFailed" && /agent ended with an error/.test(error.message));
});

// ---------------------------------------------------------------- runOnTab

const CONFIG = { name: "ep1", kind: "openai-compatible", baseUrl: "https://ep1.example.test/v1", model: "m", key: null };
async function job(participant) {
  return { kind: { name: "fixture-writer", serves: [], participant: "one", needs: ["draft text"], resources: "none", preconditions: [], recipes: [], checks: [], personDecides: [], reviewer: null,
    reviewers: 0, steps: [], gatePoints: [], review: "person", writer: "return-draft", limit: 5, purpose: "Writes, for a test.", prompt: "Write.",
    answer: { type: "object", required: ["text"], properties: { text: { type: "string" } } } },
  params: {}, drafter: participant, reviewers: [], parts: [], destinations: [], fits: true, notFitting: [], leftOut: [], blocking: [], limit: 5 };
}
const contextOf = (participant) => ({ kind: null, params: {}, product: { address: REPOSITORY.web, snapshot: null, host: null }, instance: { snapshot: null, host: null }, connect: async () => null,
  participants: [participant], places: { sources: {}, mailbox: null }, gates: [], person: "alice", now: new Date("2026-10-13T09:30:00Z"), agentM: START.agentM, jobId: START.id });
async function queuedFor() {
  fake = fakeRepository();
  await queueJob(fake.host, START, BRIDGE_ROUTE, fake.head());
  return fake;
}

// TST-472700 · level: unit · module: MOD-runtimes
// guards: A RUNTIME IS INTERCHANGEABLE; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY; UC-011
// given: two Bridges among `connections.bridges`, `lab-pc` and `office`, at different addresses; a drafter that is an agent on `office`; then a drafter that is a model endpoint whose configuration names `lab-pc`
// input: runOnTab for each, with the record of a queued job
// expect: the agent's exchange goes to `office` alone, as { agent } with the prompt, with `office`'s token; the endpoint's to `lab-pc` alone, as { endpoint: <the configuration> }; each result holds the draft the Bridge returned, and the record ends done with the usage the Bridge reported; no request reaches the model endpoint's own address
test("runOnTab — the Bridge a participant's route names is chosen by its name among connections.bridges", async () => {
  const bridges = { "lab-pc": bridgeNamed("lab-pc"), office: bridgeNamed("office", OTHER_ADDRESS) };
  const agent = { ...PARTICIPANT, route: "bridge office agent claude" };
  bridgesAnswer();
  let repository = await queuedFor();
  let result = await runtimes.runOnTab(await job(agent), contextOf(agent), { endpoints: {}, bridges }, { host: repository.host, record: { ...START, path: RECORD_PATH, run: null } });
  assert.deepEqual(result.draft, { text: "from the Bridge" });
  assert.deepEqual([...new Set(requests.map((each) => each.origin))], [OTHER_ADDRESS]);
  assert.equal(requests[0].token, "token-office");
  assert.deepEqual([Object.keys(requests[0].body).sort(), requests[0].body.agent], [["agent", "input"], "claude"]);
  assert.ok(requests[0].body.input.startsWith("Write.\n\n## The form of your answer\n"), "the prepared prompt, then the form of the answer");
  let end = (await repository.record()).end;
  assert.deepEqual([end.state, end.usage.inputTokens, end.usage.outputTokens], ["done", 12, 7]);

  const endpoint = { ...PARTICIPANT, name: "drafter-a", model: "m", route: "endpoint ep1" };
  bridgesAnswer();
  repository = await queuedFor();
  result = await runtimes.runOnTab(await job(endpoint), contextOf(endpoint), { endpoints: { ep1: { config: CONFIG, bridge: "lab-pc" } }, bridges }, { host: repository.host, record: { ...START, path: RECORD_PATH, run: null } });
  assert.deepEqual(result.draft, { text: "from the Bridge" });
  assert.deepEqual([...new Set(requests.map((each) => each.origin))], [BRIDGE_ADDRESS]);
  assert.deepEqual([Object.keys(requests[0].body).sort(), requests[0].body.endpoint], [["endpoint", "input"], CONFIG]);
  assert.ok(requests[0].body.input.startsWith("Write.\n\n## The form of your answer\n"), "the prepared prompt, then the form of the answer");
  assert.ok(!requests.some((each) => each.origin.includes("example.test")), "the model endpoint is called by the Bridge, not by the page");
  end = (await repository.record()).end;
  assert.equal(end.state, "done");
});

// TST-472701 · level: unit · module: MOD-runtimes
// guards: A REMOTE INTERFACE NAMES HOW IT FAILS; A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
// given: a drafter that is an agent on a Bridge `lab-pc`; `connections.bridges` that holds only `office`; and one that holds `lab-pc`, which gives no answer
// input: runOnTab for each
// expect: the first refused before any request as BridgeNotConnected naming `lab-pc`, the record ended failed; the second thrown as the Bridge client's NoAnswer, the record ended failed with it as the reason
test("runOnTab — a Bridge that is not connected is refused by name, and a Bridge that gives no answer ends the job as failed", async () => {
  const agent = { ...PARTICIPANT, route: "bridge lab-pc agent claude" };
  bridgesAnswer();
  let repository = await queuedFor();
  await assert.rejects(runtimes.runOnTab(await job(agent), contextOf(agent), { endpoints: {}, bridges: { office: bridgeNamed("office") } },
    { host: repository.host, record: { ...START, path: RECORD_PATH, run: null } }), (error) => error.name === "BridgeNotConnected" && error.bridge === "lab-pc");
  assert.deepEqual(requests, []);
  assert.equal((await repository.record()).end.state, "failed");
  bridgesAnswer();
  globalThis.fetch = async () => { throw new TypeError("fetch failed"); };
  repository = await queuedFor();
  await assert.rejects(runtimes.runOnTab(await job(agent), contextOf(agent), { endpoints: {}, bridges: { "lab-pc": bridgeNamed("lab-pc") } },
    { host: repository.host, record: { ...START, path: RECORD_PATH, run: null } }), (error) => error.name === "NoAnswer");
  const end = (await repository.record()).end;
  assert.equal(end.state, "failed");
  assert.match(end.reason, /^NoAnswer: /);
});
