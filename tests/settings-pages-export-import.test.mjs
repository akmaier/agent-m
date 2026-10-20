// Module: MOD-settings-pages

import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { view } from "../src/settings-pages/index.mjs";
import { exportSettings, openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

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
Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true, writable: true });

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const click = async (button) => { button.dispatchEvent(new Event("click")); await new Promise((resolve) => setImmediate(resolve)); };
const change = async (input) => { input.dispatchEvent(new Event("change")); await new Promise((resolve) => setImmediate(resolve)); };
async function waitFor(predicate) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.ok(predicate(), "the selected asynchronous operation completes");
}

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
  "github-token": { value: "github_pat_secret" },
  "github-token:fixture/product": { value: "github_pat_product_secret" },
  "gitlab-token:gitlab.test/group/project": { value: "glpat-secret" },
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
// TST-288001
// level: unit
// module: MOD-settings-pages
// guards: UC-042; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT STATES THAT IT CONTAINS SECRETS
// given: every implemented canonical browser-store setting and a controlled DOM/download boundary
// input: the person opens Settings and clicks Export settings
// expect: the secret-and-grants notice precedes one constructed-file download containing every canonical setting
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
  try { await click(download); await waitFor(() => downloads.length === 1); } finally { globalThis.URL = oldUrl; }
  assert.equal(downloads.length, 1, "the click creates one controlled download");
  assert.deepEqual(JSON.parse(await downloads[0].text()).settings, SETTINGS);
});

// Failure node: rendered Settings has no import-file control composing canonical importSettings, so kept raw bytes and
// the complete added/kept result are unavailable.
// TST-288002
// level: unit
// module: MOD-settings-pages
// guards: UC-042; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// given: a canonical plain export and a destination with one existing setting
// input: the person chooses the constructed file in Settings
// expect: existing bytes are kept, absent canonical settings are added, and Settings lists both sets
test("TST-288002: Settings imports absent canonical settings and keeps existing bytes", async () => {
  const source = freshStore(); populate(source);
  const sourceTarget = await render(source);
  const downloads = [], oldUrl = globalThis.URL;
  globalThis.URL = { createObjectURL(blob) { downloads.push(blob); return "blob:controlled-export"; }, revokeObjectURL() {} };
  try { await click(byClass(sourceTarget, "settings-export-download")[0]); await waitFor(() => downloads.length === 1); } finally { globalThis.URL = oldUrl; }
  const exported = await downloads[0].text();
  const destination = freshStore();
  destination.storage.setItem(`${destination.prefix}bridge`, '{ "address" : "kept-byte-exact" }');
  const target = await render(destination);
  const input = byClass(target, "settings-import-file")[0];
  input.files = [{ text: async () => exported }];
  await change(input);
  await waitFor(() => readSetting(destination, "endpoint:main") !== null);
  assert.equal(destination.storage.getItem(`${destination.prefix}bridge`), '{ "address" : "kept-byte-exact" }');
  for (const [key, value] of Object.entries(SETTINGS)) if (key !== "bridge") assert.deepEqual(readSetting(destination, key), value);
  const result = byClass(target, "settings-import-result")[0].textContent;
  assert.match(result, /Added:.*endpoint:main/s);
  assert.match(result, /Kept:.*bridge/s);
});

// Failure node: rendered Settings has no passphrase/file controls composing the canonical lock and error boundaries;
// this case restores the exact original settings after each attempted import.
// TST-288003
// level: unit
// module: MOD-settings-pages
// guards: AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// given: canonical settings, a chosen passphrase, and controlled locked and malformed files
// input: the person exports, imports with the passphrase, then imports malformed bytes into a clean destination
// expect: locked bytes hide secrets, the passphrase restores settings, and malformed input writes no new setting
test("TST-288003: Settings locks imports with a passphrase and leaves malformed import destinations untouched", async () => {
  const source = freshStore(); populate(source);
  const sourceTarget = await render(source);
  const passphrase = byClass(sourceTarget, "settings-export-passphrase")[0];
  passphrase.value = "constructed passphrase";
  const downloads = [], oldUrl = globalThis.URL;
  globalThis.URL = { createObjectURL(blob) { downloads.push(blob); return "blob:controlled-export"; }, revokeObjectURL() {} };
  try { await click(byClass(sourceTarget, "settings-export-download")[0]); await waitFor(() => downloads.length === 1); } finally { globalThis.URL = oldUrl; }
  const locked = await downloads[0].text();
  assert.equal(locked.includes("bridge-secret") || locked.includes("jump-secret"), false, "locked bytes hide stored secrets");
  const destination = freshStore();
  const target = await render(destination);
  byClass(target, "settings-import-passphrase")[0].value = "constructed passphrase";
  const input = byClass(target, "settings-import-file")[0]; input.files = [{ text: async () => locked }];
  await change(input);
  await waitFor(() => readSetting(destination, "bridge") !== null);
  assert.deepEqual(readSetting(destination, "bridge"), SETTINGS.bridge);
  const wrong = freshStore(), wrongTarget = await render(wrong), wrongBefore = wrong.storage.snapshot();
  byClass(wrongTarget, "settings-import-passphrase")[0].value = "wrong passphrase";
  const wrongFile = byClass(wrongTarget, "settings-import-file")[0]; wrongFile.files = [{ text: async () => locked }];
  await change(wrongFile);
  await waitFor(() => /passphrase.*wrong/i.test(byClass(wrongTarget, "settings-import-result")[0].textContent));
  assert.deepEqual(wrong.storage.snapshot(), wrongBefore, "WrongPassphrase restores the exact clean destination bytes");
  const clean = freshStore(), cleanTarget = await render(clean), before = clean.storage.snapshot();
  const malformed = byClass(cleanTarget, "settings-import-file")[0]; malformed.files = [{ text: async () => "{ malformed" }];
  await change(malformed);
  await waitFor(() => /not.*export/i.test(byClass(cleanTarget, "settings-import-result")[0].textContent));
  assert.deepEqual(clean.storage.snapshot(), before, "NotAnExport restores the exact clean destination bytes");
  assert.match(byClass(cleanTarget, "settings-import-result")[0].textContent, /not.*export/i);
});

// Settings files for the import checks below. The token forms are the ones their servers give them: `github_pat_` for GitHub's
// fine-grained token, `glpat-` for GitLab's project access token. The expected results are stated in each test's own text.
const GITHUB_FORM = "github_pat_FILE0123456789abcdefghijklmnop", GITLAB_FORM = "glpat-FILE0123456789abcdefghijkl";
const BRIDGE = { address: "https://bridge.example.test", token: "bridge-secret" };
const exportFile = (settings) => JSON.stringify({ "agent-m-settings": 1, instance: "fixture/instance", exported: "2026-10-19T00:00:00Z", locked: false, settings, foreign: {} });
// The person picks `text` in Import settings on a fresh page of `store`. -> the line the page shows for the import.
async function importText(store, text, passphrase = "") {
  const target = await render(store);
  if (passphrase) byClass(target, "settings-import-passphrase")[0].value = passphrase;
  const input = byClass(target, "settings-import-file")[0];
  input.files = [{ text: async () => text }];
  await change(input);
  const line = () => byClass(target, "settings-import-result")[0].textContent;
  await waitFor(() => line() !== "");
  return line();
}

// TST-893001
// level: unit
// module: MOD-settings-pages
// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: an empty browser store, and a settings file that holds a GitLab-form token under `github-token` and a Bridge this browser lacks
// input: the person picks the file in Import settings
// expect: nothing is stored, not even the Bridge; the line names `github-token` and says "That is a GitLab token", reports no "Added:", and does not contain the token
test("TST-893001: Import settings refuses a GitLab-form token under the GitHub token before it stores anything", async () => {
  const store = freshStore(), before = store.storage.snapshot();
  const line = await importText(store, exportFile({ "github-token": { value: GITLAB_FORM, name: "GitHub token" }, bridge: BRIDGE }));
  assert.deepEqual(store.storage.snapshot(), before, "nothing was stored");
  assert.match(line, /github-token/);
  assert.match(line, /That is a GitLab token/);
  assert.equal(/Added:/.test(line), false, `the import reports nothing added (it says: ${line})`);
  assert.equal(line.includes(GITLAB_FORM), false, "the line never holds the token");
});

// TST-893002
// level: unit
// module: MOD-settings-pages
// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; A GITHUB PRODUCT USES A TOKEN OF ITS OWN
// given: an empty browser store, and a settings file that holds a GitLab-form token under `github-token:fixture/product` and the product list
// input: the person picks the file in Import settings
// expect: nothing is stored, the product list included; the line names `github-token:fixture/product` and says "That is a GitLab token", and does not contain the token
test("TST-893002: Import settings refuses a GitLab-form token under a GitHub product's key", async () => {
  const store = freshStore(), before = store.storage.snapshot();
  const line = await importText(store, exportFile({ products: ["https://github.com/fixture/product"], "github-token:fixture/product": { value: GITLAB_FORM, name: "Agent M" } }));
  assert.deepEqual(store.storage.snapshot(), before, "nothing was stored");
  assert.match(line, /github-token:fixture\/product/);
  assert.match(line, /That is a GitLab token/);
  assert.equal(line.includes(GITLAB_FORM), false, "the line never holds the token");
});

// TST-893003
// level: unit
// module: MOD-settings-pages
// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; A GITLAB PRODUCT USES A PROJECT ACCESS TOKEN
// given: an empty browser store, and a settings file that holds a GitHub-form token under `gitlab-token:gitlab.test/group/project` and a Bridge this browser lacks
// input: the person picks the file in Import settings
// expect: nothing is stored; the line names `gitlab-token:gitlab.test/group/project` and says "That is a GitHub token", and does not contain the token
test("TST-893003: Import settings refuses a GitHub-form token under a GitLab project's key", async () => {
  const store = freshStore(), before = store.storage.snapshot();
  const line = await importText(store, exportFile({ bridge: BRIDGE, "gitlab-token:gitlab.test/group/project": { value: GITHUB_FORM, name: "Agent M" } }));
  assert.deepEqual(store.storage.snapshot(), before, "nothing was stored");
  assert.match(line, /gitlab-token:gitlab\.test\/group\/project/);
  assert.match(line, /That is a GitHub token/);
  assert.equal(line.includes(GITHUB_FORM), false, "the line never holds the token");
});

// TST-893004
// level: unit
// module: MOD-settings-pages
// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// given: an empty browser store, and a settings file that holds a GitHub-form token under `github-token` and under `github-token:fixture/product`, a GitLab-form token under `gitlab-token:gitlab.test/group/project`, and a Bridge
// input: the person picks the file in Import settings
// expect: every setting of the file is stored as the file holds it, and the line lists all four keys as added (the counter-proof of TST-893001 to TST-893003: tokens of their own server's form are imported)
test("TST-893004: Import settings stores tokens of the form of their own server", async () => {
  const store = freshStore();
  const settings = {
    "github-token": { value: GITHUB_FORM, name: "GitHub token" },
    "github-token:fixture/product": { value: GITHUB_FORM, name: "Agent M" },
    "gitlab-token:gitlab.test/group/project": { value: GITLAB_FORM, name: "Agent M" },
    bridge: BRIDGE,
  };
  const line = await importText(store, exportFile(settings));
  for (const [key, value] of Object.entries(settings)) assert.deepEqual(readSetting(store, key), value, `${key} is stored as the file holds it (the page says: ${line})`);
  assert.equal(line, "Added: github-token, github-token:fixture/product, gitlab-token:gitlab.test/group/project, bridge. Kept: none.");
});

// TST-893005
// level: unit
// module: MOD-settings-pages
// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
// given: an empty browser store, and a settings file locked with a passphrase that holds a GitLab-form token under `github-token` and a Bridge this browser lacks
// input: the person enters the passphrase and picks the file in Import settings
// expect: nothing is stored; the line names `github-token` and says "That is a GitLab token", and holds neither the token nor the passphrase
test("TST-893005: Import settings refuses a wrong-form token in a locked file before it stores anything", async () => {
  const source = freshStore();
  writeSetting(source, "github-token", { value: GITLAB_FORM, name: "GitHub token" });
  writeSetting(source, "bridge", BRIDGE);
  const locked = await exportSettings(source, "constructed passphrase");
  assert.equal(locked.includes(GITLAB_FORM), false, "the file is locked");
  const store = freshStore(), before = store.storage.snapshot();
  const line = await importText(store, locked, "constructed passphrase");
  assert.deepEqual(store.storage.snapshot(), before, "nothing was stored");
  assert.match(line, /github-token/);
  assert.match(line, /That is a GitLab token/);
  assert.equal(line.includes(GITLAB_FORM) || line.includes("constructed passphrase"), false, "the line holds neither the token nor the passphrase");
});

// TST-893006
// level: unit
// module: MOD-settings-pages
// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// given: a browser store that holds its own `github-token` as raw bytes, and a settings file that holds a GitLab-form token under `github-token` and a Bridge this browser lacks
// input: the person picks the file in Import settings
// expect: the import is refused although the browser would keep its own token: no byte of the store changes, the Bridge is not added, and the line names `github-token`
test("TST-893006: Import settings refuses the file even where this browser would keep its own token", async () => {
  const store = freshStore();
  store.storage.setItem(`${store.prefix}github-token`, `{ "value" : "${GITHUB_FORM}" }`);
  const before = store.storage.snapshot();
  const line = await importText(store, exportFile({ "github-token": { value: GITLAB_FORM, name: "GitHub token" }, bridge: BRIDGE }));
  assert.deepEqual(store.storage.snapshot(), before, "no byte of the store changed");
  assert.match(line, /github-token/);
  assert.match(line, /That is a GitLab token/);
  assert.equal(line.includes(GITLAB_FORM), false, "the line never holds the token");
});
