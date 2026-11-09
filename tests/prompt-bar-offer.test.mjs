// The connections the prompt bar offers, the instance's participants on them, the reasons it keeps a message from being sent, and the draft
// and running message it gives — offer.mjs, send.mjs's whyNot, and bar.mjs's latestDraft and currentJob, as the accepted text of
// docs/architecture/MOD-prompt-bar.md and UC-049 (Precondition, 1, 1a, 1b, 3a) state them: endpointsOffered and sessionsOffered, one
// Connection for each model a connection offers; offer.mjs's `readParticipants(snapshot, connections)`, the instance's participants joined
// with those connections (MOD-participant-list's participantsOf), which a job's context reads, and `placeOf(participant)`, which these tests
// call directly.
// Run: node --test tests/prompt-bar-offer.test.mjs
//
// Module: MOD-prompt-bar
// Guards: UC-049; UC-044; THE PAGE NAMES WHERE IT SENDS; A CONNECTION DECLARES WHERE IT PROCESSES DATA; A CONNECTION DECLARES ITS CAPABILITIES
// Guards: THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE; A CONNECTION NAMES THE MODELS IT OFFERS; A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL
// Level: unit
//
// The store is the browser store over fixture storages; no request leaves this process. Each test states its input and its expected result
// in its own text.

import test from "node:test";
import assert from "node:assert/strict";
import { openStore, readTabValue, writeSetting, writeTabValue } from "../src/browser-store/index.mjs";
import * as promptBar from "../src/prompt-bar/index.mjs";
import { currentJob, latestDraft } from "../src/prompt-bar/index.mjs";
import * as offer from "../src/prompt-bar/offer.mjs";
import { placeOf, readParticipants } from "../src/prompt-bar/offer.mjs";
import { personOf, whyNot } from "../src/prompt-bar/send.mjs";

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
function freshStore() {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "sessionStorage", { configurable: true, value: new Storage() });
  return openStore("alice/agent-m");
}

const COLUMNS = "| Name | Type | Model |\n|---|---|---|";
const register = (...rows) => `# Participants of this instance\n\n${COLUMNS}\n${rows.join("\n")}\n`;
const snapshotOf = (files) => ({ read: async (path) => files[path] ?? null });

// Two connections, as endpointsOffered and sessionsOffered give them: an endpoint of model-x, and a Bridge's coding agent that runs model-x.
const LOCAL = { name: "local", type: "model endpoint", model: "model-x", context: 128000, place: "Anthropic, USA",
  capabilities: ["draft text", "read the repository"], route: "endpoint local" };
const MAC = { name: "mac:claude", type: "CLI agent", model: "model-x", context: 200000, place: "this machine",
  capabilities: ["draft text", "read the repository", "run code and tests"], route: "bridge mac agent claude" };

// TST-600010 · level: unit · module: MOD-prompt-bar
// guards: UC-049; A JOB RUNS ON A CONNECTION THAT OFFERS ITS PARTICIPANT'S MODEL
// given: a register of three — alice, a person; dev-a, an agent of model-x; dev-b, an agent of model-y —; the connections local and mac:claude, both of model-x
// input: readParticipants(snapshot, [local, mac:claude])
// expect: alice once, as a person; dev-a once on each connection, in their order, with its name and model and the connection's type, context, capabilities, place and route; dev-b once, of the type agent without a route
test("readParticipants — the instance's participants joined with the connections given, each agent once on each connection of its model", async () => {
  const participants = await readParticipants(snapshotOf({ "docs/participants.md": register("| alice | person | — |", "| dev-a | agent | model-x |",
    "| dev-b | agent | model-y |") }), [LOCAL, MAC]);
  const on = ({ type, context, capabilities, place, route }) => ({ name: "dev-a", type, model: "model-x", context, capabilities, place, route });
  assert.deepEqual(participants, [
    { name: "alice", type: "person", model: null, context: null, capabilities: [], place: null, route: null },
    on(LOCAL), on(MAC),
    { name: "dev-b", type: "agent", model: "model-y", context: null, capabilities: [], place: null, route: null },
  ]);
});

// TST-600011 · level: unit · module: MOD-prompt-bar
// guards: UC-049
// given: an instance with no register at all, and the connections local and mac:claude
// input: readParticipants over a snapshot without docs/participants.md
// expect: no participants (an empty list): no connection is a participant of the list
test("readParticipants — an instance without a register has no participants, whatever connections are given", async () => {
  assert.deepEqual(await readParticipants(snapshotOf({}), [LOCAL, MAC]), []);
});

// TST-600012 · level: unit · module: MOD-prompt-bar
// guards: THE PAGE NAMES WHERE IT SENDS; A CONNECTION DECLARES WHERE IT PROCESSES DATA
// given: a participant whose place is "Anthropic, USA" and one whose place is null
// input: placeOf for each
// expect: "Anthropic, USA" for the first; "no processing place declared" for the second — never an empty name
test("placeOf — the declared place, or the statement that none is declared", () => {
  assert.equal(placeOf({ place: "Anthropic, USA" }), "Anthropic, USA");
  assert.equal(placeOf({ place: null }), "no processing place declared");
});

// TST-600013 · level: unit · module: MOD-prompt-bar
// guards: UC-049; UC-019
// given: a prepared job with one finding that keeps it from starting, and one that does not fit the participant tiny (context 100, size 400), with the offered participants tiny, big (context 1000) and unknown (no context)
// input: whyNot(prepared, offered)
// expect: two lines — the finding as the run panel shows it (kind, what, fix, [rule]), and "tiny does not hold this message: its context holds 100 tokens, the job needs about 400. Choose big, whose context is larger."
test("whyNot — a finding that keeps the job from starting, and the participant it does not fit, with a larger one offered", () => {
  const blocking = { artifact: "docs/participants.md", line: 1, kind: "error", rule: "A CONNECTION DECLARES ITS CAPABILITIES", what: "tiny cannot draft text", fix: "choose one that can" };
  const prepared = { blocking: [blocking], notFitting: [{ participant: { name: "tiny" }, size: 400, context: 100 }] };
  const offered = [{ name: "tiny", context: 100 }, { name: "big", context: 1000 }, { name: "unknown", context: null }];
  assert.deepEqual(whyNot(prepared, offered), [
    "error: tiny cannot draft text — choose one that can [A CONNECTION DECLARES ITS CAPABILITIES]",
    "tiny does not hold this message: its context holds 100 tokens, the job needs about 400. Choose big, whose context is larger.",
  ]);
  assert.deepEqual(whyNot({ blocking: [], notFitting: [] }, offered), []);
});

// TST-600014 · level: unit · module: MOD-prompt-bar
// guards: UC-049; A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
// given: a store whose tab keeps a draft for the subject "use-case:UC-007", and a store whose tab keeps none
// input: latestDraft(store, "use-case:UC-007") and latestDraft(store, "use-case:UC-008") on the first; latestDraft(store, "use-case:UC-007") on the second
// expect: the draft itself for the first subject; null for the other subject; null where the tab keeps no draft
test("latestDraft — the draft only for the subject it was drafted on", () => {
  const store = freshStore();
  const draft = { subject: "use-case:UC-007", kind: "converse", participant: "ep-local", params: {}, result: { draft: { answer: "A" } } };
  writeTabValue(store, "prompt-bar:draft", draft);
  assert.deepEqual(latestDraft(store, "use-case:UC-007"), draft);
  assert.equal(latestDraft(store, "use-case:UC-008"), null);
  assert.equal(latestDraft(freshStore(), "use-case:UC-007"), null);
});

// TST-555001 · level: unit · module: MOD-prompt-bar
// guards: UC-049
// given: a store whose tab keeps a draft for the subject "use-case:UC-007"; a store whose tab keeps none; MOD-prompt-bar's `dropDraft`, read from the module's interface so that a missing export fails this test alone
// input: dropDraft(store, "use-case:UC-008") on the first, then latestDraft(store, "use-case:UC-007"); dropDraft(store, "use-case:UC-007") on the first, then latestDraft for both subjects and the raw tab value "prompt-bar:draft"; dropDraft(store, "use-case:UC-007") on the second
// expect: dropping for another subject returns undefined and leaves the draft, which latestDraft still gives as it was kept; dropping for the subject returns undefined, and then latestDraft gives null for both subjects and the tab keeps no value under "prompt-bar:draft" (readTabValue gives null); dropping where the tab keeps no draft returns undefined and throws nothing
test("dropDraft — drops the draft where it was drafted on that subject, and leaves it otherwise", () => {
  assert.equal(typeof promptBar.dropDraft, "function", "MOD-prompt-bar provides dropDraft");
  const store = freshStore();
  const draft = { subject: "use-case:UC-007", kind: "converse", participant: "ep-local", params: {}, result: { draft: { answer: "A" } } };
  writeTabValue(store, "prompt-bar:draft", draft);
  assert.equal(promptBar.dropDraft(store, "use-case:UC-008"), undefined);
  assert.deepEqual(latestDraft(store, "use-case:UC-007"), draft, "a draft for another subject is left");
  assert.equal(promptBar.dropDraft(store, "use-case:UC-007"), undefined);
  assert.equal(latestDraft(store, "use-case:UC-007"), null);
  assert.equal(latestDraft(store, "use-case:UC-008"), null);
  assert.equal(readTabValue(store, "prompt-bar:draft"), null, "the tab keeps no value");
  assert.equal(promptBar.dropDraft(freshStore(), "use-case:UC-007"), undefined, "no draft kept: nothing to drop");
});

// TST-600015 · level: unit · module: MOD-prompt-bar
// guards: ONE DASHBOARD SHOWS EVERY JOB
// given: no message running in this tab
// input: currentJob()
// expect: null
test("currentJob — null while no message runs", () => {
  assert.equal(currentJob(), null);
});

// TST-1201002 · level: unit · module: MOD-prompt-bar
// guards: A CONNECTION DECLARES ITS CAPABILITIES; UC-049
// given: an endpoint whose last test found that the model calls tools, one named with a CI secret — its work runs on GitHub Actions — and one without
// input: endpointsOffered over a store holding both
// expect: the endpoint with the CI secret is offered with *reach the web* beside *draft text*, *read the repository* and *use tools*, so that its job on GitHub Actions has the tool webfetch; the one without, whose work runs in this tab, is offered without it. Counter-proof: on the offer as it stood, neither had *reach the web*, and Nemotron could not read issue #2 on github.com.
test("TST-1201002: an endpoint whose work runs on GitHub Actions and that uses tools reaches the web", () => {
  const store = freshStore();
  const base = { url: "https://example.invalid/v1", kind: "openai-compatible", model: "model-x", place: "Example, USA", context: 128000 };
  writeSetting(store, "endpoint:ci", { ...base, secret: "MODEL_KEY" });
  writeSetting(store, "endpoint:tab", { ...base, key: "k" });
  writeSetting(store, "last-test:endpoint:ci", { at: "2026-11-09T10:00:00Z", outcome: "working", tools: true });
  writeSetting(store, "last-test:endpoint:tab", { at: "2026-11-09T10:00:00Z", outcome: "working", tools: true });
  const byName = Object.fromEntries(promptBar.endpointsOffered(store).map((each) => [each.name, each.capabilities]));
  assert.deepEqual(byName.ci, ["draft text", "read the repository", "use tools", "reach the web"]);
  assert.deepEqual(byName.tab, ["draft text", "read the repository", "use tools"]);
});

// TST-1201001 · level: unit · module: MOD-prompt-bar
// guards: UC-049
// given: an endpoint as an older Settings page stored it — address, kind, model and key, with no place and no context —, the same with a place and a context, and one with only a place; a CLI session's declaration with no place and no model, one with a place and two models of which one lacks its context, and one with both models' contexts
// input: endpointLacks for each, and endpointsOffered over a store holding the first and the second endpoint
// expect: the first lacks the place and the context, the second nothing, the third its context in tokens and its model; the session without a place and a model lacks the place and a model, the one with a model without its context lacks that model's context in tokens, naming it, the third nothing; endpointsOffered offers only the second endpoint, with its model and context and no price
test("endpointLacks — names what keeps an endpoint or a CLI session out of the bar, and endpointsOffered offers only one that lacks nothing", () => {
  const old = { url: "https://example.invalid/v1", kind: "openai-compatible", model: "model-x", key: "k" };
  assert.deepEqual(promptBar.endpointLacks(old), ["the place where it processes data", "its context in tokens"]);
  assert.deepEqual(promptBar.endpointLacks({ ...old, place: "Example, USA", context: 128000 }), []);
  assert.deepEqual(promptBar.endpointLacks({ place: "Example, USA" }), ["its context in tokens", "its model"]);
  const store = freshStore();
  writeSetting(store, "endpoint:old", old);
  writeSetting(store, "endpoint:complete", { ...old, place: "Example, USA", context: 128000 });
  assert.deepEqual(promptBar.endpointsOffered(store), [{ name: "complete", type: "model endpoint", model: "model-x", context: 128000,
    place: "Example, USA", capabilities: ["draft text", "read the repository"], route: "endpoint complete" }]);
  const capabilities = ["draft text"];
  assert.deepEqual(promptBar.endpointLacks({ capabilities, models: [] }), ["the place where it processes data", "a model"]);
  assert.deepEqual(promptBar.endpointLacks({ place: "this machine", capabilities, models: [{ model: "big", context: 200000 }, { model: "small" }] }),
    ["the context in tokens of small"]);
  assert.deepEqual(promptBar.endpointLacks({ place: "this machine", capabilities, models: [{ model: "big", context: 200000 }, { model: "small", context: 32000 }] }), []);
});

// TST-1203001 · level: unit · module: MOD-prompt-bar
// guards: A GITHUB PRODUCT USES A TOKEN OF ITS OWN; ONE GITHUB TOKEN SERVES EVERY FEATURE
// given: a store holding only the instance's GitHub token "Agent M · alice/agent-m"; the instance's snapshot of alice/agent-m
// input: personOf for (a) the instance's page, (b) the product alice/agent-m, the instance's own repository, with the instance's snapshot, (c) the product alice/other
// expect: (a) and (b) name the instance's token — it is the product's own token where the product is the instance —; (c) null: another product never borrows it
test("personOf — a product whose repository is the instance's uses the instance's token; another product never does", () => {
  const store = freshStore();
  writeSetting(store, "github-token", { value: "t", name: "Agent M · alice/agent-m" });
  const snapshotOf = (path) => ({ repository: { server: "github", origin: "https://github.com", path, web: `https://github.com/${path}` } });
  const instance = snapshotOf("alice/agent-m");
  assert.equal(personOf(store, instance, false), "Agent M · alice/agent-m");
  assert.equal(personOf(store, snapshotOf("alice/agent-m"), true, instance), "Agent M · alice/agent-m");
  assert.equal(personOf(store, snapshotOf("alice/other"), true, instance), null);
});

// The CLI sessions a Bridge of this browser offers (ITM-1187): offer.mjs's sessionsOffered, which startPromptBar offers after endpointsOffered (MOD-prompt-bar, Interfaces: startPromptBar). It is
// read from the module's file through a namespace, so that its absence fails these cases alone. The Bridges stand behind the global fetch, which keeps every request.
const BRIDGES = { "http://127.0.0.1:7777": "mac", "http://127.0.0.1:7778": "lab" };
function bridgesAnswer(agents) {
  const asked = [];
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    const where = new URL(String(url));
    asked.push(`${BRIDGES[where.origin] ?? where.origin} ${init.method ?? "GET"} ${where.pathname}`);
    const reply = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
    if (BRIDGES[where.origin] === "lab") return reply({ error: "token-refused", message: "pair again" }, 401);
    if (where.pathname === "/v1/pair") return reply({ bridge: { name: "mac", version: "1.0.0", platform: "darwin" }, origin: "https://alice.github.io" });
    if (where.pathname === "/v1/agents") return reply({ agents, missing: [] });
    return reply({ error: "not-found" }, 404);
  };
  return { asked, restore: () => { globalThis.fetch = real; } };
}
const CLI = ["draft text", "read the repository", "write to the repository", "run code and tests", "use tools"];
const DECLARED = { place: "this machine", capabilities: CLI, models: [{ model: "claude-model", context: 200000 }] };

// TST-1187001 · level: unit · module: MOD-prompt-bar
// guards: THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE; UC-049
// given: a store holding the endpoint complete (place, context, model), the endpoint modelless (no model), and the Bridge mac, which lists its agents claude and codex ready, each with the declaration the Bridge keeps: mac:claude the place "this machine", the capabilities it declares and three models — claude-model with the context 200000, claude-small with 100000, and claude-bare without a context; mac:codex the same place and capabilities and no model
// input: offer.mjs's sessionsOffered(store), and endpointsOffered(store)
// expect: sessionsOffered gives one Connection for each model of mac:claude that names its context, in their order — { name "mac:claude", type "CLI agent", model "claude-model", context 200000, place "this machine", the declared capabilities, route "bridge mac agent claude" } and the same with claude-small and 100000 —, none of claude-bare, which lacks its context, and none of mac:codex, which names no model; after the two requests GET /v1/pair and GET /v1/agents to mac and no other; endpointsOffered gives complete alone
test("sessionsOffered — each ready agent of a stored Bridge whose declaration names a place, once for each model it names with its context", async () => {
  assert.equal(typeof offer.sessionsOffered, "function", "offer.mjs gives sessionsOffered");
  const store = freshStore();
  writeSetting(store, "endpoint:complete", { kind: "openai-compatible", url: "https://models.example/v1", model: "model-x", key: "k", place: "Anthropic, USA", context: 200000 });
  writeSetting(store, "endpoint:modelless", { kind: "openai-compatible", url: "https://models.example/v1", model: "", key: "k", place: "Anthropic, USA", context: 200000 });
  writeSetting(store, "bridge:mac", { address: "http://127.0.0.1:7777", token: "token-mac" });
  const net = bridgesAnswer([{ name: "claude", version: "1", ready: true, loggedIn: true, ...DECLARED, models: [{ model: "claude-model", context: 200000 },
    { model: "claude-small", context: 100000 }, { model: "claude-bare", context: null }] }, { name: "codex", version: "1", ready: true, loggedIn: true, ...DECLARED, models: [] }]);
  try {
    const of = (model, context) => ({ name: "mac:claude", type: "CLI agent", model, context, place: "this machine", capabilities: CLI, route: "bridge mac agent claude" });
    assert.deepEqual(await offer.sessionsOffered(store), [of("claude-model", 200000), of("claude-small", 100000)]);
    assert.deepEqual(net.asked, ["mac GET /v1/pair", "mac GET /v1/agents"]);
  } finally {
    net.restore();
  }
  assert.deepEqual(promptBar.endpointsOffered(store).map((each) => each.name), ["complete"]);
});

// TST-1187002 · level: unit · module: MOD-prompt-bar
// guards: THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE; UC-049
// given: (a) a store that keeps no Bridge; (b) the Bridge mac, which lists its agent claude not ready, with its declaration; (c) the Bridge lab, which refuses its token; (d) the Bridge far, reached through the jump host at a port, while no jump host is stored
// input: offer.mjs's sessionsOffered(store) for each
// expect: (a) no session and no request; (b) no session — an agent that is not ready is not offered —, after mac's two requests; (c) no session, after one request, GET /v1/pair to lab, and nothing thrown; (d) no session, no request, and nothing thrown
test("sessionsOffered — none without a Bridge, none of an agent not ready, none of a Bridge that cannot be tested", async () => {
  assert.equal(typeof offer.sessionsOffered, "function", "offer.mjs gives sessionsOffered");
  const net = bridgesAnswer([{ name: "claude", version: "1", ready: false, loggedIn: false, ...DECLARED }]);
  try {
    assert.deepEqual(await offer.sessionsOffered(freshStore()), []);
    assert.deepEqual(net.asked, []);
    const notReady = freshStore();
    writeSetting(notReady, "bridge:mac", { address: "http://127.0.0.1:7777", token: "token-mac" });
    assert.deepEqual(await offer.sessionsOffered(notReady), []);
    assert.deepEqual(net.asked, ["mac GET /v1/pair", "mac GET /v1/agents"]);
    net.asked.length = 0;
    const refused = freshStore();
    writeSetting(refused, "bridge:lab", { address: "http://127.0.0.1:7778", token: "token-lab" });
    assert.deepEqual(await offer.sessionsOffered(refused), []);
    assert.deepEqual(net.asked, ["lab GET /v1/pair"]);
    net.asked.length = 0;
    const far = freshStore();
    writeSetting(far, "bridge:far", { port: 41001, token: "token-far" });
    assert.deepEqual(await offer.sessionsOffered(far), []);
    assert.deepEqual(net.asked, []);
  } finally {
    net.restore();
  }
});

// TST-20261109303 · level: unit · module: MOD-prompt-bar
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET; UC-010; UC-017
// given: a store holding the coding agent on CI dev-ci (claude, the server's runners, the secret CLAUDE_KEY, the place "Anthropic, USA", two models with their contexts and one without), gpu-ci (claude on the self-hosted runner gpu), no-secret (no secret) and no-place (no place)
// input: ciAgentsOffered(store), and endpointsOffered(store)
// expect: one Connection of type "CI agent" for each model of dev-ci that names its context, route `ci hosted agent claude secret CLAUDE_KEY`, then gpu-ci's with `ci runner:gpu agent claude secret CLAUDE_KEY`; none of no-secret and no-place; the endpoints give none of them
test("ciAgentsOffered — each coding agent on CI with a place and a secret, once for each model it names with its context", () => {
  const store = freshStore();
  const CI = { agent: "claude", runner: "hosted", secret: "CLAUDE_KEY", place: "Anthropic, USA", capabilities: CLI, models: [{ model: "claude-model", context: 200000 }] };
  writeSetting(store, "ci-agent:dev-ci", { ...CI, models: [{ model: "claude-model", context: 200000 }, { model: "claude-small", context: 100000 }, { model: "claude-bare" }] });
  writeSetting(store, "ci-agent:gpu-ci", { ...CI, runner: "gpu" });
  writeSetting(store, "ci-agent:no-secret", { ...CI, secret: "" });
  writeSetting(store, "ci-agent:no-place", { ...CI, place: "" });
  const of = (name, model, context, route) => ({ name, type: "CI agent", model, context, place: "Anthropic, USA", capabilities: CLI, route });
  assert.deepEqual(promptBar.ciAgentsOffered(store), [of("dev-ci", "claude-model", 200000, "ci hosted agent claude secret CLAUDE_KEY"),
    of("dev-ci", "claude-small", 100000, "ci hosted agent claude secret CLAUDE_KEY"), of("gpu-ci", "claude-model", 200000, "ci runner:gpu agent claude secret CLAUDE_KEY")]);
  assert.deepEqual(promptBar.endpointsOffered(store), []);
});
