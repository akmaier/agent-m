// The folded explanations of the Settings page (ITM-643) — MOD-settings-pages puts MOD-site-frame's explain(<topic>) on each of its lines
// and sections, as every other route of the module does, and builds no fold of its own: the Bridge, the named Bridge, the jump host,
// the remote session, the repository token, the product list and each product in it, the notifications, the export and import, the
// clear, and a product's section in each of its four states (none chosen, unavailable, read-only, writable) with its job workflow.
// Run: node --test tests/settings-pages-explanations.test.mjs
//
// Module: MOD-settings-pages
// Guards: EVERY STEP EXPLAINS ITSELF; UC-042; UC-047
// Level: unit
//
// This takes the browser harness (the fixture document and its helpers) from tests/settings-pages-harness.mjs, the helper file of the
// tests of MOD-settings-pages, and imports no test file. What each explanation says is MOD-site-frame's, pinned in
// tests/site-frame-settings-explanations.test.mjs; here only that the line carries what the real explain() returns for the topic, and
// where. The product is a fixture host keeping to MOD-repository-hosts' interface (repositoryInfo, readSnapshot); nothing reaches the
// network. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are
// recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { installDocument, elements, byClass, click } from "./settings-pages-harness.mjs";

const document = installDocument();

const { view } = await import("../src/settings-pages/index.mjs");
const { explain } = await import("../src/site-frame/index.mjs");
const { openStore, writeSetting } = await import("../src/browser-store/index.mjs");
const route = view.routes.find((candidate) => candidate.name === "settings");

class FakeStorage {
  constructor() { this.map = new Map(); }
  getItem(k) { return this.map.has(k) ? this.map.get(k) : null; }
  setItem(k, v) { this.map.set(k, String(v)); }
  removeItem(k) { this.map.delete(k); }
  get length() { return this.map.size; }
  key(index) { return [...this.map.keys()][index] ?? null; }
}
function freshStore() {
  Object.defineProperty(globalThis, "localStorage", { value: new FakeStorage(), configurable: true, writable: true });
  return openStore("fixture/instance");
}

// The Notifications line reads the browser's own Notification and navigator.
async function withNotifications(run) {
  const notification = Object.getOwnPropertyDescriptor(globalThis, "Notification");
  const navigator = Object.getOwnPropertyDescriptor(globalThis, "navigator");
  Object.defineProperty(globalThis, "Notification", { value: { permission: "default", requestPermission: async () => "default" }, configurable: true, writable: true });
  Object.defineProperty(globalThis, "navigator", { value: { serviceWorker: { register: async () => ({}), getRegistration: async () => undefined }, userAgent: "node" }, configurable: true, writable: true });
  try { return await run(); } finally {
    if (notification) Object.defineProperty(globalThis, "Notification", notification); else delete globalThis.Notification;
    if (navigator) Object.defineProperty(globalThis, "navigator", navigator); else delete globalThis.navigator;
  }
}

async function render(store, product = null) {
  const target = document.createElement("div");
  document.body.append(target);
  await withNotifications(() => route.render(target, { page: "settings", instance: { repository: "fixture/instance" }, product, store, go() {} }, {}));
  return target;
}

// A product host: what repositoryInfo says, and an empty snapshot.
function productOf(info) {
  return {
    address: "https://github.com/fixture/product",
    host: {
      async repositoryInfo() { if (info instanceof Error) throw info; return info; },
      async readSnapshot() { return { commit: "0".repeat(40), paths: [], blob: () => null, async read() { return null; } }; },
    },
  };
}

// The folds that stand directly in a section.
const foldsOf = (section) => section.children.filter((child) => child.localName === "details");
const sectionsOf = (root, className) => byClass(root, className).filter((node) => node.localName === "section");
const sectionWith = (root, className, pattern) => sectionsOf(root, className).find((node) => pattern.test(node.textContent));

// The fold a section holds, which must be the one and only fold it holds directly, and the real explain()'s for the topic.
function assertFoldOf(section, topic, where) {
  assert.ok(section, `${where}: the section is rendered`);
  const known = explain(topic);
  assert.equal(known.children.length, 2, `${where}: known positive — the frame holds the topic ${topic}`);
  const folds = foldsOf(section);
  assert.equal(folds.length, 1, `${where}: the section holds exactly one fold directly`);
  const fold = folds[0];
  assert.equal(fold.className, "explain", `${where}: the fold is the frame's, with the frame's class and no class of its own`);
  assert.equal(fold.hasAttribute("open"), false, `${where}: it is folded`);
  assert.equal(fold.children[0].textContent, "What is this?", `${where}: its summary`);
  assert.equal(fold.innerHTML, known.innerHTML, `${where}: it is what explain("${topic}") returns`);
}

// TST-643201 · level: unit · module: MOD-settings-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-042
// given: a browser store keeping the Bridge, a Bridge named lab, the jump host, a remote session, the instance's GitHub token, and one product with its token
// input: the person opens Settings, then each of its tabs
// expect: the sections of the Bridge, the named Bridge, the jump host, the remote session, the token, the product list, the product's line in it, the export and import, and the clear each hold the frame's fold for settings-bridge-stored, settings-bridge-named, settings-jump-host, settings-remote-session, settings-token-stored, settings-managed-products, settings-product-address, settings-export-import and settings-clear-everything
test("Settings — each browser line and section holds the frame's fold of its topic", async () => {
  const store = freshStore();
  writeSetting(store, "bridge", { address: "http://127.0.0.1:8787", token: "bridge_fixture" });
  writeSetting(store, "bridge:lab", { address: "http://127.0.0.1:8788", token: "lab_fixture" });
  writeSetting(store, "jump-host", { hostname: "jump.example.test" });
  writeSetting(store, "remote-session:fixture", { port: 8789, token: "remote_fixture" });
  writeSetting(store, "github-token", { value: "ghp_fixture" });
  writeSetting(store, "products", ["https://github.com/fixture/product"]);
  writeSetting(store, "github-token:fixture/product", { value: "ghp_product" });
  const target = await render(store);
  for (const tab of byClass(target, "settings-tab")) await click(tab);
  const list = sectionsOf(target, "settings-product-list")[0];
  assertFoldOf(sectionsOf(target, "settings-bridge").find((node) => node.className === "settings-bridge panel"), "settings-bridge-stored", "the Bridge");
  assertFoldOf(sectionsOf(target, "settings-bridge-named")[0], "settings-bridge-named", "the named Bridge");
  assertFoldOf(sectionsOf(target, "settings-jump-host")[0], "settings-jump-host", "the jump host");
  assertFoldOf(sectionsOf(target, "settings-remote-session")[0], "settings-remote-session", "the remote session");
  assertFoldOf(sectionWith(target, "settings-repository", /GitHub token/), "settings-token-stored", "the token");
  assertFoldOf(list, "settings-managed-products", "the product list");
  assertFoldOf(sectionsOf(list, "settings-product-list-item")[0], "settings-product-address", "the product in the list");
  assertFoldOf(sectionsOf(target, "settings-export-import")[0], "settings-export-import", "the export and import");
  assertFoldOf(sectionsOf(target, "settings-clear")[0], "settings-clear-everything", "the clear");
});

// TST-643202 · level: unit · module: MOD-settings-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-042
// given: a browser store keeping the list of products
// input: the person opens Settings, then its tab Repositories
// expect: the line of the product list holds the frame's fold for settings-products-stored
test("Settings — the line of the stored product list holds the frame's fold of its topic", async () => {
  const store = freshStore();
  writeSetting(store, "products", ["https://github.com/fixture/product"]);
  const target = await render(store);
  await click(byClass(target, "settings-tab")[1]);
  const line = sectionsOf(target, "settings-repository").find((node) => /Products/.test(node.textContent));
  assertFoldOf(line, "settings-products-stored", "the stored product list");
});

// TST-643203 · level: unit · module: MOD-settings-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-047; UC-042
// given: a browser with notifications off, as the Notification global reports permission default
// input: the person opens Settings, then its tab Usability
// expect: the Notifications section holds the frame's fold for settings-notifications
test("Settings — the Notifications line holds the frame's fold of its topic", async () => {
  const target = await render(freshStore());
  await click(byClass(target, "settings-tab")[3]);
  assert.equal(byClass(target, "settings-notifications-status")[0].textContent, "Off.", "known positive: the line is rendered, notifications off");
  assertFoldOf(sectionsOf(target, "settings-notifications")[0], "settings-notifications", "the Notifications line");
});

// TST-643204 · level: unit · module: MOD-settings-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-042
// given: no product chosen
// input: the person opens Settings, then its tab Repositories
// expect: the product section holds the frame's fold for settings-product-none
test("Settings — the product section without a chosen product holds the frame's fold of its topic", async () => {
  const target = await render(freshStore(), null);
  await click(byClass(target, "settings-tab")[1]);
  assertFoldOf(sectionsOf(target, "settings-product")[0], "settings-product-none", "the product section, none chosen");
});

// TST-643205 · level: unit · module: MOD-settings-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-042
// given: a chosen product whose repository metadata cannot be read (repositoryInfo rejects with "offline")
// input: the person opens Settings, then its tab Repositories
// expect: the product section says the metadata is unavailable and holds the frame's fold for settings-product-unavailable
test("Settings — the product section whose metadata is unavailable holds the frame's fold of its topic", async () => {
  const target = await render(freshStore(), productOf(new Error("offline")));
  await click(byClass(target, "settings-tab")[1]);
  const section = sectionsOf(target, "settings-product")[0];
  assert.match(section.textContent, /Repository metadata is unavailable: offline/, "known positive: the unavailable branch is rendered");
  assertFoldOf(section, "settings-product-unavailable", "the product section, metadata unavailable");
});

// TST-643206 · level: unit · module: MOD-settings-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-042
// given: a chosen product whose repository reports canWrite false
// input: the person opens Settings, then its tab Repositories
// expect: the product section is read-only and holds the frame's fold for settings-product-read-only, and the job workflow section inside it holds the frame's fold for settings-job-workflow
test("Settings — the read-only product section and its job workflow hold the frame's folds of their topics", async () => {
  const target = await render(freshStore(), productOf({ defaultBranch: "main", canWrite: false, visibility: "public" }));
  await click(byClass(target, "settings-tab")[1]);
  const section = sectionsOf(target, "settings-product")[0];
  assert.ok(byClass(section, "settings-product-read-only")[0], "known positive: the read-only branch is rendered");
  assertFoldOf(section, "settings-product-read-only", "the product section, read-only");
  assertFoldOf(sectionsOf(section, "settings-job-workflow")[0], "settings-job-workflow", "the job workflow of the read-only product");
});

// TST-643207 · level: unit · module: MOD-settings-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-042
// given: a chosen product that the browser holds a token for and whose repository reports canWrite true
// input: the person opens Settings, then its tab Repositories
// expect: the product section is writable and holds the frame's fold for settings-product-records, and the job workflow section inside it holds the frame's fold for settings-job-workflow
test("Settings — the writable product section and its job workflow hold the frame's folds of their topics", async () => {
  const store = freshStore();
  writeSetting(store, "products", ["https://github.com/fixture/product"]);
  writeSetting(store, "github-token:fixture/product", { value: "ghp_product" });
  const target = await render(store, productOf({ defaultBranch: "main", canWrite: true, visibility: "public" }));
  await click(byClass(target, "settings-tab")[1]);
  const section = sectionsOf(target, "settings-product")[0];
  assert.ok(byClass(section, "settings-pseudonymisation-save")[0], "known positive: the writable branch is rendered");
  assertFoldOf(section, "settings-product-records", "the product section, writable");
  assertFoldOf(sectionsOf(section, "settings-job-workflow")[0], "settings-job-workflow", "the job workflow of the writable product");
});

// TST-643208 · level: unit · module: MOD-settings-pages
// guards: EVERY STEP EXPLAINS ITSELF; UC-042
// given: the page of TST-643201 — every line and section the Settings page has — and a writable product
// input: the person opens Settings, then each of its tabs
// expect: no element of the page carries the class settings-what-is-this, and every fold of the page is a <details class="explain"> and no other class
test("Settings — no fold of the page is built by the page: none carries a class of its own", async () => {
  const store = freshStore();
  writeSetting(store, "bridge", { address: "http://127.0.0.1:8787", token: "bridge_fixture" });
  writeSetting(store, "bridge:lab", { address: "http://127.0.0.1:8788", token: "lab_fixture" });
  writeSetting(store, "jump-host", { hostname: "jump.example.test" });
  writeSetting(store, "remote-session:fixture", { port: 8789, token: "remote_fixture" });
  writeSetting(store, "github-token", { value: "ghp_fixture" });
  writeSetting(store, "products", ["https://github.com/fixture/product"]);
  writeSetting(store, "github-token:fixture/product", { value: "ghp_product" });
  const target = await render(store, productOf({ defaultBranch: "main", canWrite: true, visibility: "public" }));
  for (const tab of byClass(target, "settings-tab")) await click(tab);
  const folds = elements(target, (node) => node.localName === "details");
  assert.ok(folds.length >= 12, "known positive: the page renders its folds");
  assert.deepEqual(folds.filter((fold) => fold.className !== "explain").map((fold) => fold.className), [], "every fold is the frame's alone");
  assert.deepEqual(byClass(target, "settings-what-is-this"), [], "no element carries the class settings-what-is-this");
});
