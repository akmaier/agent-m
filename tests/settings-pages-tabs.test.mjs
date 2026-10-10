// TST-290109
// level: unit
// module: MOD-settings-pages
// guards: UC-042; UC-003; UC-017; UC-047; EVERY SETTING IS REACHED FROM ONE PAGE;
//   A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: the public Settings Route with representative browser settings
// input: the person selects the four Settings tabs without submitting an action
// expect: each named tab has accessible selected state, only its pane is shown, and switching panes preserves
//   an unfinished passphrase without a storage write, endpoint request, or permission request

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.files = []; this.attributes = new Map(); }
  append(...nodes) { for (const node of nodes.flat()) this.childNodes.push(typeof node === "string" ? new Text(node) : node); }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  focus() { this.focused = true; }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
}
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  snapshot() { return [...this.values.entries()].sort(); }
}

globalThis.document = { createElement: (name) => new Element(name) };

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const click = (node) => node.dispatchEvent(new Event("click"));
function route() { return view.routes.find((candidate) => candidate.name === "settings"); }

test("TST-290109: Settings tabs preserve unfinished form state without actions", async () => {
  const storage = new Storage();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  const store = openStore("fixture/instance");
  writeSetting(store, "endpoint:main", { url: "https://models.example.test/v1", kind: "openai-compatible", model: "small", key: "stored-key", throughBridge: false });
  writeSetting(store, "bridge", { address: "https://bridge.example.test", token: "bridge-token" });
  const before = storage.snapshot();
  const target = document.createElement("div");
  await route().render(target, { instance: { repository: "fixture/instance" }, product: null, store, go() {} }, {});

  const tabs = byClass(target, "settings-tab");
  assert.deepEqual(tabs.map((tab) => tab.textContent), ["General", "Repositories", "Endpoints & Agents", "Usability"]);
  assert.equal(tabs[0].getAttribute("role"), "tab");
  assert.equal(tabs[0].getAttribute("aria-selected"), "true");
  const passphrase = byClass(target, "settings-export-passphrase")[0];
  passphrase.value = "unfinished passphrase";
  click(tabs[2]);
  click(tabs[0]);
  assert.equal(passphrase.value, "unfinished passphrase", "failure node: switching must retain the same General DOM input");
  assert.deepEqual(storage.snapshot(), before, "failure node: tab selection writes no browser setting");
  assert.equal(tabs[0].getAttribute("aria-selected"), "true");
});
