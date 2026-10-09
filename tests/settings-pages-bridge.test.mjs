// MOD-settings-pages — Bridge pairing and HTTPS settings.
// Level: unit
// Guards: UC-044; THE BRIDGE IS PAIRED ONCE; CONFIGURATION LIVES IN THE BROWSER; A STORED SECRET IS HIDDEN UNTIL SHOWN;
// A CLEAR IS A REAL CLEAR; THE SHARED PAGES ORIGIN IS DISCLOSED; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS;
// A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN.

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
function contextOf(store, navigations = []) { return { instance: { repository: "fixture/instance" }, store, go(route, params) { navigations.push({ route, params }); } }; }
function bridgeRoute() { const route = view.routes.find((candidate) => candidate.name === "bridge"); assert.ok(route, "view exposes the public Bridge Route"); return route; }
function settingsRoute() { const route = view.routes.find((candidate) => candidate.name === "settings"); assert.ok(route, "view exposes the public Settings Route"); return route; }
async function renderBridge(store, params = {}, navigations = []) { const target = document.createElement("div"); await bridgeRoute().render(target, contextOf(store, navigations), params); return target; }
async function renderSettings(store, navigations = []) { const target = document.createElement("div"); await settingsRoute().render(target, contextOf(store, navigations)); return target; }

// TST-280001
// Module: MOD-settings-pages
// Guards: UC-044; THE BRIDGE IS PAIRED ONCE; CONFIGURATION LIVES IN THE BROWSER; A STORED SECRET IS HIDDEN UNTIL SHOWN;
// A CLEAR IS A REAL CLEAR; THE SHARED PAGES ORIGIN IS DISCLOSED.
// input/precondition: an empty browser store and a successful copied-token pair response.
// expected: the public Bridge Route discloses the shared Pages origin before pairing, stores only pair's returned
// BridgeSettings, reloads them for Change, hides the token until Show, and Clear removes the actual store entry.
test("the public Bridge route pairs, reloads, hides and really clears Bridge settings", async () => {
  const store = freshStore();
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url: String(url), init }); return new Response("{}", { status: 200 }); };
  const target = await renderBridge(store);
  const [address] = byClass(target, "bridge-address");
  const [token] = byClass(target, "bridge-token");
  const [pair] = byClass(target, "bridge-pair");
  assert.match(target.textContent, /https:\/\/fixture\.github\.io/, "the shared origin is disclosed before storage and send");
  assert.equal(token.type, "password", "a copied token starts hidden");
  address.value = "http://127.0.0.1:4711";
  token.value = "copied-token";
  await click(pair);
  assert.deepEqual(readSetting(store, "bridge"), { address: "http://127.0.0.1:4711", token: "copied-token" }, "only the successful pair return is stored");
  assert.deepEqual(calls.map((call) => call.url), ["http://127.0.0.1:4711/v1/pair"]);
  const navigations = [];
  const settings = await renderSettings(store, navigations);
  await click(byClass(settings, "settings-bridge-change")[0]);
  assert.deepEqual(navigations, [{ route: "bridge", params: {} }], "Change returns to the Bridge Route");
  const reloaded = await renderBridge(store);
  assert.equal(byClass(reloaded, "bridge-address")[0].value, "http://127.0.0.1:4711", "the Bridge Route reloads stored settings after Change");
  const show = byClass(reloaded, "bridge-show")[0];
  await click(show);
  assert.equal(byClass(reloaded, "bridge-token")[0].type, "text", "Show alone reveals the stored token");
  await click(byClass(reloaded, "bridge-clear")[0]);
  assert.equal(readSetting(store, "bridge"), null, "Clear removes the Bridge entry from browser storage");
  const explained = byClass(target, "explain");
  assert.equal(explained.filter((node) => /What is this\?/.test(node.textContent)).length, 2, "Pairing and HTTPS configuration each carry a folded explanation");
});

// TST-280002
// Module: MOD-settings-pages
// Guards: UC-044; THE BRIDGE IS PAIRED ONCE; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS;
// A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST; THE JUMP HOST FORWARDS TO A BRIDGE ONLY AFTER ITS OWN LOGIN;
// A STORED SECRET IS HIDDEN UNTIL SHOWN.
// input/precondition: a Bridge refuses a copied token, then a trusted HTTPS jump-host address and its own login are entered.
// expected: pair reports the named refusal without storing success; saving HTTPS settings stores no bridge endpoint
// request, and keeps jump-host login separate from the Bridge address and token.
test("the Bridge route names a refused pair and saves HTTPS jump-host access without a hidden request", async () => {
  const store = freshStore();
  const calls = [];
  globalThis.fetch = async (url) => { calls.push(String(url)); return new Response("{}", { status: 401 }); };
  const refused = await renderBridge(store);
  byClass(refused, "bridge-address")[0].value = "http://127.0.0.1:4711";
  byClass(refused, "bridge-token")[0].value = "wrong-token";
  await click(byClass(refused, "bridge-pair")[0]);
  assert.match(byClass(refused, "bridge-result")[0].textContent, /refused/i, "a token refusal names the actionable failure");
  assert.equal(readSetting(store, "bridge"), null, "a refused pair never creates a success setting");
  globalThis.fetch = async () => { throw new TypeError("network unreadable"); };
  const unreadable = await renderBridge(store);
  byClass(unreadable, "bridge-address")[0].value = "http://127.0.0.1:4711";
  byClass(unreadable, "bridge-token")[0].value = "copied-token";
  await click(byClass(unreadable, "bridge-pair")[0]);
  assert.match(byClass(unreadable, "bridge-result")[0].textContent, /gave no answer/i, "an unreadable Bridge response names the action to take");
  globalThis.fetch = async (url) => { calls.push(String(url)); return new Response("{}", { status: 200 }); };
  const https = await renderBridge(store);
  byClass(https, "jump-host-name")[0].value = "jump.example.test";
  byClass(https, "jump-host-user")[0].value = "alice";
  byClass(https, "jump-host-https-address")[0].value = "https://jump.example.test/bridge/demo";
  byClass(https, "jump-host-bridge-token")[0].value = "https-copied-token";
  byClass(https, "jump-host-login-user")[0].value = "web-user";
  byClass(https, "jump-host-login-password")[0].value = "web-password";
  await click(byClass(https, "jump-host-save")[0]);
  assert.deepEqual(readSetting(store, "jump-host"), { hostname: "jump.example.test", user: "alice", sshPort: 22, portRange: [40100, 40199], httpsAddress: "https://jump.example.test/bridge/demo", login: { user: "web-user", password: "web-password" } });
  assert.deepEqual(readSetting(store, "bridge"), { address: "https://jump.example.test/bridge/demo", token: "https-copied-token" }, "the saved HTTPS Bridge address and copied token are separate from its jump-host login");
  assert.match(byClass(https, "jump-host-result")[0].textContent, /untested/i, "HTTPS configuration says it remains untested");
  const saved = await renderBridge(store);
  assert.equal(byClass(saved, "jump-host-bridge-token")[0].value, "https-copied-token", "HTTPS token reloads from the separate Bridge setting");
  assert.equal(byClass(saved, "jump-host-bridge-token")[0].type, "password", "reloaded HTTPS token remains hidden until Show");
  await click(byClass(saved, "jump-host-bridge-show")[0]);
  assert.equal(byClass(saved, "jump-host-bridge-token")[0].type, "text", "Show reveals the copied HTTPS token only on request");
  assert.deepEqual(calls, ["http://127.0.0.1:4711/v1/pair"], "Save HTTPS configuration makes no hidden endpoint request");
  const navigations = [];
  const settings = await renderSettings(store, navigations);
  await click(byClass(settings, "settings-jump-host-change")[0]);
  assert.deepEqual(navigations, [{ route: "bridge", params: {} }], "Change reopens the saved jump-host configuration");
  await click(byClass(settings, "settings-jump-host-clear")[0]);
  assert.equal(readSetting(store, "jump-host"), null, "Jump-host Clear removes the login-bearing store entry");
});
