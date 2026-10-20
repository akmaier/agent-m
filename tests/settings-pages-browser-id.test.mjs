// MOD-settings-pages' line for this browser's identifier (ITM-1077), as the accepted text of docs/architecture/MOD-settings-pages.md states the Settings page (:137-139): "one line per setting with its
// state … A browser setting has *Test*, *Change* and *Clear*, …". The value of the key `browser` is an identifier only, so its line shows it and *Clear*; there is nothing to test or change. This is
// the reading ITM-1044 takes for `not-an-issue`. SPEC.md :637-641 (EVERY SETTING IS REACHED FROM ONE PAGE).
// Run: node --test tests/settings-pages-browser-id.test.mjs
//
// Module: MOD-settings-pages
// Guards: EVERY SETTING IS REACHED FROM ONE PAGE; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// Level: unit
//
// The store is a Map-backed localStorage; the DOM the small one the other tests of this module use. Each test states its input and its expected result before it runs. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.files = []; this.attributes = new Map(); }
  append(...nodes) { for (const node of nodes.flat()) this.childNodes.push(typeof node === "string" ? new Text(node) : node); }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  focus() {}
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
}
globalThis.document = { createElement: (name) => new Element(name) };
function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const click = async (button) => { button.dispatchEvent(new Event("click")); await new Promise((resolve) => setTimeout(resolve, 5)); };
const ID = "0123456789abcdef";
const STORED_KEY = "agent-m:fixture/instance:browser";
function fresh() { const storage = new Storage(); Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage }); return { storage, store: openStore("fixture/instance") }; }
async function settingsPage(store) {
  const target = document.createElement("div");
  await view.routes.find((candidate) => candidate.name === "settings").render(target, { instance: { repository: "fixture/instance" }, product: null, store, go() {} }, {});
  return target;
}

// TST-1077201 · level: unit · module: MOD-settings-pages
// guards: EVERY SETTING IS REACHED FROM ONE PAGE; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: a store holding the identifier 0123456789abcdef
// input: the Settings page
// expect: one line of the class settings-browser-id, headed "Browser identifier", whose value shows 0123456789abcdef in clear (it is no secret), with one Clear button and no Test or Change
test("Settings — a stored browser identifier is a line that shows it, with Clear", async () => {
  const { store } = fresh();
  writeSetting(store, "browser", ID);
  const page = await settingsPage(store);
  const lines = byClass(page, "settings-browser-id");
  assert.equal(lines.length, 1);
  assert.match(lines[0].textContent, /Browser identifier/);
  assert.equal(byClass(lines[0], "settings-browser-id-value")[0].textContent, ID);
  assert.equal(byClass(lines[0], "settings-browser-id-clear").length, 1);
  assert.equal(descendants(lines[0], (node) => node.localName === "button").length, 1, "Clear is the only button");
});

// TST-1077202 · level: unit · module: MOD-settings-pages
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; A CLEAR IS A REAL CLEAR
// given: the page of TST-1077201
// input: a click on Clear
// expect: the key is gone from localStorage itself, readSetting gives null, and the line then reads "not set" and offers no Clear
test("Settings — Clear removes the browser identifier from localStorage and the line reads not set", async () => {
  const { storage, store } = fresh();
  writeSetting(store, "browser", ID);
  const page = await settingsPage(store);
  assert.equal(storage.values.has(STORED_KEY), true, "known positive: stored before the click");
  await click(byClass(page, "settings-browser-id-clear")[0]);
  assert.equal(storage.values.has(STORED_KEY), false);
  assert.equal(readSetting(store, "browser"), null);
  const line = byClass(page, "settings-browser-id")[0];
  assert.match(line.textContent, /not set/);
  assert.equal(byClass(line, "settings-browser-id-clear").length, 0);
});

// TST-1077203 · level: unit · module: MOD-settings-pages
// guards: EVERY SETTING IS REACHED FROM ONE PAGE
// given: a store holding no identifier
// input: the Settings page
// expect: the line is there, headed "Browser identifier", reads "not set", shows no value and offers no Clear
test("Settings — without an identifier the line reads not set", async () => {
  const { store } = fresh();
  const page = await settingsPage(store);
  const lines = byClass(page, "settings-browser-id");
  assert.equal(lines.length, 1);
  assert.match(lines[0].textContent, /Browser identifier/);
  assert.match(lines[0].textContent, /not set/);
  assert.equal(byClass(lines[0], "settings-browser-id-clear").length, 0);
});
