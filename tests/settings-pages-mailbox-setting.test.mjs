// The mailbox among the settings of this browser (ITM-992; UC-037 "Settings → Mailbox → Connect a mailbox") — MOD-settings-pages' route `settings`, as docs/architecture/MOD-settings-pages.md
// states it ("one line per setting with its state: ... not set. A browser setting has *Test*, *Change* and *Clear*"): the Settings page draws the mailbox line in the tab Endpoints &
// Agents in both states. Not set: the state "not set" and *Connect a mailbox*, which opens the route `mailbox`. Connected: the line as before, with its *Test* and *Disconnect*, and
// *Change*, which opens the same route.
// Run: node --test tests/settings-pages-mailbox-setting.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-037; EVERY SETTING IS REACHED FROM ONE PAGE; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// Level: unit
//
// The document is the small DOM of tests/site-frame-dom.mjs, imported unchanged; the store is a Map-backed localStorage. The readings the item takes, which the pull request names:
//   - *Change* of the mailbox is the route `mailbox` (`context.go("mailbox", {})`), as *Change* of an endpoint is the route `endpoints`.
//   - The state follows the store: a mailbox disconnected on the page shows as not set, with *Connect a mailbox*, at once.
// The counter-proofs are recorded in the pull request.

import "./site-frame-dom.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";

const { view } = await import("../src/settings-pages/index.mjs");
const { openStore, readSetting, writeSetting } = await import("../src/browser-store/index.mjs");

const settings = view.routes.find((candidate) => candidate.name === "settings");
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
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child.nodeType === 1) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => (node.className ?? "").split(" ").includes(name));
const buttonsOf = (root, text) => descendants(root, (node) => node.localName === "button" && node.textContent === text);
const settle = () => new Promise((resolve) => setTimeout(resolve, 10));
const click = async (node) => { node.dispatchEvent(new Event("click")); await settle(); };

const IMAP = { address: "reports@example.test", route: "imap", folders: ["INBOX"], places: [],
  imap: { bridge: "laptop", jumpHostNoted: false, imap: { host: "imap.example.test", port: 993, security: "tls" }, smtp: { host: "smtp.example.test", port: 587, security: "starttls" },
    account: "reports@example.test", password: "app-password-constructed-001" } };

function browser(t, { mailbox = null } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: webcrypto });
  const store = openStore("fixture/instance");
  if (mailbox) {
    writeSetting(store, "mailbox", mailbox);
    writeSetting(store, "last-test:mailbox", { at: "2026-10-11T08:00:00.000Z", outcome: "working" });
  }
  const went = [];
  const priorConfirm = globalThis.confirm;
  globalThis.confirm = () => true;
  t.after(() => { globalThis.confirm = priorConfirm; });
  const context = { instance: { repository: "fixture/instance", host: { repositoryInfo: async () => ({ defaultBranch: "main", canWrite: true }),
    readSnapshot: async () => ({ paths: [], blob: () => null, read: async () => null }) } }, product: null, store, go: (...args) => went.push(args) };
  return { store, went, async open() { const target = document.createElement("div"); document.body.append(target); await settings.render(target, context, {}); await settle(); return target; } };
}
// The tab Endpoints & Agents of the page: the panel that holds its heading.
const endpointsTab = (shown) => descendants(shown, (node) => (node.className ?? "").split(" ").includes("settings-tab-panel")
  && descendants(node, (inner) => inner.localName === "h3" && /^Endpoints & Agents/.test(inner.textContent)).length > 0)[0];

// TST-992001 · level: unit · module: MOD-settings-pages
// guards: UC-037; EVERY SETTING IS REACHED FROM ONE PAGE
// given: a store without `mailbox`
// input: the route settings; the click of Connect a mailbox
// expect: the tab Endpoints & Agents holds the mailbox line with the state not set and one Connect a mailbox, and no Change, Test or Disconnect; the click calls go("mailbox", {}) once
test("settings — an unset mailbox is shown as not set, with Connect a mailbox, which opens the route mailbox", async (t) => {
  const b = browser(t);
  const tab = endpointsTab(await b.open());
  assert.ok(tab, "known positive: the tab Endpoints & Agents is found");
  const line = byClass(tab, "mailbox-setting");
  assert.equal(line.length, 1, "one mailbox line");
  assert.match(line[0].textContent, /Mailbox/);
  assert.match(line[0].textContent, /not set/);
  assert.equal(buttonsOf(line[0], "Connect a mailbox").length, 1);
  for (const absent of ["Change", "Test", "Disconnect"]) assert.equal(buttonsOf(line[0], absent).length, 0, absent);
  await click(buttonsOf(line[0], "Connect a mailbox")[0]);
  assert.deepEqual(b.went, [["mailbox", {}]]);
});

// TST-992002 · level: unit · module: MOD-settings-pages
// guards: UC-037; EVERY SETTING IS REACHED FROM ONE PAGE; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: a stored IMAP connection, tested successfully
// input: the route settings; the click of Change
// expect: the line shows the connection (address, state connected) with Test, Disconnect and one Change, and no Connect a mailbox; the click calls go("mailbox", {}) once
test("settings — a connected mailbox is shown with Change, which opens the route mailbox", async (t) => {
  const b = browser(t, { mailbox: IMAP });
  const line = byClass(endpointsTab(await b.open()), "mailbox-setting");
  assert.equal(line.length, 1);
  assert.match(line[0].textContent, /reports@example\.test/);
  assert.match(byClass(line[0], "mailbox-state")[0].textContent, /connected/i);
  assert.equal(buttonsOf(line[0], "Connect a mailbox").length, 0);
  for (const present of ["Test", "Disconnect"]) assert.equal(buttonsOf(line[0], present).length, 1, present);
  assert.equal(buttonsOf(line[0], "Change").length, 1);
  await click(buttonsOf(line[0], "Change")[0]);
  assert.deepEqual(b.went, [["mailbox", {}]]);
});

// TST-992003 · level: unit · module: MOD-settings-pages
// guards: UC-037; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// given: a stored IMAP connection
// input: the route settings; Disconnect on the line (the question answered yes)
// expect: the setting `mailbox` is gone from the store, and the line shows not set with Connect a mailbox and no Change
test("settings — once the mailbox is disconnected the line is not set, with Connect a mailbox", async (t) => {
  const b = browser(t, { mailbox: IMAP });
  const line = byClass(endpointsTab(await b.open()), "mailbox-setting")[0];
  await click(buttonsOf(line, "Disconnect")[0]);
  assert.equal(readSetting(b.store, "mailbox"), null);
  assert.match(line.textContent, /not set/);
  assert.equal(buttonsOf(line, "Connect a mailbox").length, 1);
  assert.equal(buttonsOf(line, "Change").length, 0);
});
