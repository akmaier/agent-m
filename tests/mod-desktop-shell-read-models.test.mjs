// Read models in the Bridge's Agents view — MOD-desktop-shell's window as docs/architecture/MOD-desktop-shell.md states it: "the models one per line, each `<model>
// <context>`, with *Read models* beside them (UC-044 step 5): for an agent the Bridge offers, MOD-agent-processes' `agentModels` in the agent's enclosure, in its working
// folder, whose models replace what the field holds, one line each, the context left out where the agent reports none; it saves nothing — *Save agents* does. Where it
// reads nothing — the agent not offered with a working folder, its enclosure not working, or the `reason` `agentModels` gives —, the panel says that nothing could be
// read and why, and the field stays as it was (UC-044 5a)".
// Run: node --test tests/mod-desktop-shell-read-models.test.mjs
//
// Module: MOD-desktop-shell
// Guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// Level: unit
//
// The production window entry runs in a small EventTarget DOM, as tests/mod-desktop-shell-agents-check-result.test.mjs has it; the window's `bridge.state` answers a
// fixture state of one installed agent, codex, offered with its working folder and kept with one model, and records every request. The request the window makes for
// Read models is `bridge.state("agent-models", { name })`, answered by the main process (tests/mod-desktop-shell-read-models-entry.test.mjs). No real agent, enclosure or
// native window is started. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import test from "node:test";

class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.attributes = new Map(); this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.innerHTML = ""; this.parentNode = null; this.style = {}; }
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
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
const until = async (condition) => { for (let i = 0; i < 150 && !condition(); i += 1) await settle(); };

// The window over a fixture Bridge whose answer to agent-models is `read`; -> { panel, field, requests }.
async function agentsView(read) {
  const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
  document.head = document.createElement("head"); document.body = document.createElement("body");
  globalThis.document = document;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget();
  Object.defineProperty(globalThis, "location", { configurable: true, value: { hash: "#agents" } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  const requests = [];
  browser.bridge = {
    async state(action, args) {
      requests.push([action, args]);
      if (action === "agents") {
        return { platform: "linux", selected: [{ name: "codex", folder: "/work/codex", place: "this machine", capabilities: [], models: [{ model: "old-model", context: 1000 }] }],
          agents: [{ name: "codex", installed: true, version: "codex 1.2.3", loggedIn: true }], enclosures: { codex: { works: true, loggedIn: true } }, capabilities: [] };
      }
      if (action === "agent-models") return read;
      return {};
    },
    async copy() {}, async quit() {},
  };
  await import(`../src/desktop-shell/window.mjs?read-models=${Date.now()}-${Math.random()}`);
  await until(() => buttons(document.body, "Read models").length === 1);
  const panel = descendants(document.body, (node) => node.localName === "section" && /codex/.test(node.childNodes[0]?.textContent ?? ""))[0];
  return { body: document.body, panel, field: descendants(panel, (node) => node.localName === "textarea")[0], requests };
}

// TST-20261116141 · level: unit · module: MOD-desktop-shell
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: the Agents view of a Bridge offering codex with its working folder, its models field holding "old-model 1000"; the Bridge reads gpt-6 with context 400000 and gpt-6-mini with none
// input: Read models in codex's panel pressed
// expect: Read models stands in codex's panel, in the paragraph of its models field; one request agent-models with { name: "codex" }; the field then holds "gpt-6 400000\ngpt-6-mini" — the read
//         models in place of what it held, the context left out where none was read —; no request save-agents was made
test("TST-20261116141: Read models puts the models the agent reports in place of its models field and saves nothing", async () => {
  const view = await agentsView({ models: [{ model: "gpt-6", context: 400000 }, { model: "gpt-6-mini", context: null }] });
  assert.equal(view.field.value, "old-model 1000", "known positive: the field holds the kept model");
  const read = buttons(view.panel, "Read models")[0];
  assert.ok(read, "Read models stands in codex's panel");
  assert.equal(read.parentNode, view.field.parentNode.parentNode, "Read models stands beside the models field");
  read.dispatchEvent(new Event("click"));
  await until(() => view.field.value !== "old-model 1000");
  assert.deepEqual(view.requests.filter(([action]) => action === "agent-models"), [["agent-models", { name: "codex" }]]);
  assert.equal(view.field.value, "gpt-6 400000\ngpt-6-mini");
  assert.equal(view.requests.some(([action]) => action === "save-agents"), false, "reading saves nothing");
});

// TST-20261116142 · level: unit · module: MOD-desktop-shell
// guards: A CONNECTION NAMES THE MODELS IT OFFERS; UC-044
// given: the same view, the models field holding "old-model 1000"; the Bridge answers agent-models with { reason: "codex debug models failed: not signed in" }
// input: Read models pressed
// expect: codex's panel says that nothing could be read and names the reason "codex debug models failed: not signed in"; the field still holds "old-model 1000"; no request save-agents was made;
//         counter-proof: TST-20261116141, with models read, replaces the field
test("TST-20261116142: where nothing can be read, the panel says so and why, and the models field stays as it was", async () => {
  const view = await agentsView({ reason: "codex debug models failed: not signed in" });
  buttons(view.panel, "Read models")[0].dispatchEvent(new Event("click"));
  await until(() => /could be read/i.test(view.panel.textContent));
  assert.match(view.panel.textContent, /nothing could be read/i);
  assert.match(view.panel.textContent, /codex debug models failed: not signed in/);
  assert.equal(view.field.value, "old-model 1000");
  assert.equal(view.requests.some(([action]) => action === "save-agents"), false);
});
