// The tool loop of an endpoint a Bridge calls runs in the tab (ITM-497) — MOD-runtimes' `bridgeDriver` and `runOnTab`, as the accepted text of docs/architecture/MOD-runtimes.md states them:
// `bridgeDriver`: "for an endpoint given `tools`, the loop of MOD-endpoint-calls runs here in the tab, each of its requests one `ask` of one exchange (`endpointExchange`), and each tool call carried out here";
// `runOnTab`: "Only the driver of an endpoint the tab calls itself is given the kind's tools ... — called directly, or through the Bridge its configuration names, where `bridgeDriver` carries each request of the loop as one `ask`."
// For UC-049 step 4. Run: node --test tests/runtimes-bridge-tool-loop.test.mjs
//
// Module: MOD-runtimes
// Guards: ONE DEFINITION, THREE DRIVERS; A RUNTIME IS INTERCHANGEABLE; A PARTICIPANT DECLARES ITS CAPABILITIES; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// Level: component
//
// The readings, each from the sentence that gives it.
// (1) "for an endpoint given `tools`" is an input that carries `tools` with definitions (MOD-endpoint-calls: "Where the input carries `tools`"). An input without them, and a target that is an agent, is today's single `ask`
//     with the prompt: `{ endpoint, input }` and `{ agent, input }`.
// (2) "one `ask` of one exchange" is `ask(bridge, { endpoint, exchange })`, whose POST body is exactly `{ endpoint, exchange: { messages, tools } }` (bridgeApi's third request form; tests/bridge-client-324.test.mjs, TST-324003).
// (3) "each tool call carried out here" is that the result the Bridge's endpoint is given for a call is what the kind's tool answers from the product's snapshot in the tab, as tests/runtimes-tab-endpoint-tools.test.mjs follows.
// The Bridge is a fixture behind the global `fetch`, which a test replaces and restores; the Bridge client is the real one. Nothing reaches the network, and the fetch spy is the fixture itself: a request to any
// origin other than the Bridge's fails the test. Each test states its input and expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { bridgeAt } from "../src/bridge-client/index.mjs";
import { bridgeApi } from "../src/bridge-http/index.mjs";

const PRODUCT = "https://github.com/alice/product";
const BRIDGE_ORIGIN = "http://127.0.0.1:4712";
const BRIDGE = bridgeAt({ name: "lab-pc", address: BRIDGE_ORIGIN, token: "token-lab-pc" });
const CONFIG = { name: "ep1", kind: "openai-compatible", baseUrl: "https://ep1.example.test/v1", model: "m", key: "key-497" };
const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text", "read the repository", "use tools"], place: "this machine", route: "endpoint ep1" };
const connections = { endpoints: { ep1: { config: CONFIG, bridge: "lab-pc" } }, bridges: { "lab-pc": BRIDGE } };

const FILES = { "README.md": "# Product\n", "docs/a.md": "alpha\nneedle in a\nomega", "docs/sub/b.md": "beta\n\nno match" };
const snapshot = { repository: { path: "alice/product" }, ref: "main", commit: "c".repeat(40), paths: Object.keys(FILES),
  async read(path) { return path in FILES ? FILES[path] : null; }, blob: () => null };
function untouchable(touched, name) { return new Proxy({}, { get(target, property) { touched.push(`${name}.${String(property)}`); return undefined; } }); }
function contextOf(touched) {
  return { kind: null, params: {}, product: { address: PRODUCT, snapshot, host: untouchable(touched, "product.host") },
    instance: { snapshot: null, host: untouchable(touched, "instance.host") }, connect: async () => { touched.push("connect"); return null; },
    participants: [], places: { sources: {}, mailbox: null, contents: [] }, gates: [], person: "alice",
    now: new Date("2026-10-16T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null };
}
const ANSWER = { type: "object", required: ["answer"], properties: { answer: { type: "string" } } };
const kindOf = () => ({ name: "fixture-tools", serves: [], participant: "one", needs: ["draft text"], resources: "none", preconditions: [], recipes: [],
  checks: [], personDecides: [], reviewer: null, reviewers: 0, steps: [], gatePoints: [], review: "person", writer: "return-draft", limit: 5,
  tools: ["list-files", "read-file"], toolLimit: 7, purpose: "Answers, for a test.", prompt: "Answer.", answer: ANSWER });
const preparedOf = (drafter) => ({ kind: kindOf(), params: {}, drafter, reviewers: [], parts: [], destinations: [], fits: true, notFitting: [], leftOut: [], blocking: [], limit: 5 });
async function runInTab(prepared) {
  const touched = [];
  const result = await runtimes.runOnTab(prepared, contextOf(touched), connections, { host: untouchable(touched, "hooks.host"), record: null });
  return { result, touched };
}

// The Bridge `lab-pc` behind fetch. Each POST /v1/ask is kept as { path, token, body } and answered with the ask "ask-N"; each GET of an ask is answered with the next scripted answer
// (an object of the ask's entry); any request to another origin fails the test.
const realFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = realFetch; });
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
let bridged = [];
function bridgeAnswers(entries) {
  bridged = [];
  const queue = [...entries];
  globalThis.fetch = async (url, init) => {
    const where = new URL(String(url));
    assert.equal(where.origin, BRIDGE_ORIGIN, `a request reached ${where.origin}, not the Bridge`);
    const body = init.body ? JSON.parse(init.body) : null;
    bridged.push({ method: init.method, path: where.pathname, token: init.headers[bridgeApi.tokenHeader], body });
    if (init.method === "POST" && where.pathname === "/v1/ask") return json({ ask: `ask-${bridged.filter((each) => each.method === "POST").length}` });
    if (init.method === "GET" && where.pathname.startsWith("/v1/ask/")) {
      const next = queue.shift();
      if (!next) throw new Error("the Bridge was asked more often than the test expects");
      return json(next);
    }
    return json({ error: "not-found", message: "no" }, 404);
  };
}
const posts = () => bridged.filter((each) => each.method === "POST");
const done = (fields) => ({ state: "done", text: "", calls: [], usage: null, error: null, ...fields });
const TWO_CALLS = [{ id: "c1", name: "list-files", args: { folder: "docs" } }, { id: "c2", name: "read-file", args: { path: "docs/a.md" } }];
const LISTING = "docs/a.md\ndocs/sub/b.md", FILE_TEXT = "alpha\nneedle in a\nomega";

// TST-497009 · level: component · module: MOD-runtimes
// guards: ONE DEFINITION, THREE DRIVERS; A RUNTIME IS INTERCHANGEABLE; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a model endpoint ep1 the Bridge lab-pc calls (its bridge is "lab-pc"), declaring draft text, read the repository and use tools; a kind that names list-files and read-file; a product snapshot holding README.md, docs/a.md and docs/sub/b.md; the Bridge answers the first exchange with the calls list-files("docs") and read-file("docs/a.md") (10 in, 2 out) and the second with the text {"draft":{"answer":"read it"},"answers":[]} (20 in, 3 out)
// input: runOnTab of the prepared job, with no record
// expect: exactly two POST /v1/ask, both to the Bridge with its token, each body with exactly the keys endpoint and exchange, the endpoint the configuration given; the first exchange is the user message "Answer." followed by the form of the answer, and the tools list-files and read-file in that order, each with name, description and input; the second exchange ends with the assistant turn that made c1 and c2, then the tool turn "docs/a.md\ndocs/sub/b.md" for c1 and the tool turn "alpha\nneedle in a\nomega" for c2, and offers the same two tools; the result's draft is { answer: "read it" }, stopped because passed, its one usage entry the drafter's with 30 in and 5 out; no property of either host, of the hooks' host or of connect was touched; no request reached any origin but the Bridge's
test("runOnTab — an endpoint the Bridge calls is offered the kind's tools, each request of its loop one exchange ask and each call carried out in the tab", async () => {
  bridgeAnswers([{ state: "running" }, done({ calls: TWO_CALLS, usage: { inputTokens: 10, outputTokens: 2, minutes: null, cost: null } }),
    done({ text: JSON.stringify({ draft: { answer: "read it" }, answers: [] }), usage: { inputTokens: 20, outputTokens: 3, minutes: null, cost: null } })]);
  const { result, touched } = await runInTab(preparedOf(DRAFTER));
  assert.equal(posts().length, 2);
  assert.ok(posts().every((each) => each.path === "/v1/ask" && each.token === "token-lab-pc"));
  assert.ok(posts().every((each) => JSON.stringify(Object.keys(each.body).sort()) === JSON.stringify(["endpoint", "exchange"])));
  assert.ok(posts().every((each) => JSON.stringify(each.body.endpoint) === JSON.stringify(CONFIG)));
  const [first, second] = posts().map((each) => each.body.exchange);
  assert.deepEqual(first.messages.map((message) => message.role), ["user"]);
  assert.ok(first.messages[0].text.startsWith("Answer.\n\n## The form of your answer\n"), "the prepared prompt, then the form of the answer");
  assert.deepEqual(first.tools.map((tool) => tool.name), ["list-files", "read-file"]);
  assert.ok(first.tools.every((tool) => typeof tool.description === "string" && typeof tool.input === "object"));
  assert.deepEqual(second.tools.map((tool) => tool.name), ["list-files", "read-file"]);
  assert.deepEqual(second.messages.slice(-3), [{ role: "assistant", text: "", calls: TWO_CALLS }, { role: "tool", text: LISTING, callId: "c1" }, { role: "tool", text: FILE_TEXT, callId: "c2" }]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.written], [{ answer: "read it" }, "passed", null]);
  assert.deepEqual(result.usage, [{ participant: "drafter-a", usage: { inputTokens: 30, outputTokens: 5, minutes: null, cost: null } }]);
  assert.deepEqual(touched, []);
});

// TST-497010 · level: component · module: MOD-runtimes
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; ONE DEFINITION, THREE DRIVERS
// given: the job of TST-497009 with the drafter declared with draft text and read the repository only; known positive first — the declaring drafter's first ask is an exchange; the Bridge answers the draft {"draft":{"answer":"plain"},"answers":[]} at once
// input: runOnTab of each
// expect: the declaring drafter's POST body has the key exchange (the known positive); the other's single POST body has exactly the keys endpoint and input, the endpoint the configuration, the input "Answer." followed by the form of the answer; one ask only; the draft { answer: "plain" }, stopped because passed
test("runOnTab — an endpoint the Bridge calls, given no tools, is still one ask with the prompt", async () => {
  bridgeAnswers([done({ text: JSON.stringify({ draft: { answer: "plain" }, answers: [] }) })]);
  await runInTab(preparedOf(DRAFTER));
  assert.ok("exchange" in posts()[0].body, "known positive: a drafter that declares use tools is asked by exchange");
  bridgeAnswers([done({ text: JSON.stringify({ draft: { answer: "plain" }, answers: [] }) })]);
  const { result } = await runInTab(preparedOf({ ...DRAFTER, capabilities: ["draft text", "read the repository"] }));
  assert.equal(posts().length, 1);
  assert.deepEqual(Object.keys(posts()[0].body).sort(), ["endpoint", "input"]);
  assert.deepEqual(posts()[0].body.endpoint, CONFIG);
  assert.ok(posts()[0].body.input.startsWith("Answer.\n\n## The form of your answer\n"), "the prepared prompt, then the form of the answer");
  assert.deepEqual([result.draft, result.stoppedBecause], [{ answer: "plain" }, "passed"]);
});

// TST-497011 · level: unit · module: MOD-runtimes
// guards: ONE DEFINITION, THREE DRIVERS; A REMOTE INTERFACE NAMES HOW IT FAILS
// given: bridgeDriver(bridge, { endpoint: CONFIG }, participant) and an input carrying tools (read_file, limit 10); the Bridge answers the first exchange ask as failed with the error "key refused: no"; known positive — the same Bridge answering the exchange with a text
// input: send(input) for each
// expect: the answering Bridge gives { text, usage } with the text and usage reported (a result with no calls key), its POST body having the keys endpoint and exchange; the failing one makes send reject with the client's AskFailed whose message is "key refused: no", after one POST, with the tool never run
test("bridgeDriver — a failed exchange ask is the driver's failure, unrepeated, and no tool runs", async () => {
  const log = [];
  const tools = { definitions: [{ name: "read_file", description: "Reads.", input: { type: "object" } }], limit: 10, async call(name) { log.push(name); return "x"; } };
  const input = { prompt: "Inspect.", parts: [], output: null, findings: [], previous: null, workdir: null, tools };
  const driver = runtimes.bridgeDriver(BRIDGE, { endpoint: CONFIG }, { ...DRAFTER });
  bridgeAnswers([done({ text: "fine", usage: { inputTokens: 1, outputTokens: 1, minutes: null, cost: null } })]);
  assert.deepEqual(await driver.send(input), { text: "fine", usage: { inputTokens: 1, outputTokens: 1, minutes: null, cost: null } });
  assert.deepEqual(Object.keys(posts()[0].body).sort(), ["endpoint", "exchange"], "the known positive was asked by exchange");
  bridgeAnswers([{ state: "failed", text: null, usage: null, error: "key refused: no" }]);
  await assert.rejects(driver.send(input), (error) => error.name === "AskFailed" && error.message === "key refused: no");
  assert.equal(posts().length, 1);
  assert.deepEqual(log, []);
});

// TST-497012 · level: unit · module: MOD-runtimes
// guards: ONE DEFINITION, THREE DRIVERS; A RUNTIME IS INTERCHANGEABLE
// given: the same input carrying tools sent through bridgeDriver to an endpoint target and to an agent target; the Bridge answers a text each time
// input: send(input) to each
// expect: the endpoint target's POST body has the keys endpoint and exchange; the agent target's POST body is exactly { agent: "claude", input: "Inspect." } — an agent is given no exchange
test("bridgeDriver — an agent is sent the prompt even when the input carries tools; an endpoint is sent an exchange", async () => {
  const tools = { definitions: [{ name: "read_file", description: "Reads.", input: { type: "object" } }], limit: 10, async call() { return "x"; } };
  const input = { prompt: "Inspect.", parts: [], output: null, findings: [], previous: null, workdir: null, tools };
  bridgeAnswers([done({ text: "from endpoint" })]);
  await runtimes.bridgeDriver(BRIDGE, { endpoint: CONFIG }, { ...DRAFTER }).send(input);
  assert.deepEqual(Object.keys(posts()[0].body).sort(), ["endpoint", "exchange"]);
  bridgeAnswers([done({ text: "from agent" })]);
  await runtimes.bridgeDriver(BRIDGE, { agent: "claude" }, { ...DRAFTER, route: "bridge lab-pc agent claude" }).send(input);
  assert.deepEqual(posts().map((each) => each.body), [{ agent: "claude", input: "Inspect." }]);
});
