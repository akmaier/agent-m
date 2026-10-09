// MOD-settings-pages — UC-003 Bridge endpoint alternative (ITM-269).
// Run: node --test tests/mod-settings-pages-bridge-endpoint.test.mjs
//
// Module: MOD-settings-pages
// Level: unit
// Guards: UC-003 alternative 2a; UC-044; CONFIGURATION LIVES IN THE BROWSER;
// A CREDENTIAL IS NEVER PLACED IN A URL; AN UNSUPPORTED ENDPOINT SAYS SO;
// A CLEAR IS A REAL CLEAR; THE PAGE STATES WHAT IT SENDS WHERE.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.parentNode = null; }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  focus() {}
}
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
globalThis.document = { createElement: (name) => new Element(name) };

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const click = async (button) => { button.dispatchEvent(new Event("click")); await new Promise((resolve) => setImmediate(resolve)); };
class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); } get length() { return this.values.size; } key(index) { return [...this.values.keys()][index] ?? null; } }
function freshStore() { Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() }); return openStore("fixture/instance"); }
function endpointRoute() { const route = view.routes.find((candidate) => candidate.name === "endpoints"); assert.ok(route, "view exposes the public endpoints Route"); return route; }
async function render(store, params = {}, navigations = []) { const target = document.createElement("div"); await endpointRoute().render(target, { instance: { repository: "fixture/instance" }, store, go(route, routeParams) { navigations.push({ route, params: routeParams }); } }, params); return target; }
function fill(target, setting, name = "local") {
  byClass(target, "endpoint-name")[0].value = name;
  byClass(target, "endpoint-url")[0].value = setting.url;
  byClass(target, "endpoint-kind")[0].value = setting.kind;
  byClass(target, "endpoint-model")[0].value = setting.model;
  byClass(target, "endpoint-key")[0].value = setting.key;
  byClass(target, "endpoint-through-bridge")[0].checked = true;
  byClass(target, "endpoint-through-bridge")[0].dispatchEvent(new Event("change"));
}
const LOCAL = { url: "http://127.0.0.1:11434/v1", kind: "openai-compatible", model: "local-model", key: "endpoint-key", throughBridge: true };
const ARGS = { name: "local", kind: LOCAL.kind, baseUrl: LOCAL.url, model: LOCAL.model, key: LOCAL.key };
const json = (status, body, headers = {}) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });

// TST-269001
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003 alternative 2a; CONFIGURATION LIVES IN THE BROWSER; THE PAGE STATES WHAT IT SENDS WHERE; A CREDENTIAL IS NEVER PLACED IN A URL
// input/precondition: a paired loopback Bridge and a local endpoint entered on the public endpoints Route
// expected: Save precedes one disclosed Bridge endpoint-test call, whose canonical args contain the endpoint key only in JSON, then the actual answer marks it working
// Planted fault: replacing the Bridge probe with testEndpoint makes the Bridge-route assertion fail.
test("TST-269001: a local endpoint saves then probes only its paired Bridge", async (t) => {
  const store = freshStore(), calls = [];
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    assert.deepEqual(readSetting(store, "endpoint:local"), LOCAL, "failure node: browser store is saved before probe");
    return json(200, { answer: { works: true, model: LOCAL.model } });
  };
  t.after(() => { globalThis.fetch = oldFetch; });
  writeSetting(store, "bridge", { address: "http://127.0.0.1:4711", token: "bridge-token" });
  const navigations = [], target = await render(store, {}, navigations);
  fill(target, LOCAL);
  assert.match(byClass(target, "endpoint-disclosure")[0].textContent, /Bridge|destination/i);
  await click(byClass(target, "endpoint-test")[0]);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "http://127.0.0.1:4711/v1/probes/endpoint-test");
  assert.equal(calls[0].init.headers["x-agent-m-bridge-token"], "bridge-token");
  assert.deepEqual(JSON.parse(calls[0].init.body), { args: ARGS });
  assert.equal(calls[0].url.includes(LOCAL.key), false);
  assert.match(byClass(target, "endpoint-result")[0].textContent, /working/i);
});

// TST-269002
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003 alternative 4b; CONFIGURATION LIVES IN THE BROWSER
// input/precondition: a paired Bridge answers endpoint-test with a provider key refusal
// expected: the provider diagnosis is shown, the endpoint key remains stored, and reload reads the refused key
// Planted fault: replacing the provider diagnosis with generic text makes the provider-message assertion fail.
test("TST-269002: a provider refusal through Bridge remains a stored provider diagnosis", async (t) => {
  const store = freshStore(), oldFetch = globalThis.fetch;
  globalThis.fetch = async () => json(200, { answer: { works: false, diagnosis: { reason: "key refused", message: "Provider says key is invalid.", routes: [] } } });
  t.after(() => { globalThis.fetch = oldFetch; });
  writeSetting(store, "bridge", { address: "http://127.0.0.1:4711", token: "bridge-token" });
  const target = await render(store);
  fill(target, LOCAL);
  await click(byClass(target, "endpoint-test")[0]);
  assert.match(byClass(target, "endpoint-result")[0].textContent, /Provider says key is invalid\./);
  assert.equal(readSetting(store, "endpoint:local").key, LOCAL.key);
  const reloaded = await render(store, { name: "local" });
  assert.equal(byClass(reloaded, "endpoint-key")[0].value, LOCAL.key);
});

// TST-269003
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003 alternative 2a; UC-044; CONFIGURATION LIVES IN THE BROWSER
// input/precondition: no paired Bridge is stored and a local endpoint is completed
// expected: Save retains the endpoint, makes no direct or Bridge request, and offers the actionable pairing handoff without success
// Planted fault: removing the public Bridge setup action makes the handoff assertion fail.
test("TST-269003: absent Bridge setup retains the endpoint and directs the author to pairing", async (t) => {
  const store = freshStore(), oldFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return json(200, {}); };
  t.after(() => { globalThis.fetch = oldFetch; });
  const navigations = [], target = await render(store, {}, navigations);
  fill(target, LOCAL);
  await click(byClass(target, "endpoint-test")[0]);
  assert.deepEqual(readSetting(store, "endpoint:local"), LOCAL);
  assert.equal(calls, 0, "failure node: no fallback reaches the direct endpoint");
  const handoff = byClass(target, "endpoint-bridge-setup")[0];
  assert.ok(handoff, "failure node: absent pairing exposes a Bridge setup action");
  await click(handoff);
  assert.deepEqual(navigations, [{ route: "bridge", params: {} }]);
});

// TST-269004
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003 alternative 2a; UC-044; AN UNSUPPORTED ENDPOINT SAYS SO
// input/precondition: a paired Bridge rejects its token, then an unavailable Bridge gives no answer
// expected: each named Bridge failure is actionable and neither is presented as a provider answer or success
// Planted fault: collapsing TokenRefused into a generic Bridge failure makes the named-failure assertion fail.
test("TST-269004: refused and unavailable Bridges stay distinct from provider diagnoses", async (t) => {
  const store = freshStore(), oldFetch = globalThis.fetch;
  let mode = "refused";
  globalThis.fetch = async () => {
    if (mode === "refused") return json(401, { error: "token-refused" });
    throw new TypeError("Failed to fetch");
  };
  t.after(() => { globalThis.fetch = oldFetch; });
  writeSetting(store, "bridge", { address: "http://127.0.0.1:4711", token: "old-token" });
  let target = await render(store); fill(target, LOCAL); await click(byClass(target, "endpoint-test")[0]);
  assert.match(byClass(target, "endpoint-result")[0].textContent, /refused.*token|token.*refused/i);
  mode = "unavailable";
  target = await render(store, { name: "local" }); await click(byClass(target, "endpoint-test")[0]);
  assert.match(byClass(target, "endpoint-result")[0].textContent, /gave no answer|not running|wrong address/i);
  assert.doesNotMatch(byClass(target, "endpoint-result")[0].textContent, /working/i);
});

// TST-269005
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003 alternative 2a; UC-044 alternative 6a.5; A CREDENTIAL IS NEVER PLACED IN A URL
// input/precondition: an accepted HTTPS Bridge address/token and its separately stored jump-host web login
// expected: the endpoint test uses the HTTPS Bridge, maps canonical args, and puts both credentials only in their distinct headers
// Planted fault: omitting the transient jump-host login when constructing BridgeSettings makes the Basic-header assertion fail.
test("TST-269005: HTTPS Bridge testing reads the separate jump-host login into transient settings", async (t) => {
  const store = freshStore(), oldFetch = globalThis.fetch;
  let call;
  globalThis.fetch = async (url, init = {}) => { call = { url: String(url), init }; return json(200, { answer: { works: true, model: LOCAL.model } }); };
  t.after(() => { globalThis.fetch = oldFetch; });
  writeSetting(store, "bridge", { address: "https://jump.example.test/bridge/local", token: "bridge-token" });
  writeSetting(store, "jump-host", { hostname: "jump.example.test", user: "ssh-user", sshPort: 22, portRange: [40100, 40199], httpsAddress: "https://jump.example.test/bridge/local", login: { user: "web-user", password: "web-password" } });
  const target = await render(store); fill(target, LOCAL); await click(byClass(target, "endpoint-test")[0]);
  assert.equal(call.url, "https://jump.example.test/bridge/local/v1/probes/endpoint-test");
  assert.equal(call.init.headers["x-agent-m-bridge-token"], "bridge-token");
  assert.equal(call.init.headers.Authorization, `Basic ${Buffer.from("web-user:web-password").toString("base64")}`);
  assert.deepEqual(JSON.parse(call.init.body), { args: ARGS });
  assert.equal(call.url.includes("bridge-token") || call.url.includes("web-password") || call.url.includes(LOCAL.key), false);
});
