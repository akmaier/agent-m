// The browser's store of products and tokens (ITM-204) — MOD-browser-store's interface as the accepted text of
// docs/architecture/MOD-browser-store.md states it, for what UC-001 keeps in the browser and, for UC-047, its
// notifications and what they notified: openStore, readSetting, writeSetting and clearSetting, over the catalogue's
// keys for the instance's GitHub token, a GitHub product's own token, a GitLab project's token, the list of products,
// notifications and notified.
// Run: node --test tests/browser-store.test.mjs
//
// Module: MOD-browser-store
// Guards: UC-001; UC-047; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE; A CLEAR IS A REAL CLEAR; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; A GITHUB PRODUCT USES A TOKEN OF ITS OWN
// Level: unit
//
// What ITM-204 builds, and these tests state:
// - openStore(instance) opens this browser's store for one instance, under the prefix the module's file states
//   ("agent-m:<owner>/<repository>:"), and throws StorageUnavailable where localStorage refuses it.
// - writeSetting/readSetting/clearSetting hold and remove a value under one of the catalogue's keys this item names;
//   writeSetting throws UnknownSetting for any other key, and StorageUnavailable with it; nothing is ever written to a
//   cookie, and a cleared key is gone from localStorage itself, not only from readSetting's answer.
//
// Not tested here, since ITM-204 leaves them out: clearEverything, listSettings, exportSettings, importSettings,
// readExport, expiringSoon and secretValues, and the rest of the module's catalogue (endpoints, the Bridge, the jump
// host, remote sessions, the mailbox, "not an issue", "acknowledged" and "last-test").
//
// Each test states its input and its expected result before it runs (given / input / expect). localStorage is a
// stand-in this file installs on globalThis before each test, Map-backed as the dashboard's own test harness installs
// it (tests/app-harness.mjs); nothing here reaches the network. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { StoreError, clearSetting, openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const PREFIX = `agent-m:${INSTANCE}:`;

// This item's six catalogue keys, with a value shaped as the module's file states for that key.
const CASES = [
  ["github-token", { value: "ghp_instance", name: "Agent M · akmaier/agent-m", expires: "2027-01-03", stored: "2026-10-07" }],
  ["github-token:alice/thesis-tool", { value: "ghp_product", name: "Agent M · alice/thesis-tool", expires: "2027-01-10", stored: "2026-10-07" }],
  ["gitlab-token:gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool",
    { value: "glpat_project", name: "Agent M", expires: "2027-02-01", stored: "2026-10-07" }],
  ["products", ["https://github.com/alice/thesis-tool", "https://gitlab.rrze.fau.de/fau-ai-taskforce/tools/thesis-tool"]],
  ["notifications", { checked: "2026-10-07T09:00:00.000Z" }],
  ["notified", { "akmaier/agent-m": { "docs/use-cases/UC-047-be-told-what-waits-for-your-acceptance.md": "9c3cf6e05005" } }],
];

// A Map-backed localStorage, as tests/app-harness.mjs's own stand-in works.
function memoryStorage(initial = {}) {
  const mem = new Map(Object.entries(initial));
  return {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => { mem.set(k, String(v)); },
    removeItem: (k) => { mem.delete(k); },
    get length() { return mem.size; },
    key: (i) => [...mem.keys()][i] ?? null,
  };
}

function install(storage) {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
}

// A document stand-in whose cookie jar records every write, so a test can tell that none ever happened.
function installCookieJar() {
  const jar = { value: "" };
  Object.defineProperty(globalThis, "document", {
    value: { get cookie() { return jar.value; }, set cookie(v) { jar.value += (jar.value ? "; " : "") + String(v); } },
    configurable: true, writable: true,
  });
  return jar;
}

// guards: UC-001; UC-047; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE; THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER; A GITHUB PRODUCT USES A TOKEN OF ITS OWN
// given: a working localStorage, no cookie yet, and this item's six catalogue keys with a value shaped as the module's
//        file states for each
// input: for each key — readSetting before anything is stored, then writeSetting(store, key, value), then readSetting
// expect: each key starts unset; after writeSetting, localStorage itself holds the value as JSON under
//         "agent-m:<instance>:<key>"; readSetting gives the value back unchanged; no cookie was ever written
test("writeSetting/readSetting keep this item's catalogue keys in localStorage, under the instance's prefix, and set no cookie", () => {
  install(memoryStorage());
  const cookies = installCookieJar();
  const store = openStore(INSTANCE);

  for (const [key, value] of CASES) {
    assert.equal(readSetting(store, key), null, `${key} starts unset`);
    writeSetting(store, key, value);
    assert.equal(globalThis.localStorage.getItem(PREFIX + key), JSON.stringify(value), `${key} is kept in localStorage under its prefix`);
    assert.deepEqual(readSetting(store, key), value, `${key} reads back unchanged`);
  }
  assert.equal(cookies.value, "", "nothing was ever written to a cookie");
});

// guards: UC-001; A CLEAR IS A REAL CLEAR
// given: a working localStorage with each of this item's catalogue keys set
// input: clearSetting(store, key), for each key
// expect: the key is gone from localStorage itself, not only unreadable through readSetting
test("clearSetting removes each catalogue key from localStorage itself, not only from readSetting's answer", () => {
  install(memoryStorage());
  const store = openStore(INSTANCE);
  for (const [key, value] of CASES) writeSetting(store, key, value);

  for (const [key] of CASES) {
    clearSetting(store, key);
    assert.equal(globalThis.localStorage.getItem(PREFIX + key), null, `${key} is gone from localStorage itself`);
    assert.equal(readSetting(store, key), null, `${key} reads back as unset`);
  }
});

// guards: UC-001
// given: a working localStorage and a key outside this item's catalogue
// input: writeSetting(store, "not-a-setting", "x")
// expect: throws StoreError named UnknownSetting, naming the key; nothing was written
test("writeSetting refuses a key outside the catalogue with UnknownSetting", () => {
  install(memoryStorage());
  const store = openStore(INSTANCE);
  assert.throws(() => writeSetting(store, "not-a-setting", "x"),
    (e) => e instanceof StoreError && e.name === "UnknownSetting" && e.key === "not-a-setting");
  assert.equal(globalThis.localStorage.getItem(`${PREFIX}not-a-setting`), null, "nothing was written");
});

// guards: UC-001
// given: a localStorage that exists but refuses every write, as a browser's private window has historically done
// input: openStore(instance)
// expect: throws StoreError named StorageUnavailable
test("openStore throws StorageUnavailable where localStorage refuses to store anything", () => {
  install({ getItem: () => null, setItem: () => { throw new Error("QuotaExceededError"); }, removeItem: () => {}, length: 0, key: () => null });
  assert.throws(() => openStore(INSTANCE), (e) => e instanceof StoreError && e.name === "StorageUnavailable");
});

// guards: UC-001
// given: a store opened over a working localStorage, which then starts refusing every write — a quota used up, or the
//        browser taking storage away, after the store was opened
// input: writeSetting(store, "products", [...])
// expect: throws StoreError named StorageUnavailable
test("writeSetting throws StorageUnavailable where localStorage refuses the write after the store was opened", () => {
  const storage = memoryStorage();
  install(storage);
  const store = openStore(INSTANCE);
  storage.setItem = () => { throw new Error("QuotaExceededError"); };
  assert.throws(() => writeSetting(store, "products", ["https://github.com/alice/thesis-tool"]),
    (e) => e instanceof StoreError && e.name === "StorageUnavailable");
});
