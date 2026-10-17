// Clear everything in this browser on the settings page removes every entry of Agent M, the kept file texts among them
// (ITM-819), and no entry of another instance or another site.
// Run: node --test tests/settings-pages-clear-everything.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-042
// Guards: A CLEAR IS A REAL CLEAR
// Level: unit
//
// The expected result is written here from UC-042 step 6 ("Clear everything in this browser removes all of Agent M's entries from
// `localStorage`") and from A CLEAR IS A REAL CLEAR; none is read from a document. The page is the module's public route
// `settings`, rendered over a Map-backed localStorage in the small DOM tests/settings-pages-export-import.test.mjs uses (its
// pattern, copied: AGENTS.md 6a.1). A kept file text is an entry of the instance's prefix that no setting of the catalogue names.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.files = []; this.disabled = false; }
  append(...nodes) { for (const node of nodes.flat()) this.childNodes.push(typeof node === "string" ? new Text(node) : node); }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  setAttribute() {}
  focus() {}
}
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
globalThis.document = { createElement: (name) => new Element(name) };

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}

function byClass(root, name) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (child.className.split(" ").includes(name)) found.push(child); visit(child); } } })(root);
  return found;
}
const keys = () => [...globalThis.localStorage.values.keys()].sort();
const mine = () => keys().filter((key) => key.startsWith("agent-m:fixture/instance:"));
const settle = () => new Promise((resolve) => setImmediate(resolve));

// TST-819002
// level: unit
// module: MOD-settings-pages
// guards: UC-042; A CLEAR IS A REAL CLEAR
// given: Agent M's settings of one instance in localStorage, two kept file texts beside them, an entry of another instance and an entry of another site
// input: open the settings page, tick the confirmation, press Clear everything in this browser
// expect: not a key of the instance's prefix is left, the kept file texts included; the other instance's entry and the other site's entry stay; before the tick the button is disabled
test("TST-819002 · Clear everything removes the settings and the kept file texts of the instance and nothing of another", async () => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("fixture/instance");
  writeSetting(store, "github-token", { value: "github-secret" });
  writeSetting(store, "products", ["https://github.com/fixture/product"]);
  writeSetting(store, "endpoint:main", { url: "https://model.example.test", kind: "openai-compatible", model: "fixture", key: "endpoint-secret" });
  globalThis.localStorage.setItem(`agent-m:fixture/instance:file-text:${"a".repeat(40)}`, JSON.stringify("the text of a file"));
  globalThis.localStorage.setItem(`agent-m:fixture/instance:file-text:${"b".repeat(40)}`, JSON.stringify("the text of another file"));
  globalThis.localStorage.setItem("agent-m:other/instance:github-token", JSON.stringify({ value: "other-secret" }));
  globalThis.localStorage.setItem("another-site.setting", "kept");
  const target = document.createElement("div");
  await view.routes.find((route) => route.name === "settings").render(target, { instance: { repository: "fixture/instance" }, store, go() {} }, {});
  const clear = byClass(target, "settings-clear-everything")[0], acknowledgement = byClass(target, "settings-clear-ack")[0];
  assert.ok(clear && acknowledgement, "the page offers the confirmation and Clear everything in this browser");
  assert.equal(mine().length, 5, "five entries of the instance before the press");
  assert.equal(clear.disabled, true, "Clear everything waits for the tick");
  acknowledgement.checked = true; acknowledgement.dispatchEvent(new Event("change"));
  assert.equal(clear.disabled, false, "the tick enables Clear everything");
  clear.dispatchEvent(new Event("click"));
  await settle();
  assert.deepEqual(mine(), [], "not an entry of the instance is left");
  assert.deepEqual(keys(), ["agent-m:other/instance:github-token", "another-site.setting"], "another instance's and another site's entries stay");
});
