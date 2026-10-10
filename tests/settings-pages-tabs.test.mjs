// TST-290001
// level: component
// module: MOD-settings-pages
// guards: UC-042; UC-003; UC-017; UC-047; EVERY SETTING IS REACHED FROM ONE PAGE; EVERY STEP EXPLAINS ITSELF
// given: the public Settings Route with browser-held endpoint, Bridge, export, and import controls
// input: the person selects each named Settings tab with its tab control
// expect: General, Repositories, Endpoints & Agents, and Usability expose one selected pane at a time with accessible selected state
//
// TST-290002
// level: component
// module: MOD-settings-pages
// guards: UC-042; A STORED SECRET IS HIDDEN UNTIL SHOWN; CONFIGURATION LIVES IN THE BROWSER; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
// given: an unfinished export passphrase and a shown endpoint secret in the mounted public Settings Route
// input: the person changes tabs and returns to the original tab
// expect: mounted controls retain their values and shown state, while tab selection performs no request, permission, setting write, or repository write

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) {
    super();
    this.localName = name;
    this.childNodes = [];
    this.parentNode = null;
    this.className = "";
    this.value = "";
    this.type = "";
    this.checked = false;
    this.hidden = false;
    this.files = [];
    this.attributes = new Map();
  }
  append(...nodes) {
    for (const node of nodes.flat()) {
      const child = typeof node === "string" ? new Text(node) : node;
      this.childNodes.push(child);
      child.parentNode = this;
    }
  }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  click() { this.dispatchEvent(new Event("click")); }
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

function descendants(root, predicate) {
  const found = [];
  (function visit(node) {
    for (const child of node.childNodes ?? []) {
      if (child instanceof Element) {
        if (predicate(child)) found.push(child);
        visit(child);
      }
    }
  })(root);
  return found;
}

function byClass(root, name) {
  return descendants(root, (node) => node.className.split(" ").includes(name));
}

function tab(root, name) {
  return descendants(root, (node) => node.getAttribute("role") === "tab" && node.textContent === name)[0];
}

function settingsRoute() {
  const route = view.routes.find((candidate) => candidate.name === "settings");
  assert.ok(route, "MOD-settings-pages exposes the public Settings Route");
  return route;
}

function freshStore() {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  return openStore("fixture/instance");
}

async function render(store) {
  const target = document.createElement("div");
  await settingsRoute().render(target, { instance: { repository: "fixture/instance" }, store, go() {} });
  return target;
}

function click(button) {
  button.dispatchEvent(new Event("click"));
}

test("TST-290001: public Settings exposes four accessible scoped tabs", async () => {
  const store = freshStore();
  writeSetting(store, "endpoint:campus", {
    url: "https://models.example.test/v1", kind: "openai-compatible", model: "campus", key: "endpoint-secret", throughBridge: false,
  });
  writeSetting(store, "bridge", { address: "https://bridge.example.test", token: "bridge-secret" });
  const target = await render(store);

  const tabs = ["General", "Repositories", "Endpoints & Agents", "Usability"].map((name) => tab(target, name));
  assert.equal(tabs.length, 4);
  assert.ok(tabs.every(Boolean), "each required tab is named for assistive technology");
  assert.equal(tabs.filter((control) => control.getAttribute("aria-selected") === "true").length, 1, "one tab starts selected");
  assert.equal(tab(target, "General").getAttribute("aria-selected"), "true", "General starts selected");

  for (const control of tabs) {
    click(control);
    assert.equal(control.getAttribute("aria-selected"), "true", `${control.textContent} becomes selected`);
    assert.equal(tabs.filter((candidate) => candidate.getAttribute("aria-selected") === "true").length, 1, "selection remains singular");
  }
});

test("TST-290002: tab selection retains mounted values and performs no action", async () => {
  const store = freshStore();
  writeSetting(store, "endpoint:campus", {
    url: "https://models.example.test/v1", kind: "openai-compatible", model: "campus", key: "endpoint-secret", throughBridge: false,
  });
  const target = await render(store);
  const endpoints = tab(target, "Endpoints & Agents");
  const usability = tab(target, "Usability");
  const general = tab(target, "General");
  assert.ok(endpoints && usability && general, "tab selection is available without recreating the Settings Route");
  const passphrase = byClass(target, "settings-export-passphrase")[0];
  const secret = byClass(target, "settings-endpoint-key")[0];
  const show = byClass(target, "settings-endpoint-show")[0];
  assert.ok(passphrase && secret && show, "General and Endpoints & Agents retain the existing mounted controls");
  passphrase.value = "unfinished export passphrase";
  click(show);
  assert.equal(secret.type, "text", "Show reveals only the mounted secret");

  const before = [...store.storage.values.entries()];
  const priorFetch = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => { requests += 1; throw new Error("tab selection must not request"); };
  try {
    click(endpoints);
    click(usability);
    click(general);
  } finally {
    globalThis.fetch = priorFetch;
  }
  assert.equal(passphrase.value, "unfinished export passphrase", "the same unfinished input stays mounted");
  assert.equal(secret.type, "text", "shown-secret state stays with the mounted control");
  assert.equal(requests, 0, "tab selection makes no request");
  assert.deepEqual([...store.storage.values.entries()], before, "tab selection writes no browser setting");
});
