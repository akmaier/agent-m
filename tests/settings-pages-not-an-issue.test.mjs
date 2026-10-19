// MOD-settings-pages' line for the mails marked not an issue (ITM-1044), as the accepted text of docs/architecture/MOD-settings-pages.md states the Settings page (:132-134): "one line per setting with its state ... A browser setting
// has *Test*, *Change* and *Clear*". The value of the key `not-an-issue` (ITM-957) is identifiers only, so its line shows how many mails are marked and *Clear*, after one confirmation; there is nothing to test or change.
// SPEC.md :637-641 (EVERY SETTING IS REACHED FROM ONE PAGE).
// Run: node --test tests/settings-pages-not-an-issue.test.mjs
//
// Module: MOD-settings-pages
// Guards: EVERY SETTING IS REACHED FROM ONE PAGE; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; A CLEAR IS A REAL CLEAR; ONE CLICK PER DECISION; UC-042
// Level: unit
//
// The store is a Map-backed localStorage; the DOM the small one tests/settings-pages-browser-id.test.mjs uses, with a body and `remove` for MOD-site-frame's confirmDecision (<section class="decision">, its confirm button
// "Clear the marks"). Readings the texts leave open, which the tests state: the line is <section class="settings-not-an-issue"> headed "Mails marked not an issue", saying "<n> mails marked" or "not set", with <button class="settings-not-an-issue-clear"> "Clear".
// The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.files = []; this.attributes = new Map(); }
  append(...nodes) { for (const node of nodes.flat()) { const one = typeof node === "string" ? new Text(node) : node; if (one instanceof Element) one.parent = this; this.childNodes.push(one); } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  remove() { if (this.parent) this.parent.childNodes = this.parent.childNodes.filter((child) => child !== this); }
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
globalThis.document = { createElement: (name) => new Element(name), body: new Element("body") };
function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const click = async (button) => { button.dispatchEvent(new Event("click")); await new Promise((resolve) => setTimeout(resolve, 5)); };
const buttonNamed = (root, text) => descendants(root, (node) => node.localName === "button" && node.textContent === text)[0];
const MARKS = ["MAIL-0123456789abcdef", "MAIL-fedcba9876543210", "MAIL-00112233445566aa"];
const STORED_KEY = "agent-m:fixture/instance:not-an-issue";
function fresh() { const storage = new Storage(); Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage }); return { storage, store: openStore("fixture/instance") }; }
async function settingsPage(store) {
  const target = document.createElement("div");
  await view.routes.find((candidate) => candidate.name === "settings").render(target, { instance: { repository: "fixture/instance" }, product: null, store, go() {} }, {});
  return target;
}

const dialog = () => byClass(document.body, "decision")[0];

// TST-1044001 · level: unit · module: MOD-settings-pages
// guards: EVERY SETTING IS REACHED FROM ONE PAGE; UC-042
// given: a store holding three marked identifiers; and one holding none
// input: the Settings page for each
// expect: one line headed "Mails marked not an issue"; the first says "3 mails marked" and offers Clear and no Test or Change, shows no identifier; the second says "not set" and offers no Clear
test("Settings — the mails marked not an issue are a line that says how many, with Clear", async () => {
  const { store } = fresh();
  writeSetting(store, "not-an-issue", MARKS);
  const lines = byClass(await settingsPage(store), "settings-not-an-issue");
  assert.equal(lines.length, 1);
  assert.match(lines[0].textContent, /Mails marked not an issue/);
  assert.match(lines[0].textContent, /3 mails marked/);
  assert.equal(lines[0].textContent.includes("MAIL-"), false, "identifiers only counted");
  assert.deepEqual(descendants(lines[0], (node) => node.localName === "button").map((node) => node.textContent), ["Clear"]);
  const { store: empty } = fresh();
  const none = byClass(await settingsPage(empty), "settings-not-an-issue")[0];
  assert.match(none.textContent, /not set/);
  assert.equal(byClass(none, "settings-not-an-issue-clear").length, 0);
});

// TST-1044002 · level: unit · module: MOD-settings-pages
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; A CLEAR IS A REAL CLEAR; ONE CLICK PER DECISION
// given: the page of TST-1044001 with three marked identifiers
// input: a click on Clear; the dialog declined (Cancel); a click on Clear and the dialog's Clear the marks
// expect: the first click opens one dialog and removes nothing; Cancel removes nothing; the confirmed click removes the key from localStorage itself, readSetting gives null, and the line then reads "not set"
test("Settings — Clear asks once and removes the marks from localStorage", async () => {
  const { storage, store } = fresh();
  writeSetting(store, "not-an-issue", MARKS);
  const page = await settingsPage(store);
  assert.equal(storage.values.has(STORED_KEY), true, "known positive: stored before the click");
  await click(byClass(page, "settings-not-an-issue-clear")[0]);
  assert.ok(dialog(), "one dialog");
  assert.equal(storage.values.has(STORED_KEY), true, "nothing removed by the first click");
  await click(buttonNamed(dialog(), "Cancel"));
  assert.equal(storage.values.has(STORED_KEY), true, "a declined dialog removes nothing");
  await click(byClass(page, "settings-not-an-issue-clear")[0]);
  await click(buttonNamed(dialog(), "Clear the marks"));
  assert.equal(storage.values.has(STORED_KEY), false);
  assert.equal(readSetting(store, "not-an-issue"), null);
  assert.match(byClass(page, "settings-not-an-issue")[0].textContent, /not set/);
});
