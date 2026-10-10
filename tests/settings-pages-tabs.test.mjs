// TST-290109
// level: unit
// module: MOD-settings-pages
// guards: UC-042; UC-003; UC-017; UC-047; EVERY SETTING IS REACHED FROM ONE PAGE; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: the public Settings Route with representative browser settings, including an old unreadable GitLab token key
// input: the person selects the four Settings tabs without submitting an action
// expect: each named tab has accessible selected state, only its pane is shown, unreadable stored credentials retain Show, Clear and export access, endpoint and Bridge setup retain their public routes, and switching panes preserves an unfinished passphrase without a storage write, endpoint request, or permission request

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
  writeSetting(store, "gitlab-token:g/p", { value: "glpat_fixtureToken" });
  const before = storage.snapshot();
  const target = document.createElement("div");
  const navigations = [];
  await route().render(target, { instance: { repository: "fixture/instance" }, product: null, store, go(name, params) { navigations.push({ name, params }); } }, {});

  const tabs = byClass(target, "settings-tab");
  assert.deepEqual(tabs.map((tab) => tab.textContent), ["General", "Repositories", "Endpoints & Agents", "Usability"]);
  assert.equal(tabs[0].getAttribute("role"), "tab");
  assert.equal(tabs[0].getAttribute("aria-selected"), "true");
  const passphrase = byClass(target, "settings-export-passphrase")[0];
  passphrase.value = "unfinished passphrase";
  click(tabs[1]);
  const unreadable = byClass(target, "settings-repository").find((line) => /GitLab token: g\/p/.test(line.textContent));
  assert.ok(unreadable, "failure node: an unreadable legacy address cannot remove the whole Settings page");
  const secret = byClass(unreadable, "settings-repository-secret")[0];
  assert.equal(secret.type, "password");
  click(byClass(unreadable, "settings-repository-show")[0]);
  assert.equal(secret.type, "text", "Show remains available for the stored token");
  assert.ok(byClass(unreadable, "settings-repository-clear")[0], "Clear remains available for the stored token");
  click(tabs[2]);
  click(byClass(target, "settings-endpoint-configure")[0]);
  click(byClass(target, "settings-bridge-configure")[0]);
  assert.deepEqual(navigations, [{ name: "endpoints", params: {} }, { name: "bridge", params: {} }], "the pane keeps the existing public endpoint and Bridge routes");
  click(tabs[0]);
  assert.equal(passphrase.value, "unfinished passphrase", "failure node: switching must retain the same General DOM input");
  assert.deepEqual(storage.snapshot(), before, "failure node: tab selection writes no browser setting");
  assert.equal(tabs[0].getAttribute("aria-selected"), "true");
});

// TST-290110
// level: unit
// module: MOD-settings-pages
// guards: UC-042; EVERY SETTING IS REACHED FROM ONE PAGE; A CLEAR IS A REAL CLEAR; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: the public Settings Route with a stored remote Bridge session and browser-held settings
// input: the person opens Endpoints & Agents, reveals the session token, removes a listed product, then acknowledges browser clear
// expect: the session remains hidden until Show and routes to its existing Bridge setup, while Clear everything stays disabled until acknowledgement and then removes the actual browser-store entries; product removal also removes its own credential and test metadata
test("TST-290110: Settings exposes remote-session actions and requires acknowledgement before browser clear", async () => {
  const storage = new Storage();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  const store = openStore("fixture/instance");
  writeSetting(store, "remote-session:lab", { port: 40101, token: "remote-token" });
  writeSetting(store, "endpoint:main", { url: "https://models.example.test/v1", kind: "openai-compatible", model: "small", key: "stored-key", throughBridge: false });
  writeSetting(store, "products", ["https://github.com/fixture/product"]);
  writeSetting(store, "github-token:fixture/product", { value: "ghp_product", name: "Agent M", expires: "2026-12-01" });
  writeSetting(store, "last-test:github-token:fixture/product", { at: "2026-10-10T00:00:00.000Z", outcome: "working" });
  const navigations = [];
  const oldFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url: String(url), init }); return new Response(JSON.stringify({ paired: true }), { status: 200 }); };
  const target = document.createElement("div");
  await route().render(target, { instance: { repository: "fixture/instance" }, product: null, store,
    go(name, params) { navigations.push({ name, params }); } }, {});

  const tabs = byClass(target, "settings-tab");
  click(tabs[2]);
  const remote = byClass(target, "settings-remote-session")[0];
  const token = byClass(remote, "settings-remote-session-token")[0];
  assert.equal(token.type, "password", "failure node: the rendered Settings line keeps the stored session secret hidden");
  click(byClass(remote, "settings-remote-session-show")[0]);
  assert.equal(token.type, "text", "Show is the explicit action that reveals the stored session secret");
  await new Promise((resolve) => { click(byClass(remote, "settings-remote-session-test")[0]); setImmediate(resolve); });
  assert.equal(calls[0].url, "http://localhost:40101/v1/pair", "Test follows the existing public pair path through the forwarded local port");
  assert.equal(calls[0].init.headers["x-agent-m-bridge-token"], "remote-token");
  assert.match(byClass(remote, "settings-remote-session-result")[0].textContent, /answers at localhost:40101/);
  click(byClass(remote, "settings-remote-session-change")[0]);
  assert.deepEqual(navigations, [{ name: "bridge", params: { name: "lab" } }], "Change enters the existing public Bridge setup route");

  click(tabs[1]);
  const product = byClass(target, "settings-product-list-item")[0];
  const priorConfirm = globalThis.confirm;
  globalThis.confirm = () => true;
  click(byClass(product, "settings-product-remove")[0]);
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(readSetting(store, "products"), [], "Remove updates the canonical browser product list");
  assert.equal(readSetting(store, "github-token:fixture/product"), null, "Remove takes the product's own GitHub token with its browser list entry");
  assert.equal(readSetting(store, "last-test:github-token:fixture/product"), null, "Remove takes the adjacent token-test metadata too");
  globalThis.confirm = priorConfirm;

  click(tabs[0]);
  const clear = byClass(target, "settings-clear-everything")[0];
  const acknowledgement = byClass(target, "settings-clear-ack")[0];
  assert.equal(clear.disabled, true, "failure node: browser clear requires the visible acknowledgement");
  acknowledgement.checked = true;
  acknowledgement.dispatchEvent(new Event("change"));
  assert.equal(clear.disabled, false);
  click(clear);
  assert.equal(readSetting(store, "remote-session:lab"), null, "clear reaches the canonical remote-session record");
  assert.equal(readSetting(store, "endpoint:main"), null, "clear reaches every current-instance browser setting");
  globalThis.fetch = oldFetch;
});

// TST-290111
// level: unit
// module: MOD-settings-pages
// guards: UC-042; A STORED SECRET IS HIDDEN UNTIL SHOWN; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; AN EXPIRED TOKEN IS NAMED AND ITS RENEWAL LINKED
// given: an unset instance GitHub credential and constructed GitHub repository replies
// input: the person opens Repositories, chooses Change, acknowledges the shared-origin notice, saves an expiring token, then tests it successfully and after a token refusal
// expect: save creates the canonical token and expiry record only after acknowledgement; Test sends it only to GitHub's repository API and persists dated working/refused metadata, while the renewal link is GitHub's token page
test("TST-290111: Settings saves, tests, and records an expiring repository token", async () => {
  const storage = new Storage();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  const store = openStore("fixture/instance");
  writeSetting(store, "gitlab-token:gitlab.example.test/group/product", { value: "glpat_fixtureToken", name: "Agent M", expires: "2026-12-01" });
  const target = document.createElement("div");
  const oldFetch = globalThis.fetch;
  let reply = 200, request;
  globalThis.fetch = async (url, init) => {
    request = { url: String(url), init };
    return new Response(JSON.stringify(reply === 200 ? { default_branch: "main", private: true, permissions: { push: true } } : { message: "Bad credentials" }), { status: reply });
  };
  try {
    await route().render(target, { instance: { repository: "fixture/instance" }, product: null, store, go() {} }, {});
    click(byClass(target, "settings-tab")[1]);
    const gitlab = byClass(target, "settings-repository").find((node) => /GitLab token: gitlab\.example\.test\/group\/product/.test(node.textContent));
    assert.equal(byClass(gitlab, "settings-repository-renew")[0].href, "https://gitlab.example.test/group/product/-/settings/access_tokens", "GitLab product credentials renew on that product's own Access tokens page");
    const line = byClass(target, "settings-repository").find((node) => /GitHub token/.test(node.textContent));
    const change = byClass(line, "settings-repository-change")[0];
    const acknowledgement = byClass(line, "settings-repository-ack")[0];
    const secret = byClass(line, "settings-repository-secret")[0];
    const expiry = byClass(line, "settings-repository-expiry")[0];
    const save = byClass(line, "settings-repository-save")[0];
    const testButton = byClass(line, "settings-repository-test")[0];
    const expires = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    assert.equal(save.disabled, true, "failure node: a replacement cannot be stored before Change and acknowledgement");
    click(change); acknowledgement.checked = true; acknowledgement.dispatchEvent(new Event("change"));
    secret.value = "ghp_fixtureToken"; expiry.value = expires; click(save);
    assert.deepEqual(readSetting(store, "github-token"), { value: "ghp_fixtureToken", name: "GitHub token", expires, stored: new Date().toISOString().slice(0, 10) });
    assert.match(byClass(line, "settings-repository-status")[0].textContent, /renew soon/i, "expiry within fourteen days is named at the Settings failure node");
    await new Promise((resolve) => { click(testButton); setImmediate(resolve); });
    assert.equal(request.url, "https://api.github.com/repos/fixture/instance");
    assert.equal(request.init.headers.Authorization, "Bearer ghp_fixtureToken", "the stored token reaches only its GitHub API request");
    assert.equal(readSetting(store, "last-test:github-token").outcome, "working");
    assert.match(byClass(line, "settings-repository-status")[0].textContent, /Last successful test:/);
    assert.equal(byClass(line, "settings-repository-renew")[0].href, "https://github.com/settings/personal-access-tokens");
    reply = 401;
    await new Promise((resolve) => { click(testButton); setImmediate(resolve); });
    assert.equal(readSetting(store, "last-test:github-token").outcome, "refused", "failure node: a repository-host refusal is persisted with the token row");
    assert.match(byClass(line, "settings-repository-status")[0].textContent, /Refused/);
    const priorConfirm = globalThis.confirm;
    let confirmations = 0;
    globalThis.confirm = () => { confirmations += 1; return false; };
    click(byClass(line, "settings-repository-clear")[0]);
    assert.equal(confirmations, 1, "failure node: Clear asks exactly one confirmation before any browser mutation");
    assert.equal(readSetting(store, "github-token").value, "ghp_fixtureToken", "a cancelled confirmation retains the token");
    globalThis.confirm = () => { confirmations += 1; return true; };
    click(byClass(line, "settings-repository-clear")[0]);
    assert.equal(confirmations, 2);
    assert.equal(readSetting(store, "github-token"), null, "the confirmed Clear reaches the canonical token");
    assert.match(byClass(line, "settings-repository-status")[0].textContent, /products cannot be added/i, "Clear states the actual consequence at its failure boundary");
    globalThis.confirm = priorConfirm;
  } finally { globalThis.fetch = oldFetch; }
});

// TST-290112
// level: unit
// module: MOD-settings-pages
// guards: UC-047; NOTIFICATIONS ARE SWITCHED ON BY THE PERSON; A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
// given: a browser that has refused notifications for this site
// input: the person opens the public Settings Route and selects Usability without pressing Switch on
// expect: the status names the refusal and browser-site-settings recovery path without a permission request or browser-store write
test("TST-290112: Settings names denied notification permission without asking again", async () => {
  const storage = new Storage();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  const priorNotification = globalThis.Notification;
  let asked = 0;
  Object.defineProperty(globalThis, "Notification", { configurable: true, value: { permission: "denied", requestPermission: async () => { asked += 1; return "denied"; } } });
  try {
    const store = openStore("fixture/instance");
    const target = document.createElement("div");
    await route().render(target, { instance: { repository: "fixture/instance" }, product: null, store, go() {} }, {});
    click(byClass(target, "settings-tab")[3]);
    const status = byClass(target, "settings-notifications-status")[0];
    assert.match(status.textContent, /Blocked.*site settings/i);
    assert.equal(asked, 0, "rendering or selecting Usability never requests notification permission");
    assert.equal(readSetting(store, "notifications"), null);
  } finally { Object.defineProperty(globalThis, "Notification", { configurable: true, value: priorNotification }); }
});

// TST-290113
// level: unit
// module: MOD-settings-pages
// guards: UC-042; A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT; A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
// given: a chosen product with a legacy dated collaborator-consent row and unrelated bytes
// input: the person names that collaborator and presses Remove collaborator consent on the public Settings Route
// expect: the public save boundary removes only the matching consent row and preserves the unrelated bytes and repository target
test("TST-290113: Settings removes one legacy collaborator consent row without altering unrelated bytes", async () => {
  const storage = new Storage();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  const collaborators = "# Collaborators of this product\n\n| Name | Account | Agreed on |\n|---|---|---|\n| Ada Example | @ada | 2026-09-01 |\n\nKeep this unrelated note.\n";
  const writes = [];
  const host = {
    async repositoryInfo() { return { defaultBranch: "main", canWrite: true }; },
    async readSnapshot() { return { blob(path) { return path === "docs/collaborators.md" ? "collab-sha" : null; }, async read(path) { return path === "docs/collaborators.md" ? collaborators : null; } }; },
    async commitFiles(change) { writes.push(change); return { commit: "a".repeat(40) }; },
  };
  const store = openStore("fixture/instance");
  const target = document.createElement("div");
  const navigations = [];
  const context = { instance: { repository: "fixture/instance" }, product: { address: "https://github.com/fixture/product", kind: "github", host }, store, go(name, params) { navigations.push({ name, params }); } };
  await route().render(target, context, {});
  click(byClass(target, "settings-tab")[1]);
  assert.match(byClass(target, "settings-product-read-only")[0].textContent, /no token that can write/i, "failure node: no browser token leaves the product form read-only");
  assert.match(byClass(target, "settings-product-access")[0].textContent, /writable/i, "the repositoryInfo access state remains visible rather than discarded");
  assert.equal(byClass(target, "settings-pseudonymisation-save").length, 0);
  click(byClass(target, "settings-product-token-step")[0]);
  assert.deepEqual(navigations, [{ name: "add-product", params: {} }], "read-only points to the existing UC-001 token step route");
  writeSetting(store, "github-token:fixture/product", { value: "ghp_fixtureToken" });
  await route().render(target, context, {});
  click(byClass(target, "settings-tab")[1]);
  assert.match(byClass(target, "settings-collaborator-records")[0].textContent, /Ada Example.*@ada.*2026-09-01/, "the selected product exposes the existing consent name, account, and date before any edit");
  byClass(target, "settings-collaborator-remove-name")[0].value = "Ada Example";
  byClass(target, "settings-collaborator-remove-account")[0].value = "@ada";
  await new Promise((resolve) => { click(byClass(target, "settings-collaborator-remove")[0]); setImmediate(resolve); });
  assert.equal(writes.length, 1, "the explicit click reaches the public one-file save boundary");
  const text = writes[0].files[0].text;
  assert.doesNotMatch(text, /Ada Example|@ada|2026-09-01/);
  assert.match(text, /Keep this unrelated note\.\n$/, "failure node: legacy unrelated bytes survive the targeted row removal");
  assert.equal(writes[0].files[0].path, "docs/collaborators.md");
});
