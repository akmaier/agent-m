// TST-288001
// level: unit
// module: MOD-settings-pages
// guards: UC-042; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT STATES THAT IT CONTAINS SECRETS
// given: every implemented canonical browser-store setting and a controlled DOM/download boundary
// input: the person opens Settings and clicks Export settings
// expect: the secret-and-grants notice precedes one constructed-file download containing every canonical setting
//
// TST-288002
// level: unit
// module: MOD-settings-pages
// guards: UC-042 alternative 6a; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// given: a canonical plain export and a destination with one existing setting
// input: the person chooses the constructed file in Settings
// expect: existing bytes are kept, absent canonical settings are added, and Settings lists both sets
//
// TST-288003
// level: unit
// module: MOD-settings-pages
// guards: AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// given: canonical settings, a chosen passphrase, and controlled locked and malformed files
// input: the person exports, imports with the passphrase, then imports malformed bytes into a clean destination
// expect: locked bytes hide secrets, the passphrase restores settings, and malformed input writes no new setting
//
// TST-288004
// level: unit
// module: MOD-settings-pages
// guards: UC-042; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT STATES THAT IT CONTAINS SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
// given: this module test file
// input: MOD-test-document and MOD-trace-graph read its declarations
// expect: every TST-288 declaration has the declared module and guards trace to the canonical Settings requirements

import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";
import { testDeclarations } from "../src/test-document/index.mjs";
import { traceGraph, tracesTo } from "../src/trace-graph/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.files = []; this.parentNode = null; this.clicked = false; }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  click() { this.clicked = true; this.dispatchEvent(new Event("click")); }
  focus() {}
}
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
globalThis.document = { createElement: (name) => new Element(name) };
globalThis.crypto = webcrypto;

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const click = async (button) => { button.dispatchEvent(new Event("click")); await new Promise((resolve) => setImmediate(resolve)); };
const change = async (input) => { input.dispatchEvent(new Event("change")); await new Promise((resolve) => setImmediate(resolve)); };

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  snapshot() { return [...this.values.entries()].sort(); }
}
function freshStore() { Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() }); return openStore("fixture/instance"); }
function settingsRoute() { const route = view.routes.find((candidate) => candidate.name === "settings"); assert.ok(route, "view exposes the public Settings Route"); return route; }
async function render(store) { const target = document.createElement("div"); await settingsRoute().render(target, { instance: { repository: "fixture/instance" }, store, go() {} }); return target; }

const SETTINGS = {
  "github-token": { value: "github-secret" },
  "github-token:fixture/product": { value: "github-product-secret" },
  "gitlab-token:gitlab.test/group/project": { value: "gitlab-secret" },
  products: ["https://github.com/fixture/product"],
  notifications: { enabled: true },
  notified: { reports: ["one"] },
  "endpoint:main": { url: "https://model.example.test", kind: "openai-compatible", model: "fixture", key: "endpoint-secret", throughBridge: false },
  bridge: { address: "https://bridge.example.test", token: "bridge-secret" },
  "jump-host": { hostname: "jump.example.test", user: "fixture", sshPort: 22, portRange: [40100, 40199], login: { user: "web", password: "jump-secret" } },
  "remote-session:alpha": { port: 40100, token: "remote-secret" },
  "last-test:bridge": { at: "2026-10-09T00:00:00.000Z", outcome: "working" },
};
function populate(store) { for (const [key, value] of Object.entries(SETTINGS)) writeSetting(store, key, value); }

// Failure node: rendered Settings has neither the required disclosure nor an export control, so canonical bytes cannot
// reach the constructed download boundary.
test("TST-288001: Settings discloses exported secrets and grants before one canonical download", async () => {
  const store = freshStore(); populate(store);
  const target = await render(store);
  const notice = byClass(target, "settings-export-notice")[0];
  const download = byClass(target, "settings-export-download")[0];
  const ordered = descendants(target, (node) => node === notice || node === download);
  assert.match(notice.textContent, /token|key|password/i);
  assert.match(notice.textContent, /repository|mail|Bridge/i);
  assert.ok(ordered.indexOf(notice) >= 0 && ordered.indexOf(notice) < ordered.indexOf(download), "notice precedes Export settings");
  const downloads = [], oldUrl = globalThis.URL;
  globalThis.URL = { createObjectURL(blob) { downloads.push(blob); return "blob:controlled-export"; }, revokeObjectURL() {} };
  try { await click(download); } finally { globalThis.URL = oldUrl; }
  assert.equal(downloads.length, 1, "the click creates one controlled download");
  assert.deepEqual(JSON.parse(await downloads[0].text()).settings, SETTINGS);
});

// Failure node: rendered Settings has no import-file control composing canonical importSettings, so kept raw bytes and
// the complete added/kept result are unavailable.
test("TST-288002: Settings imports absent canonical settings and keeps existing bytes", async () => {
  const source = freshStore(); populate(source);
  const sourceTarget = await render(source);
  const downloads = [], oldUrl = globalThis.URL;
  globalThis.URL = { createObjectURL(blob) { downloads.push(blob); return "blob:controlled-export"; }, revokeObjectURL() {} };
  try { await click(byClass(sourceTarget, "settings-export-download")[0]); } finally { globalThis.URL = oldUrl; }
  const exported = await downloads[0].text();
  const destination = freshStore();
  destination.storage.setItem(`${destination.prefix}bridge`, '{ "address" : "kept-byte-exact" }');
  const target = await render(destination);
  const input = byClass(target, "settings-import-file")[0];
  input.files = [{ text: async () => exported }];
  await change(input);
  assert.equal(destination.storage.getItem(`${destination.prefix}bridge`), '{ "address" : "kept-byte-exact" }');
  for (const [key, value] of Object.entries(SETTINGS)) if (key !== "bridge") assert.deepEqual(readSetting(destination, key), value);
  const result = byClass(target, "settings-import-result")[0].textContent;
  assert.match(result, /Added:.*endpoint:main/s);
  assert.match(result, /Kept:.*bridge/s);
});

// Failure node: rendered Settings has no passphrase/file controls composing the canonical lock and error boundaries;
// this case restores the exact original settings after each attempted import.
test("TST-288003: Settings locks imports with a passphrase and leaves malformed import destinations untouched", async () => {
  const source = freshStore(); populate(source);
  const sourceTarget = await render(source);
  const passphrase = byClass(sourceTarget, "settings-export-passphrase")[0];
  passphrase.value = "constructed passphrase";
  const downloads = [], oldUrl = globalThis.URL;
  globalThis.URL = { createObjectURL(blob) { downloads.push(blob); return "blob:controlled-export"; }, revokeObjectURL() {} };
  try { await click(byClass(sourceTarget, "settings-export-download")[0]); } finally { globalThis.URL = oldUrl; }
  const locked = await downloads[0].text();
  assert.equal(locked.includes("bridge-secret") || locked.includes("jump-secret"), false, "locked bytes hide stored secrets");
  const destination = freshStore();
  const target = await render(destination);
  byClass(target, "settings-import-passphrase")[0].value = "constructed passphrase";
  const input = byClass(target, "settings-import-file")[0]; input.files = [{ text: async () => locked }];
  await change(input);
  assert.deepEqual(readSetting(destination, "bridge"), SETTINGS.bridge);
  const clean = freshStore(), cleanTarget = await render(clean), before = clean.storage.snapshot();
  const malformed = byClass(cleanTarget, "settings-import-file")[0]; malformed.files = [{ text: async () => "{ malformed" }];
  await change(malformed);
  assert.deepEqual(clean.storage.snapshot(), before, "NotAnExport restores the exact clean destination bytes");
  assert.match(byClass(cleanTarget, "settings-import-result")[0].textContent, /not.*export/i);
});

test("TST-288004: canonical Settings export declarations trace their guards", async () => {
  const path = fileURLToPath(import.meta.url), text = await readFile(path, "utf8");
  const declarations = testDeclarations(path, text).filter((declaration) => declaration.id.startsWith("TST-288"));
  assert.equal(declarations.length, 4);
  assert.ok(declarations.every((declaration) => declaration.module === "MOD-settings-pages" && declaration.level === "unit" && declaration.guards.length > 0));
  const graph = await traceGraph({ paths: [path], read: async () => text });
  assert.deepEqual(tracesTo(graph, "SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS").tests, ["TST-288001", "TST-288002", "TST-288003", "TST-288004"]);
});
