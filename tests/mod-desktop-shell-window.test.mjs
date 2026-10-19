// Module: MOD-desktop-shell
// Guards: UC-044; THE BRIDGE RUNS AS AN APP; EVERY STEP EXPLAINS ITSELF
// Level: unit
//
// This drives the production window entry through a small EventTarget DOM. It opens no native
// window, contacts no service, and uses only constructed preload replies.

import assert from "node:assert/strict";
import test from "node:test";

class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.attributes = new Map(); this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.innerHTML = ""; this.parentNode = null; }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  remove() { if (this.parentNode) this.parentNode.childNodes.splice(this.parentNode.childNodes.indexOf(this), 1); }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  getElementsByTagName(name) { return descendants(this, (node) => node.localName === name); }
}
class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); } get length() { return this.values.size; } key(index) { return [...this.values.keys()][index] ?? null; } }
const descendants = (root, predicate) => { const found = []; const visit = (node) => { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } }; visit(root); return found; };
const buttons = (root, label) => descendants(root, (node) => node.localName === "button" && node.textContent === label);
const click = async (root, label) => { const control = buttons(root, label)[0]; assert.ok(control, `${label} is visible`); control.dispatchEvent(new Event("click")); await new Promise((resolve) => setImmediate(resolve)); };
const clickLast = async (root, label) => { const control = buttons(root, label).at(-1); assert.ok(control, `${label} is visible`); control.dispatchEvent(new Event("click")); await new Promise((resolve) => setImmediate(resolve)); };

// TST-291006 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE RUNS AS AN APP; EVERY STEP EXPLAINS ITSELF
// given: the production Bridge window entry, a constructed preload state, and its three delivered routes
// input: Settings is opened, saved, then Tunnels is selected; Pairing is paused, paired anew, and retried after a port refusal
// expect: each re-render keeps the ViewContext so all three routes remain reachable through context.go after Save, Pause, Pair anew, and retry
// Planted fault: dropping the route context when Pairing re-renders makes a later Settings/Tunnels click stop changing the route.
test("TST-291006: production window navigation remains reachable after settings and pairing re-renders", async () => {
  const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
  document.head = document.createElement("head"); document.body = document.createElement("body");
  globalThis.document = document;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget();
  const location = { hash: "#pairing" };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  let paused = false, failure = null;
  browser.bridge = {
    async state(action) {
      if (action === "settings") return { settings: { name: "This computer", port: 4711, products: ["https://products.example.test"], every: 30, jumpHost: { hostname: "jump.example.test", user: "agentm", sshPort: 22 } } };
      if (action === "tunnels") return { publicKey: "ssh-ed25519 fixture", tunnels: [{ name: "own", state: "open" }] };
      return failure ?? { address: "http://127.0.0.1:4711", token: "fixture-token", paused };
    },
    async copy() {}, async quit() {}, async retryPort() { failure = null; }, async pairAnew() {},
    async pause() { paused = true; }, async resume() { paused = false; },
  };
  await import(`../src/desktop-shell/window.mjs?window-fixture=${Date.now()}`);
  const redraw = async () => { browser.dispatchEvent(new Event("hashchange")); await new Promise((resolve) => setImmediate(resolve)); };

  await click(document.body, "Settings"); assert.equal(location.hash, "#settings", "Pairing navigation uses the supplied context.go"); await redraw();
  await click(document.body, "Save settings");
  await click(document.body, "Tunnels"); assert.equal(location.hash, "#tunnels", "Save redraw retains context for navigation"); await redraw();
  assert.match(document.body.textContent, /authorized_keys.*agentm@jump\.example\.test/i, "Tunnels tells the person where to add the public key");
  await click(document.body, "Pairing"); await redraw();
  await click(document.body, "Pause");
  await click(document.body, "Settings"); assert.equal(location.hash, "#settings", "Pause redraw retains context for navigation");
  await redraw(); await click(document.body, "Pairing"); await redraw();
  await click(document.body, "Pair anew"); await clickLast(document.body, "Pair anew");
  await click(document.body, "Tunnels"); assert.equal(location.hash, "#tunnels", "Pair anew redraw retains context for navigation");
  failure = { failure: { name: "PortInUse", message: "occupied" } }; location.hash = "#pairing"; await redraw();
  await click(document.body, "Use this port");
  await click(document.body, "Settings"); assert.equal(location.hash, "#settings", "retry redraw retains context for navigation");
});

// TST-1004003 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE SHOWS ITS PAIRING TOKEN IN ITS WINDOW; THE BRIDGE IS PAIRED ONCE
// given: the production Bridge window entry and a constructed preload state that names pairedWith "https://carol.github.io" and, later, null
// input: the Pairing route is drawn with each state
// expect: with the origin, the page says "paired with https://carol.github.io" and not "not yet paired since this start"; with null, it says "not yet paired since this start" and not "paired with"
// Planted fault: always saying one of them, or leaving the origin out, fails one of the two draws.
test("TST-1004003: MOD-desktop-shell's Pairing view says which origin the Bridge is paired with, or that it is not yet paired since this start", async () => {
  const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
  document.head = document.createElement("head"); document.body = document.createElement("body");
  globalThis.document = document;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget();
  Object.defineProperty(globalThis, "location", { configurable: true, value: { hash: "#pairing" } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  let pairedWith = "https://carol.github.io";
  browser.bridge = { async state() { return { address: "http://127.0.0.1:4711", token: "fixture-token", paused: false, pairedWith }; },
    async copy() {}, async quit() {}, async retryPort() {}, async pairAnew() {}, async pause() {}, async resume() {} };
  await import(`../src/desktop-shell/window.mjs?window-paired=${Date.now()}`);
  const redraw = async () => { browser.dispatchEvent(new Event("hashchange")); await new Promise((resolve) => setImmediate(resolve)); };
  await redraw();
  assert.match(document.body.textContent, /paired with https:\/\/carol\.github\.io/);
  assert.doesNotMatch(document.body.textContent, /not yet paired since this start/);
  pairedWith = null;
  await redraw();
  assert.match(document.body.textContent, /not yet paired since this start/);
  assert.doesNotMatch(document.body.textContent, /paired with/);
});

// TST-1054007 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE; EVERY STEP EXPLAINS ITSELF
// given: the production Bridge window entry and a constructed preload state: the running version 2026.10.0, a release 2026.11.0 offered with the notes "Fixes the tunnels.", and, after the click Download, the file ready; one job running
// input: the route Updates is opened; Download is pressed; Install and restart is pressed, then its decision is confirmed
// expect: the page names the running version, the offered version and its notes, and carries the folded explanation (What is this?, the topic bridge-updates); Download asks the main process to download and the page then offers Install and restart; pressing it shows a decision that names the running job and asks nothing of the main process to install; only the confirming click asks for the install, with { confirmed: true }, once
// Planted fault: asking for the install at the first click, or without naming the job, fails the calls or the decision's text; a page without the explanation lacks "What is this?".
test("TST-1054007 the Updates view shows the offer with its notes, and installs only after the decision that names the running jobs", async () => {
  const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
  document.head = document.createElement("head"); document.body = document.createElement("body");
  globalThis.document = document;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget();
  const location = { hash: "#updates" };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  const asked = [];
  let ready = false;
  browser.bridge = {
    async state(action, value) {
      asked.push([action, value]);
      if (action === "updates") return { version: "2026.10.0", offer: { version: "2026.11.0", notes: "Fixes the tunnels." }, ready, refused: null, error: null };
      if (action === "download-update") { ready = true; return { version: "2026.10.0", offer: { version: "2026.11.0", notes: "Fixes the tunnels." }, ready, refused: null, error: null }; }
      if (action === "running-jobs") return { jobs: [{ id: "JOB-20261019-1000-abcd", kind: "implement", agent: "claude", product: "alice/product" }] };
      return { address: "http://127.0.0.1:4711", token: "t", paused: false, pairedWith: null };
    },
    async copy() {}, async quit() {}, async retryPort() {}, async pairAnew() {}, async pause() {}, async resume() {},
  };
  await import(`../src/desktop-shell/window.mjs?window-updates=${Date.now()}`);
  const redraw = async () => { browser.dispatchEvent(new Event("hashchange")); await new Promise((resolve) => setImmediate(resolve)); };
  await redraw();
  const page = () => document.body.textContent;
  assert.match(page(), /2026\.10\.0/);
  assert.match(page(), /2026\.11\.0/);
  assert.match(page(), /Fixes the tunnels\./);
  assert.match(page(), /What is this\?/, "the folded explanation (the topic bridge-updates) stands under the heading");
  assert.doesNotMatch(page(), /Install and restart/, "not before the download");
  await click(document.body, "Download");
  assert.ok(asked.some(([action]) => action === "download-update"));
  await redraw();
  await click(document.body, "Install and restart");
  assert.match(page(), /JOB-20261019-1000-abcd/, "the decision names the running job");
  assert.ok(!asked.some(([action]) => action === "install-update"), "nothing is installed before the decision");
  await clickLast(document.body, "Install and restart");
  const installs = asked.filter(([action]) => action === "install-update");
  assert.deepEqual(installs, [["install-update", { confirmed: true }]]);
});
