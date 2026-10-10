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

// TST-291005
// level: unit
// module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE RUNS AS AN APP; EVERY STEP EXPLAINS ITSELF
// given: the production Bridge window entry, a constructed preload state, and its three delivered routes
// input: Settings is opened, saved, then Tunnels is selected; Pairing is paused, paired anew, and retried after a port refusal
// expect: each re-render keeps the ViewContext so all three routes remain reachable through context.go after Save, Pause, Pair anew, and retry
test("TST-291005: production window navigation remains reachable after settings and pairing re-renders", async () => {
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
