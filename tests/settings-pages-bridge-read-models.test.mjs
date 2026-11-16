// Read models on the route `bridge` — docs/architecture/MOD-settings-pages.md, `bridge`: "beside its models *Read models*, MOD-bridge-client's `probe` of the kind
// `agent-models` for that agent, whose models replace the session's model rows not yet saved, one row each with its context where the agent reports one, and which saves
// nothing; where the Bridge answers a `reason` or cannot be reached, the page says that nothing could be read and why, and the rows stay as they were (UC-044 5a)".
// Run: node --test tests/settings-pages-bridge-read-models.test.mjs
//
// Module: MOD-settings-pages
// Guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// Level: unit
//
// These tests use only MOD-settings-pages' public `view`: the route `bridge` is drawn with Route.render(target, context, params) in the small DOM of tests/site-frame-dom.mjs,
// over a Map-backed localStorage and a stand-in for `fetch` that answers as a Bridge does — GET /v1/pair, GET /v1/agents listing claude ready with one kept model, and
// POST /v1/probes/agent-models with the answer the test gives (MOD-bridge-http) — and records every request; as tests/settings-pages-bridge-sessions.test.mjs, it adds
// querySelector for a selector of one class. Each test states its input and its expected result before it runs (given / input / expect). Nothing reaches the network.
// The counter-proofs are in the pull request.

import { installDocument, byClass, click, until } from "./settings-pages-harness.mjs";
import test from "node:test";
import assert from "node:assert/strict";

installDocument();
{
  const { Element } = globalThis.window;
  Element.prototype.querySelectorAll = function querySelectorAll(selector) {
    const name = /^\.([\w-]+)$/.exec(selector)?.[1];
    if (!name) throw new Error(`this fixture answers a selector of one class only: ${selector}`);
    return byClass(this, name);
  };
  Element.prototype.querySelector = function querySelector(selector) { return this.querySelectorAll(selector)[0] ?? null; };
}
const { view } = await import("../src/settings-pages/index.mjs");
const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");

class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); }
  key(at) { return [...this.values.keys()][at] ?? null; } get length() { return this.values.size; } }
const ORIGIN = "https://published.example.test";
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const KEPT = { place: "this machine", capabilities: ["draft text"], models: [{ model: "old-model", context: 1000 }] };

// A Bridge at http://127.0.0.1:4711 that answers agent-models with `read` — an answer, or a function that throws to stand for a Bridge that cannot be reached.
function stand(t, read) {
  const calls = [];
  const prior = globalThis.fetch, priorLocation = Object.getOwnPropertyDescriptor(globalThis, "location");
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    const { pathname } = new URL(String(url)), method = String(init.method ?? "GET").toUpperCase();
    if (method === "GET" && pathname === "/v1/pair") return json({ bridge: { name: "Bridge", version: "1", platform: "linux" }, origin: ORIGIN });
    if (method === "GET" && pathname === "/v1/agents") return json({ agents: [{ name: "claude", version: "2", ready: true, loggedIn: true, ...KEPT }], missing: [] });
    if (method === "POST" && pathname === "/v1/probes/agent-models") { if (typeof read === "function") return read(); return json({ answer: read }); }
    return json({ error: "not-found", message: pathname }, 404);
  };
  Object.defineProperty(globalThis, "location", { configurable: true, value: { origin: ORIGIN } });
  t.after(() => { globalThis.fetch = prior; if (priorLocation) Object.defineProperty(globalThis, "location", priorLocation); else delete globalThis.location; });
  return calls;
}
// The route drawn for a browser that keeps the Bridge laptop, tested; -> the form of claude.
async function sessionForm() {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("fixture/instance");
  writeSetting(store, "bridge:laptop", { address: "http://127.0.0.1:4711", token: "laptop-token" });
  const target = document.createElement("div");
  document.body.append(target);
  await view.routes.find((route) => route.name === "bridge").render(target, { instance: { repository: "fixture/instance" }, store, go() {} }, {});
  await click(byClass(target, "bridge-kept-test")[0]);
  await until(() => byClass(target, "bridge-session").length > 0, "the session of claude");
  return byClass(target, "bridge-session")[0];
}
const rows = (form) => byClass(form, "bridge-session-model-row").map((row) => [byClass(row, "bridge-session-model")[0].value, byClass(row, "bridge-session-context")[0].value]);
const readButton = (form) => byClass(form, "bridge-session-read-models")[0];

// TST-20261116161 · level: unit · module: MOD-settings-pages
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: the tested Bridge laptop with the form of claude, its model rows [old-model, 1000]; the Bridge reads claude-opus-5-5 with context 1000000 and claude-haiku-5 with none
// input: Read models in claude's form pressed
// expect: Read models stands in the form, labelled "Read models"; one POST to http://127.0.0.1:4711/v1/probes/agent-models with the token and { args: { agent: "claude" } }; the model rows then are
//         [claude-opus-5-5, 1000000] and [claude-haiku-5, ""] — in place of the row held before, the context empty where none was read —; no PUT was sent (reading saves nothing)
test("TST-20261116161: Read models puts the models the Bridge reads in place of the session's model rows and saves nothing", async (t) => {
  const calls = stand(t, { models: [{ model: "claude-opus-5-5", context: 1000000 }, { model: "claude-haiku-5", context: null }] });
  const form = await sessionForm();
  assert.deepEqual(rows(form), [["old-model", "1000"]], "known positive: the kept model fills the rows");
  const read = readButton(form);
  assert.ok(read, "Read models stands in the session's form");
  assert.equal(read.textContent, "Read models");
  await click(read);
  await until(() => rows(form)[0]?.[0] === "claude-opus-5-5", "the models read");
  const probes = calls.filter((call) => call.url.endsWith("/v1/probes/agent-models"));
  assert.deepEqual(probes.map((call) => [call.url, call.init.method, call.init.headers["x-agent-m-bridge-token"], JSON.parse(call.init.body)]),
    [["http://127.0.0.1:4711/v1/probes/agent-models", "POST", "laptop-token", { args: { agent: "claude" } }]]);
  assert.deepEqual(rows(form), [["claude-opus-5-5", "1000000"], ["claude-haiku-5", ""]]);
  assert.equal(calls.some((call) => call.init.method === "PUT"), false, "reading saves nothing");
});

// TST-20261116162 · level: unit · module: MOD-settings-pages
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: the same form, its model rows [old-model, 1000]; in turn a Bridge that answers agent-models with { reason: "claude's catalogue is missing" }, and one whose probe cannot be reached
//        (fetch fails with "connection reset")
// input: Read models pressed, on each
// expect: the form says that nothing could be read, naming "claude's catalogue is missing", then naming that the Bridge was not reached; the model rows stay [old-model, 1000] each time; no PUT was sent;
//         counter-proof: TST-20261116161, with models read, replaces the rows
test("TST-20261116162: where the Bridge answers a reason or cannot be reached, the form says so and why, and the rows stay", async (t) => {
  const reasons = stand(t, { reason: "claude's catalogue is missing" });
  const answered = await sessionForm();
  await click(readButton(answered));
  await until(() => /could be read/i.test(answered.textContent), "the form's word on the reading");
  assert.match(answered.textContent, /nothing could be read/i);
  assert.match(answered.textContent, /claude's catalogue is missing/);
  assert.deepEqual(rows(answered), [["old-model", "1000"]]);
  assert.equal(reasons.some((call) => call.init.method === "PUT"), false);

  const unreached = stand(t, () => { throw new TypeError("connection reset"); });
  const form = await sessionForm();
  await click(readButton(form));
  await until(() => /could be read/i.test(form.textContent), "the form's word on the reading");
  assert.match(form.textContent, /nothing could be read/i);
  assert.match(form.textContent, /not reached/i);
  assert.ok(unreached.some((call) => call.url.endsWith("/v1/probes/agent-models")), "known positive: the probe was sent");
  assert.deepEqual(rows(form), [["old-model", "1000"]]);
  assert.equal(unreached.some((call) => call.init.method === "PUT"), false);
});
