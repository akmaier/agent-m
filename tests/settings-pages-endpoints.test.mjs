// MOD-settings-pages — the direct endpoint configuration route (ITM-265).
// Run: node --test tests/settings-pages-endpoints.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE; A CREDENTIAL IS NEVER PLACED IN A URL; AN UNSUPPORTED ENDPOINT SAYS SO; A CLEAR IS A REAL CLEAR; NO SECRET IN THE REPOSITORY; EVERY SETTING IS REACHED FROM ONE PAGE; EVERY STEP EXPLAINS ITSELF; THE PAGE STATES WHAT IT SENDS WHERE
// Level: unit
//
// These tests use only MOD-settings-pages' public `view` interface. An endpoint route is a Route, so every interaction
// goes through Route.render(target, context, params), uses the public browser-store format, and drives real controls.
// The browser DOM and store stand-ins follow tests/settings-pages-add-product.test.mjs; endpoint replies are constructed.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.disabled = false; this.checked = false; this.parentNode = null; }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  focus() {}
}
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
const document = { createElement: (name) => new Element(name) };
globalThis.document = document;

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const byTag = (root, name) => descendants(root, (node) => node.localName === name);
const type = (field, value) => { field.value = value; field.dispatchEvent(new Event("input")); };
const click = async (button) => { button.dispatchEvent(new Event("click")); await new Promise((resolve) => setImmediate(resolve)); };

class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); } get length() { return this.values.size; } key(index) { return [...this.values.keys()][index] ?? null; } }
function freshStore() { Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() }); return openStore("fixture/instance"); }
const contextOf = (store, { host = {}, navigations = [] } = {}) => ({
  page: "review", instance: { repository: "fixture/instance", host }, product: null, store,
  go(route, params) { navigations.push({ route, params }); },
});
async function render(store, params = {}, options = {}) { const target = document.createElement("div"); await endpointsRoute().render(target, contextOf(store, options), params); return target; }
async function renderSettings(store, options = {}) { const target = document.createElement("div"); await settingsRoute().render(target, contextOf(store, options), {}); return target; }
function scripted(responses, calls) { const remaining = [...responses]; return async (url, init = {}) => { calls.push({ url: String(url), init }); const next = remaining.shift(); if (!next) throw new Error("unexpected endpoint request"); return new Response(JSON.stringify(next.body ?? {}), { status: next.status, headers: { "content-type": "application/json" } }); }; }

const ENDPOINT = { url: "https://models.example.test/v1", kind: "openai-compatible", model: "tiny-model", key: "secret-key", throughBridge: false };
const BRIDGED = { url: "http://127.0.0.1:11434", kind: "openai-compatible", model: "local-model", throughBridge: true };

function endpointsRoute() {
  const route = view.routes.find((candidate) => candidate.name === "endpoints");
  assert.ok(route, "view exposes the public endpoints Route");
  assert.equal(route.entry, "settings");
  assert.equal(typeof route.render, "function");
  return route;
}

function settingsRoute() {
  const route = view.routes.find((candidate) => candidate.name === "settings");
  assert.ok(route, "view exposes the public settings Route");
  assert.equal(route.entry, "settings");
  assert.equal(typeof route.render, "function");
  return route;
}

// TST-265001
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003; CONFIGURATION LIVES IN THE BROWSER
// given: an empty browser store and a constructed successful endpoint answer
// input: the author fills the public endpoints Route and presses Test
// expect: the Route stores endpoint:<name> before exactly one short request, then shows the configured model working
test("TST-265001: direct endpoint saves before its one short test", async () => {
  const store = freshStore(), calls = [], oldFetch = globalThis.fetch;
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    assert.deepEqual(readSetting(store, "endpoint:campus"), ENDPOINT, "the configuration is stored when fetch starts");
    return new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), { status: 200 });
  };
  try {
    const target = await render(store);
    type(byClass(target, "endpoint-name")[0], "campus"); type(byClass(target, "endpoint-url")[0], ENDPOINT.url);
    type(byClass(target, "endpoint-model")[0], ENDPOINT.model); type(byClass(target, "endpoint-key")[0], ENDPOINT.key);
    await click(byClass(target, "endpoint-test")[0]);
    assert.deepEqual(readSetting(store, "endpoint:campus"), ENDPOINT, "save precedes the request");
    assert.equal(calls.length, 1); assert.equal(calls[0].url, `${ENDPOINT.url}/chat/completions`);
    assert.equal(calls[0].init.headers.Authorization, `Bearer ${ENDPOINT.key}`);
    assert.match(target.textContent, /working|tiny-model/i);
  } finally { globalThis.fetch = oldFetch; }
});

// TST-265002
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003 alternative 4a; AN UNSUPPORTED ENDPOINT SAYS SO
// given: a constructed browser refusal that names cross-origin blocking and CI/Bridge routes
// input: the author presses Test on the public endpoints Route
// expect: the Route shows the observed reason and both named alternatives
test("TST-265002: browser refusal is shown with CI and Bridge alternatives", async () => {
  const store = freshStore(), oldFetch = globalThis.fetch, oldWindow = globalThis.window;
  globalThis.window = {}; globalThis.fetch = async () => { throw new TypeError("Blocked by CORS policy"); };
  try { const target = await render(store); type(byClass(target, "endpoint-name")[0], "campus"); type(byClass(target, "endpoint-url")[0], ENDPOINT.url); type(byClass(target, "endpoint-model")[0], ENDPOINT.model); await click(byClass(target, "endpoint-test")[0]); assert.match(target.textContent, /Blocked by CORS policy/); assert.match(target.textContent, /CI/); assert.match(target.textContent, /Bridge/); } finally { globalThis.fetch = oldFetch; globalThis.window = oldWindow; }
});

// TST-265003
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003 alternative 4b; CONFIGURATION LIVES IN THE BROWSER
// given: a key that a constructed provider response refuses
// input: save and test, then reload the public endpoints Route
// expect: the provider message is visible and the stored key remains until the author changes or clears it
test("TST-265003: a refused key remains stored and reloads", async () => {
  const store = freshStore(), oldFetch = globalThis.fetch;
  globalThis.fetch = scripted([{ status: 401, body: { error: { message: "Invalid API key." } } }], []);
  try { let target = await render(store); type(byClass(target, "endpoint-name")[0], "campus"); type(byClass(target, "endpoint-url")[0], ENDPOINT.url); type(byClass(target, "endpoint-model")[0], ENDPOINT.model); type(byClass(target, "endpoint-key")[0], ENDPOINT.key); await click(byClass(target, "endpoint-test")[0]); assert.match(target.textContent, /Invalid API key/); assert.equal(readSetting(store, "endpoint:campus").key, ENDPOINT.key); target = await render(store, { name: "campus" }); assert.equal(byClass(target, "endpoint-key")[0].value, ENDPOINT.key); } finally { globalThis.fetch = oldFetch; }
});

// TST-265004
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003 alternative 2b; A CLEAR IS A REAL CLEAR
// given: endpoint:<name> is stored in localStorage and the endpoint form is rendered
// input: the author presses Clear in the public endpoints Route
// expect: the form is empty and the actual endpoint:<name> browser-store entry is removed
test("TST-265004: Clear removes the stored endpoint and empties the form", async () => {
  const store = freshStore(); writeSetting(store, "endpoint:campus", ENDPOINT); const target = await render(store, { name: "campus" });
  await click(byClass(target, "endpoint-clear")[0]); assert.equal(readSetting(store, "endpoint:campus"), null); assert.equal(byClass(target, "endpoint-url")[0].value, "");
});

// TST-265005
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003 alternative 2a; AN UNSUPPORTED ENDPOINT SAYS SO
// given: a stored throughBridge endpoint for a local model server
// input: the author opens the public endpoints Route and presses Test
// expect: no direct request reaches its model, the setting is retained, and the missing Bridge setup is named
test("TST-265005: a Bridge endpoint is retained and never called directly", async () => {
  const store = freshStore(), calls = [], oldFetch = globalThis.fetch; writeSetting(store, "endpoint:local", BRIDGED); globalThis.fetch = scripted([], calls);
  try { const target = await render(store, { name: "local" }); await click(byClass(target, "endpoint-test")[0]); assert.equal(calls.length, 0); assert.deepEqual(readSetting(store, "endpoint:local"), BRIDGED); assert.match(target.textContent, /Bridge.*setup|setup.*Bridge/i); } finally { globalThis.fetch = oldFetch; }
});

// TST-265006
// Module: MOD-settings-pages
// Level: unit
// guards: UC-003; A CREDENTIAL IS NEVER PLACED IN A URL
// given: an endpoint form with an absent optional key
// input: the author saves and tests it through the public endpoints Route
// expect: the store keeps no key property and the call boundary receives EndpointConfig key null, never a URL credential
test("TST-265006: an absent key maps to null at the direct-call boundary", async () => {
  const store = freshStore(), calls = [], oldFetch = globalThis.fetch; globalThis.fetch = scripted([{ status: 200, body: { choices: [] } }], calls);
  try { const target = await render(store); type(byClass(target, "endpoint-name")[0], "public"); type(byClass(target, "endpoint-url")[0], ENDPOINT.url); type(byClass(target, "endpoint-model")[0], ENDPOINT.model); await click(byClass(target, "endpoint-test")[0]); assert.equal(Object.hasOwn(readSetting(store, "endpoint:public"), "key"), false); assert.equal(calls[0].init.headers.Authorization, undefined); } finally { globalThis.fetch = oldFetch; }
});

// TST-265007
// Module: MOD-settings-pages
// Level: unit
// guards: NO SECRET IN THE REPOSITORY; A CREDENTIAL IS NEVER PLACED IN A URL; THE PAGE STATES WHAT IT SENDS WHERE
// given: an endpoint key in the real password control
// input: the public endpoints Route renders before the author saves
// expect: destination disclosure precedes the action, the key is hidden, and neither a URL nor a repository writer receives it
test("TST-265007: disclosure precedes a hidden endpoint key without repository or navigation leakage", async () => {
  const store = freshStore(), writes = [], navigations = [], oldFetch = globalThis.fetch;
  const host = {
    commitFiles(...args) { writes.push({ operation: "commitFiles", args }); },
    startWorkflow(...args) { writes.push({ operation: "startWorkflow", args }); },
  };
  document.cookie = "";
  globalThis.fetch = scripted([{ status: 200, body: { choices: [{ message: { content: "ok" } }] } }], []);
  try {
    const target = await render(store, {}, { host, navigations });
    const key = byClass(target, "endpoint-key")[0], disclosure = byClass(target, "endpoint-disclosure")[0];
    const action = byClass(target, "endpoint-test")[0];
    const ordered = descendants(target, (node) => node === disclosure || node === action);
    assert.equal(key.type, "password");
    assert.ok(ordered.indexOf(disclosure) >= 0 && ordered.indexOf(disclosure) < ordered.indexOf(action), "the rendered disclosure precedes Test");
    assert.ok(byTag(target, "a").every((link) => !String(link.href).includes(ENDPOINT.key)), "rendered link destinations exclude the key");
    assert.equal(target.textContent.includes(ENDPOINT.key), false, "the rendered page does not disclose the key");
    type(byClass(target, "endpoint-name")[0], "campus"); type(byClass(target, "endpoint-url")[0], ENDPOINT.url);
    type(byClass(target, "endpoint-model")[0], ENDPOINT.model); type(key, ENDPOINT.key); await click(action);
    assert.deepEqual(readSetting(store, "endpoint:campus"), ENDPOINT, "save writes only the browser-store endpoint setting");
    assert.deepEqual(writes, [], "render, save, and test make no repository write");
    assert.deepEqual(navigations, [], "render, save, and test do not navigate away");
    assert.equal(document.cookie, "", "render, save, and test set no cookie");
  } finally { globalThis.fetch = oldFetch; }
});

// TST-265008
// Module: MOD-settings-pages
// Level: unit
// guards: THE SHARED PAGES ORIGIN IS DISCLOSED; EVERY STEP EXPLAINS ITSELF
// given: the public endpoints Route for an instance whose Pages owner is fixture
// input: the author opens the Route before entering or storing a key
// expect: the shared-origin disclosure precedes Save and test, and the registered endpoint explanations are folded
test("TST-265008: endpoint storage is preceded by its Pages-origin notice and folded explanations", async () => {
  const target = await render(freshStore());
  const action = byClass(target, "endpoint-test")[0];
  const disclosure = byClass(target, "endpoint-shared-origin")[0];
  const ordered = descendants(target, (node) => node === disclosure || node === action);
  assert.match(disclosure.textContent, /fixture\.github\.io/);
  assert.ok(ordered.indexOf(disclosure) >= 0 && ordered.indexOf(disclosure) < ordered.indexOf(action), "the shared-origin notice precedes storage");
  const details = byTag(target, "details");
  assert.equal(details.length, 7, "every endpoint field and action has its registered folded explanation");
  assert.ok(details.every((folded) => byTag(folded, "summary").some((summary) => summary.textContent === "What is this?")));
});

// TST-265009
// Module: MOD-settings-pages
// Level: unit
// guards: A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: an endpoint whose browser-store record contains a key
// input: the author reloads the public endpoints Route and presses Show
// expect: the key begins in a password field and is revealed in full only after Show
test("TST-265009: a stored endpoint key stays hidden until Show", async () => {
  const store = freshStore();
  writeSetting(store, "endpoint:campus", ENDPOINT);
  const target = await render(store, { name: "campus" });
  const key = byClass(target, "endpoint-key")[0], show = byClass(target, "endpoint-show")[0];
  assert.equal(key.type, "password");
  assert.equal(key.value, ENDPOINT.key);
  await click(show);
  assert.equal(key.type, "text");
  assert.equal(key.value, ENDPOINT.key);
});

// TST-265010
// Module: MOD-settings-pages
// Level: unit
// guards: EVERY SETTING IS REACHED FROM ONE PAGE; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: an instance browser store with a canonical endpoint:campus record and a second instance with another endpoint
// input: the person opens the public settings Route and presses Show for campus
// expect: Settings lists campus from the canonical store enumeration, hides its key first, and exposes no other-instance endpoint
test("TST-265010: Settings lists its stored endpoint with a hidden key and Show", async () => {
  const store = freshStore();
  writeSetting(store, "endpoint:campus", ENDPOINT);
  const other = openStore("other/instance");
  writeSetting(other, "endpoint:other", { ...ENDPOINT, model: "other-model" });
  const target = await renderSettings(store);
  assert.match(target.textContent, /Endpoint: campus/);
  assert.doesNotMatch(target.textContent, /other-model/);
  const key = byClass(target, "settings-endpoint-key")[0], show = byClass(target, "settings-endpoint-show")[0];
  assert.equal(key.type, "password");
  assert.equal(key.value, ENDPOINT.key);
  await click(show);
  assert.equal(key.type, "text");
});

// TST-265011
// Module: MOD-settings-pages
// Level: unit
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a stored direct endpoint and a constructed successful endpoint answer
// input: the person presses Test, then Change on the public settings Route
// expect: Test makes one mapped direct request without changing the stored record, and Change opens its exact named endpoint route
test("TST-265011: Settings tests a stored direct endpoint and changes its named route", async () => {
  const store = freshStore(), calls = [], navigations = [], oldFetch = globalThis.fetch;
  writeSetting(store, "endpoint:campus", ENDPOINT);
  globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), init }); assert.deepEqual(readSetting(store, "endpoint:campus"), ENDPOINT); return new Response(JSON.stringify({ choices: [] }), { status: 200 }); };
  try {
    const target = await renderSettings(store, { navigations });
    await click(byClass(target, "settings-endpoint-test")[0]);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${ENDPOINT.url}/chat/completions`);
    assert.equal(calls[0].init.headers.Authorization, `Bearer ${ENDPOINT.key}`);
    assert.match(target.textContent, /working|tiny-model/i);
    await click(byClass(target, "settings-endpoint-change")[0]);
    assert.deepEqual(navigations, [{ route: "endpoints", params: { name: "campus" } }]);
  } finally { globalThis.fetch = oldFetch; }
});

// TST-265012
// Module: MOD-settings-pages
// Level: unit
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; A CLEAR IS A REAL CLEAR
// given: two endpoints stored for one instance
// input: the person presses Clear beside campus on the public settings Route
// expect: the actual campus entry is removed, its line disappears, and local remains stored and listed
test("TST-265012: Settings Clear removes only the selected endpoint entry", async () => {
  const store = freshStore();
  writeSetting(store, "endpoint:campus", ENDPOINT);
  writeSetting(store, "endpoint:local", BRIDGED);
  const target = await renderSettings(store);
  const lines = byClass(target, "settings-endpoint");
  const campus = lines.find((line) => /Endpoint: campus/.test(line.textContent));
  await click(byClass(campus, "settings-endpoint-clear")[0]);
  assert.equal(readSetting(store, "endpoint:campus"), null);
  assert.deepEqual(readSetting(store, "endpoint:local"), BRIDGED);
  assert.doesNotMatch(target.textContent, /Endpoint: campus/);
  assert.match(target.textContent, /Endpoint: local/);
});

// TST-265013
// Module: MOD-settings-pages
// Level: unit
// guards: EVERY STEP EXPLAINS ITSELF
// given: a browser store with one canonical endpoint setting
// input: the person opens the public Settings Route
// expect: the browser section and its stored endpoint line each expose a registered folded explanation
test("TST-265013: Settings explains its browser section and each stored endpoint line", async () => {
  const store = freshStore();
  writeSetting(store, "endpoint:campus", ENDPOINT);
  const target = await renderSettings(store);
  const browserExplanation = byClass(target, "settings-browser-explanation");
  const line = byClass(target, "settings-endpoint")[0];
  const lineExplanation = byClass(line, "settings-endpoint-explanation");
  assert.equal(browserExplanation.length, 1, "the browser section has its folded explanation");
  assert.equal(lineExplanation.length, 1, "the stored endpoint line has its folded explanation");
  const folded = [...byTag(browserExplanation[0], "details"), ...byTag(lineExplanation[0], "details")];
  assert.equal(folded.length, 2, "both explanations use the public folded control");
  assert.ok(folded.every((detail) => byTag(detail, "summary").some((summary) => summary.textContent === "What is this?")));
});

// TST-265014
// Module: MOD-settings-pages
// Level: unit
// guards: THE PAGE STATES WHAT IT SENDS WHERE; A CREDENTIAL IS NEVER PLACED IN A URL
// given: a stored direct endpoint in the public Settings Route
// input: the person reads its line before pressing Test
// expect: the line discloses the stored destination and what the request sends before its Test control
test("TST-265014: Settings discloses an endpoint Test destination before its control", async () => {
  const store = freshStore();
  writeSetting(store, "endpoint:campus", ENDPOINT);
  const target = await renderSettings(store);
  const line = byClass(target, "settings-endpoint")[0];
  const disclosure = byClass(line, "settings-endpoint-disclosure")[0];
  const action = byClass(line, "settings-endpoint-test")[0];
  const ordered = descendants(line, (node) => node === disclosure || node === action);
  assert.match(disclosure.textContent, new RegExp(ENDPOINT.url));
  assert.match(disclosure.textContent, /short test request/);
  assert.match(disclosure.textContent, /authorisation header/);
  assert.ok(ordered.indexOf(disclosure) >= 0 && ordered.indexOf(disclosure) < ordered.indexOf(action), "the disclosure precedes Test");
});

// TST-265015
// Module: MOD-settings-pages
// Level: unit
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; A CLEAR IS A REAL CLEAR
// given: a stored direct endpoint and another endpoint with independent test metadata
// input: the person tests campus successfully, reloads Settings, then clears campus
// expect: the successful result and date persist on campus, then Clear removes campus and its metadata only
test("TST-265015: Settings persists a successful endpoint test and clears its metadata", async () => {
  const store = freshStore(), oldFetch = globalThis.fetch;
  writeSetting(store, "endpoint:campus", ENDPOINT);
  writeSetting(store, "endpoint:local", BRIDGED);
  writeSetting(store, "last-test:endpoint:local", { at: "2026-10-07T10:00:00.000Z", outcome: "working" });
  globalThis.fetch = scripted([{ status: 200, body: { choices: [] } }], []);
  try {
    let target = await renderSettings(store);
    await click(byClass(target, "settings-endpoint-test")[0]);
    const recorded = readSetting(store, "last-test:endpoint:campus");
    assert.equal(recorded.outcome, "working");
    assert.ok(Number.isFinite(Date.parse(recorded.at)), "the successful test keeps an ISO date");
    target = await renderSettings(store);
    assert.match(target.textContent, /works/i);
    assert.match(target.textContent, new RegExp(recorded.at));
    const campus = byClass(target, "settings-endpoint").find((line) => /Endpoint: campus/.test(line.textContent));
    await click(byClass(campus, "settings-endpoint-clear")[0]);
    assert.equal(readSetting(store, "endpoint:campus"), null);
    assert.equal(readSetting(store, "last-test:endpoint:campus"), null);
    assert.deepEqual(readSetting(store, "endpoint:local"), BRIDGED);
    assert.deepEqual(readSetting(store, "last-test:endpoint:local"), { at: "2026-10-07T10:00:00.000Z", outcome: "working" });
  } finally { globalThis.fetch = oldFetch; }
});

// TST-265016
// Module: MOD-settings-pages
// Level: unit
// guards: EVERY SETTING IS REACHED FROM ONE PAGE
// given: one endpoint that has never been tested and one whose test was refused
// input: the person opens the public Settings Route
// expect: the lines state the accepted not-set and refused outcomes without exposing either key
test("TST-265016: Settings identifies untested and refused endpoint states", async () => {
  const store = freshStore();
  writeSetting(store, "endpoint:new", ENDPOINT);
  writeSetting(store, "endpoint:refused", { ...ENDPOINT, key: "other-secret" });
  writeSetting(store, "last-test:endpoint:refused", { at: "2026-10-07T10:00:00.000Z", outcome: "refused" });
  const target = await renderSettings(store);
  const pending = byClass(target, "settings-endpoint").find((line) => /Endpoint: new/.test(line.textContent));
  const refused = byClass(target, "settings-endpoint").find((line) => /Endpoint: refused/.test(line.textContent));
  assert.match(byClass(pending, "settings-endpoint-status")[0].textContent, /not set/i);
  assert.match(byClass(refused, "settings-endpoint-status")[0].textContent, /^Refused\.$/);
  assert.equal(target.textContent.includes("other-secret"), false);
});
