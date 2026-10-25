// A model endpoint the tab calls is given the kind's tools (ITM-496) — the composition of MOD-runtimes' `runOnTab` and `driverOf` (ITM-319), MOD-job-runner's offer
// of a kind's tools (ITM-486) and MOD-endpoint-calls' `endpointDriver` tool loop (ITM-488), run as one: `runOnTab` -> `runJob` -> `offerTools` -> the driver `driverOf`
// builds -> `endpointDriver` -> the endpoint behind the global `fetch`. For UC-049 step 4. Nothing of it is replaced by a stand-in except the endpoint and the Bridge, which
// are fixtures behind `fetch`, and the repository, which is a fixture snapshot.
// Run: node --test tests/runtimes-tab-endpoint-tools.test.mjs
//
// Module: MOD-runtimes
// Guards: ONE DEFINITION, THREE DRIVERS; A PARTICIPANT DECLARES ITS CAPABILITIES; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// Level: component
//
// The readings, each from the sentence that gives it.
// (1) "the tab calls directly" is an endpoint whose `bridge` is `null` among `connections.endpoints`. MOD-runtimes, `runOnTab`: "an endpoint's driver from its configuration,
//     `endpointDriver` where its `bridge` is `null` and `bridgeDriver` with the endpoint on the Bridge its `bridge` names".
// (2) "is given the kind's tools" is that the driver's `send` is handed the `ToolUse` of the kind's tools, which its loop offers the endpoint and carries out. MOD-runtimes, `runOnTab`:
//     "Only the driver of an endpoint the tab calls itself is given the kind's tools (MOD-job-runner's `ToolUse`) — called directly, or through the Bridge its configuration names";
//     MOD-endpoint-calls, `endpointDriver`: "Where the input carries `tools` ..., it offers their definitions in the endpoint's own form ..., hands each call the endpoint makes to
//     `tools.call` and returns its result to the endpoint, and goes on until the endpoint answers without a call".
// (3) "carried out in the tab" is that the result the endpoint is given for a call is what the tool's strategy answers from the product's snapshot, in the program that runs the job,
//     with the product's host and the instance's untouched. MOD-job-runner, table of built-in strategies: "`list-files`, `read-file`, `search-files` | tool | the product's files at
//     the commit the job read"; UC-049 step 4: "The tab reads the product through the repository server's API with the author's token, and writes nothing."
// (4) Who is not given them. MOD-job-runner, `ToolUse`: "The runner gives it only to a drafter that declares *use tools* and is a model endpoint ... a coding agent gets `null`".
//     So (a) a drafter that does not declare *use tools* gets none; (b) a reviewer is not a drafter, so gets none; (c) an agent on a Bridge gets none. The item's reading, the Product
//     Owner's, of "no other driver is given tools" is "no agent on a Bridge" (ITM-496, Outcome); (a) and (b) are read from the sentence quoted, which says "only to a drafter that
//     declares *use tools*", and are not that reading's words. What a Bridge does with an endpoint it calls is ITM-497's and is not asserted here.
// (5) An agent on a Bridge is "offered none" is observable here only at the Bridge's wire: the request carries the agent and the prompt and nothing else. The decision itself,
//     for a coding agent, is guarded where `runJob` hands a driver its input (tests/job-runner-tools.test.mjs, TST-486002).
//
// Files followed (§6a.1): the endpoint stand-in behind `fetch` and the fixture kind, job and context of tests/runtimes-tab.test.mjs (ITM-319); the fixture kind that names tools, the
// snapshot and the host that fails the test when touched of tests/job-runner-tools.test.mjs (ITM-486); the constructed provider replies of tests/endpoint-tool-loop.test.mjs (ITM-488);
// the Bridge behind `fetch` of tests/runtimes-bridge.test.mjs (ITM-325). Each test states its input and its expected result before it runs (given / input / expect), written out in
// its own text, not read from a document; where a test asserts an absence, the same call is first shown to succeed. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import * as runtimes from "../src/runtimes/index.mjs";
import { bridgeAt } from "../src/bridge-client/index.mjs";
import { bridgeApi } from "../src/bridge-http/index.mjs";

const PRODUCT = "https://github.com/alice/product";
const DRAFTER = { name: "drafter-a", type: "model endpoint", model: "example-model", context: 200000, price: null,
  capabilities: ["draft text", "read the repository", "use tools"], place: "this machine", route: "endpoint ep1" };
const REVIEWER = { ...DRAFTER, name: "reviewer-b", model: "other-model", capabilities: ["draft text", "read the repository", "use tools"], route: "endpoint ep2" };
const AGENT = { name: "claude-lab", type: "CLI agent", model: "agent", context: 200000, price: null,
  capabilities: ["draft text", "read the repository", "use tools", "run code and tests"], place: "this machine", route: "bridge lab-pc agent claude" };

const OPENAI = (name) => ({ name, kind: "openai-compatible", baseUrl: `https://${name}.example.test/v1`, model: "m", key: null });
const ANTHROPIC = (name) => ({ name, kind: "anthropic", baseUrl: `https://${name}.example.test/v1`, model: "m", key: null });
const BRIDGE = bridgeAt({ name: "lab-pc", address: "http://127.0.0.1:4712", token: "token-lab-pc" });
const connectionsOf = (make) => ({ endpoints: { ep1: { config: make("ep1"), bridge: null }, ep2: { config: make("ep2"), bridge: null } }, bridges: { "lab-pc": BRIDGE } });

const FILES = { "README.md": "# Product\n", "docs/a.md": "alpha\nneedle in a\nomega", "docs/sub/b.md": "beta\n\nno match" };
const snapshot = { repository: { path: "alice/product" }, ref: "main", commit: "c".repeat(40), paths: Object.keys(FILES),
  async read(path) { return path in FILES ? FILES[path] : null; }, blob: () => null };

// The product's host, the instance's host, the hooks' host and `connect` fail the test when anything touches them: the tab writes nothing and reads only the snapshot.
function untouchable(touched, name) {
  return new Proxy({}, { get(target, property) { touched.push(`${name}.${String(property)}`); return undefined; } });
}
function contextOf(touched) {
  return { kind: null, params: {}, product: { address: PRODUCT, snapshot, host: untouchable(touched, "product.host") },
    instance: { snapshot: null, host: untouchable(touched, "instance.host") }, connect: async () => { touched.push("connect"); return null; },
    participants: [], places: { sources: {}, mailbox: null, contents: [] }, gates: [], person: "alice",
    now: new Date("2026-10-16T08:00:00Z"), agentM: { version: "unreleased", commit: "0".repeat(40) }, jobId: null };
}

const ANSWER = { type: "object", required: ["answer"], properties: { answer: { type: "string" } } };
const kindOf = (fields = {}) => ({ name: "fixture-tools", serves: [], participant: "one", needs: ["draft text"], resources: "none", preconditions: [], recipes: [],
  checks: [], personDecides: [], reviewer: null, reviewers: 0, steps: [], gatePoints: [], review: "person", writer: "return-draft", limit: 5,
  tools: ["list-files", "read-file"], toolLimit: 7, purpose: "Answers, for a test.", prompt: "Answer.", answer: ANSWER, ...fields });
const preparedOf = (drafter, { reviewer = null } = {}) => ({
  kind: kindOf(reviewer ? { reviewer: "review-architecture", reviewers: 1 } : {}), params: {}, drafter, reviewers: reviewer ? [reviewer] : [], parts: [],
  destinations: [], fits: true, notFitting: [], leftOut: [], blocking: [], limit: 5 });

// ---------------------------------------------------------------- the endpoints and the Bridge behind fetch

const realFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = realFetch; });
const json = (body) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });

// A provider's reply that makes the calls given ({ id, name, args }), or answers with the draft given, reporting [input, output] tokens.
const openaiCalls = (calls, [input, output]) => json({ choices: [{ message: { content: null, tool_calls: calls.map(({ id, name, args }) =>
  ({ id, type: "function", function: { name, arguments: JSON.stringify(args) } })) } }], usage: { prompt_tokens: input, completion_tokens: output } });
const openaiAnswer = (draft, [input, output]) => json({ choices: [{ message: { content: JSON.stringify({ draft, answers: [] }) } }],
  usage: { prompt_tokens: input, completion_tokens: output } });
const anthropicCalls = (calls, [input, output]) => json({ content: calls.map(({ id, name, args }) => ({ type: "tool_use", id, name, input: args })),
  usage: { input_tokens: input, output_tokens: output } });
const anthropicAnswer = (draft, [input, output]) => json({ content: [{ type: "text", text: JSON.stringify({ draft, answers: [] }) }],
  usage: { input_tokens: input, output_tokens: output } });

// Each endpoint answers the replies scripted for it in turn (an extra request fails the test); every request is kept as { url, body }.
let sent = [];
function endpointsAnswer(scripts) {
  sent = [];
  const queues = Object.fromEntries(Object.entries(scripts).map(([name, replies]) => [name, [...replies]]));
  globalThis.fetch = async (url, init) => {
    const name = /^https:\/\/(ep\d)\.example\.test\//.exec(String(url))?.[1];
    sent.push({ url: String(url), body: JSON.parse(init.body) });
    const next = queues[name]?.shift();
    if (!next) throw new Error(`${name ?? String(url)} was asked more often than the test expects`);
    return next;
  };
}

// The Bridge `lab-pc` behind fetch: an ask is accepted, then done with the draft given; every request is kept as { method, path, token, body }.
let bridged = [];
function bridgeAnswers(draft) {
  bridged = [];
  globalThis.fetch = async (url, init) => {
    const where = new URL(String(url));
    bridged.push({ origin: where.origin, method: init.method, path: where.pathname, token: init.headers[bridgeApi.tokenHeader], body: init.body ? JSON.parse(init.body) : null });
    if (init.method === "POST" && where.pathname === "/v1/ask") return json({ ask: "ask-1" });
    if (where.pathname === "/v1/ask/ask-1") return json({ state: "done", text: JSON.stringify({ draft, answers: [] }), usage: { inputTokens: 12, outputTokens: 7, minutes: null, cost: null }, error: null });
    return new Response("{}", { status: 404 });
  };
}

// A conversation of the prompt bar: no record, so the host the hooks name is never used.
async function runInTab(prepared, connections) {
  const touched = [];
  const result = await runtimes.runOnTab(prepared, contextOf(touched), connections, { host: untouchable(touched, "hooks.host"), record: null });
  return { result, touched };
}

const EP1_OPENAI = "https://ep1.example.test/v1/chat/completions", EP2_OPENAI = "https://ep2.example.test/v1/chat/completions";
const LISTING = "docs/a.md\ndocs/sub/b.md", FILE_TEXT = "alpha\nneedle in a\nomega";
const TWO_CALLS = [{ id: "c1", name: "list-files", args: { folder: "docs" } }, { id: "c2", name: "read-file", args: { path: "docs/a.md" } }];

// ---------------------------------------------------------------- a direct endpoint is given the kind's tools

// TST-496001 · level: component · module: MOD-runtimes
// guards: ONE DEFINITION, THREE DRIVERS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: a model endpoint ep1 of the OpenAI-compatible kind, called directly (its Bridge is null), declaring draft text, read the repository and use tools; a kind that names list-files and read-file; a product snapshot holding README.md, docs/a.md and docs/sub/b.md; the endpoint's first reply makes the two calls list-files("docs") and read-file("docs/a.md") (10 tokens in, 2 out), its second answers the draft { answer: "read it" } (20 in, 3 out); a Bridge lab-pc is among the connections
// input: runOnTab of the prepared job, with no record (a conversation of the prompt bar)
// expect: exactly two requests, both to https://ep1.example.test/v1/chat/completions, none to the Bridge; the first offers the tools list-files and read-file, in that order, in the OpenAI form; the second repeats them and ends with two tool turns — "docs/a.md\ndocs/sub/b.md" for call c1 and "alpha\nneedle in a\nomega" for call c2 —, after the assistant turn that made the two calls; the result's draft is { answer: "read it" }, stopped because passed, nothing written (written null), its one usage entry the drafter's with 30 tokens in and 5 out; no property of either host, of the hooks' host or of connect was touched
test("runOnTab — an OpenAI-compatible endpoint the tab calls directly is offered the kind's tools and its calls are carried out in the tab", async () => {
  endpointsAnswer({ ep1: [openaiCalls(TWO_CALLS, [10, 2]), openaiAnswer({ answer: "read it" }, [20, 3])] });
  const { result, touched } = await runInTab(preparedOf(DRAFTER), connectionsOf(OPENAI));
  assert.deepEqual(sent.map((each) => each.url), [EP1_OPENAI, EP1_OPENAI], "two requests, both to the endpoint itself, none to the Bridge");
  const offered = (body) => body.tools.map((tool) => tool.function.name);
  assert.deepEqual(offered(sent[0].body), ["list-files", "read-file"]);
  assert.deepEqual(offered(sent[1].body), ["list-files", "read-file"]);
  const turns = sent[1].body.messages;
  assert.deepEqual(turns.slice(-3).map((turn) => [turn.role, turn.tool_calls?.map((call) => call.id) ?? null]), [["assistant", ["c1", "c2"]], ["tool", null], ["tool", null]]);
  assert.deepEqual(turns.slice(-2).map((turn) => [turn.tool_call_id, turn.content]), [["c1", LISTING], ["c2", FILE_TEXT]]);
  assert.deepEqual([result.draft, result.stoppedBecause, result.written], [{ answer: "read it" }, "passed", null]);
  assert.deepEqual(result.usage, [{ participant: "drafter-a", usage: { inputTokens: 30, outputTokens: 5, minutes: null, cost: null } }]);
  assert.deepEqual(touched, []);
});

// TST-496002 · level: component · module: MOD-runtimes
// guards: ONE DEFINITION, THREE DRIVERS; THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
// given: the same job and the same replies as TST-496001, with ep1 an Anthropic endpoint (the replies in the Anthropic form: tool_use blocks, then a text block)
// input: runOnTab of the prepared job, with no record
// expect: exactly two requests, both to https://ep1.example.test/v1/messages; the first offers the tools list-files and read-file, in that order, in the Anthropic form; the second ends with the assistant turn that made the two calls and one user turn holding two tool_result blocks — "docs/a.md\ndocs/sub/b.md" for tool_use_id c1 and "alpha\nneedle in a\nomega" for c2; the draft is { answer: "read it" }, stopped because passed; no host touched
test("runOnTab — an Anthropic endpoint the tab calls directly is offered the kind's tools and its calls are carried out in the tab", async () => {
  endpointsAnswer({ ep1: [anthropicCalls(TWO_CALLS, [10, 2]), anthropicAnswer({ answer: "read it" }, [20, 3])] });
  const { result, touched } = await runInTab(preparedOf(DRAFTER), connectionsOf(ANTHROPIC));
  assert.deepEqual(sent.map((each) => each.url), Array(2).fill("https://ep1.example.test/v1/messages"));
  assert.deepEqual(sent[0].body.tools.map((tool) => tool.name), ["list-files", "read-file"]);
  assert.deepEqual(sent[1].body.tools.map((tool) => tool.name), ["list-files", "read-file"]);
  const turns = sent[1].body.messages;
  assert.deepEqual(turns.slice(-2).map((turn) => turn.role), ["assistant", "user"]);
  assert.deepEqual(turns.at(-2).content.filter((block) => block.type === "tool_use").map((block) => block.id), ["c1", "c2"]);
  assert.deepEqual(turns.at(-1).content.map((block) => [block.type, block.tool_use_id, block.content]), [["tool_result", "c1", LISTING], ["tool_result", "c2", FILE_TEXT]]);
  assert.deepEqual([result.draft, result.stoppedBecause], [{ answer: "read it" }, "passed"]);
  assert.deepEqual(touched, []);
});

// ---------------------------------------------------------------- who is given none

// TST-496003 · level: component · module: MOD-runtimes
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; ONE DEFINITION, THREE DRIVERS
// given: the job of TST-496001 with an endpoint that answers the draft at once; known positive first — the drafter declaring use tools; then the same endpoint declared with draft text and read the repository only
// input: runOnTab of each
// expect: the declaring drafter's request carries a tools key naming list-files and read-file (the known positive); the other's single request carries no tools key, the endpoint is asked once, and its draft { answer: "plain" } is the result, stopped because passed
test("runOnTab — an endpoint that does not declare use tools is offered none, though the kind names tools", async () => {
  endpointsAnswer({ ep1: [openaiAnswer({ answer: "plain" }, [4, 1])] });
  await runInTab(preparedOf(DRAFTER), connectionsOf(OPENAI));
  assert.deepEqual(sent[0].body.tools.map((tool) => tool.function.name), ["list-files", "read-file"], "known positive: a drafter that declares use tools is offered them");
  endpointsAnswer({ ep1: [openaiAnswer({ answer: "plain" }, [4, 1])] });
  const withoutTools = { ...DRAFTER, capabilities: ["draft text", "read the repository"] };
  const { result } = await runInTab(preparedOf(withoutTools), connectionsOf(OPENAI));
  assert.equal(sent.length, 1, "the endpoint is asked once");
  assert.equal("tools" in sent[0].body, false, "no tools key in its request");
  assert.deepEqual([result.draft, result.stoppedBecause], [{ answer: "plain" }, "passed"]);
});

// TST-496004 · level: component · module: MOD-runtimes
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; ONE DEFINITION, THREE DRIVERS
// given: the job of TST-496001 with a reviewing kind and a reviewer on endpoint ep2, also called directly and declaring use tools; ep1 makes the call read-file("docs/a.md") and then answers the draft { answer: "read it" }; ep2 answers a review without findings
// input: runOnTab with ep1 the drafter's and ep2 the reviewer's endpoint
// expect: three requests in order — ep1 twice (https://ep1.example.test/v1/chat/completions), then ep2 once (https://ep2.example.test/v1/chat/completions); the drafter's first request carries a tools key naming list-files and read-file (the known positive); the reviewer's request carries no tools key; the result is the draft { answer: "read it" }, stopped because passed
test("runOnTab — the reviewer's endpoint is offered no tools, though it declares use tools", async () => {
  endpointsAnswer({ ep1: [openaiCalls([TWO_CALLS[1]], [10, 2]), openaiAnswer({ answer: "read it" }, [20, 3])],
    ep2: [openaiAnswer({ findings: [] }, [5, 1])] });
  const { result } = await runInTab(preparedOf(DRAFTER, { reviewer: REVIEWER }), connectionsOf(OPENAI));
  assert.deepEqual(sent.map((each) => each.url), [EP1_OPENAI, EP1_OPENAI, EP2_OPENAI]);
  assert.deepEqual(sent[0].body.tools.map((tool) => tool.function.name), ["list-files", "read-file"], "known positive: the drafter is offered them");
  assert.equal("tools" in sent[2].body, false, "the reviewer's request carries no tools key");
  assert.deepEqual([result.draft, result.stoppedBecause], [{ answer: "read it" }, "passed"]);
});

// TST-496005 · level: component · module: MOD-runtimes
// guards: A PARTICIPANT DECLARES ITS CAPABILITIES; A RUNTIME IS INTERCHANGEABLE
// given: the job of TST-496001 with a CLI agent claude on the Bridge lab-pc as drafter, declaring draft text, read the repository, use tools and run code and tests; the Bridge answers the draft { answer: "from the Bridge" }; the connections hold ep1 as well
// input: runOnTab of the prepared job, with no record
// expect: the Bridge receives POST /v1/ask with the token of lab-pc and a body whose keys are exactly agent and input, the agent "claude" and the input the prompt "Answer." followed by the form of the answer, the envelope as a JSON schema — no tool is named in it —, then polls GET /v1/ask/ask-1; no request goes to ep1 or any other origin than the Bridge's http://127.0.0.1:4712; the result is the draft { answer: "from the Bridge" }, stopped because passed
test("runOnTab — an agent on a Bridge is sent its prompt and no tools", async () => {
  bridgeAnswers({ answer: "from the Bridge" });
  const { result, touched } = await runInTab(preparedOf(AGENT), connectionsOf(OPENAI));
  assert.deepEqual(bridged.map((each) => [each.origin, each.method, each.path, each.token]),
    [["http://127.0.0.1:4712", "POST", "/v1/ask", "token-lab-pc"], ["http://127.0.0.1:4712", "GET", "/v1/ask/ask-1", "token-lab-pc"]]);
  assert.deepEqual(Object.keys(bridged[0].body).sort(), ["agent", "input"]);
  assert.equal(bridged[0].body.agent, "claude");
  assert.ok(bridged[0].body.input.startsWith("Answer.\n\n## The form of your answer\n"), bridged[0].body.input);
  assert.match(bridged[0].body.input, /"required": \[\n\s*"draft"\n\s*\]/);
  assert.deepEqual([result.draft, result.stoppedBecause], [{ answer: "from the Bridge" }, "passed"]);
  assert.deepEqual(touched, []);
});
