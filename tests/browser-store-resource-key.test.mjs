// MOD-browser-store's setting `resource-key:<name>` (ITM-1073), as the accepted text of docs/architecture/MOD-browser-store.md states it: "`{ value, stored }` — the key of the
// resource `<name>` whose list entry names its secret `browser` (MOD-resource-list), sent only to that resource's own server (UC-040)", a secret.
//
// Module: MOD-browser-store
// Guards: UC-040; A STORED SECRET IS HIDDEN UNTIL SHOWN; A CLEAR IS A REAL CLEAR
// Level: unit
//
// Run: node --test tests/browser-store-resource-key.test.mjs
//
// These tests use an in-memory localStorage stand-in only. They make no request.

import test from "node:test";
import assert from "node:assert/strict";
import { clearSetting, listSettings, openStore, readSetting, secretValues, writeSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";

function install() {
  const values = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    value: { getItem: (key) => (values.has(key) ? values.get(key) : null), setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key),
      key: (index) => [...values.keys()][index] ?? null, get length() { return values.size; } },
    configurable: true, writable: true,
  });
}

// TST-1073004 · level: unit · module: MOD-browser-store
// guards: UC-040; A STORED SECRET IS HIDDEN UNTIL SHOWN; A CLEAR IS A REAL CLEAR
// given: a store where the key "hub_KEY0123456789" is written under resource-key:shared-llm as { value, stored }
// input: read it, list the settings, ask secretValues, clear it
// expect: the read gives { value, stored } as written; the list names resource-key:shared-llm as a secret and holds the key nowhere; secretValues holds the key; after the clear the read gives null and secretValues does not hold it
test("resource-key:<name> is a stored secret that is read, listed hidden, counted among the secret values, and cleared", () => {
  install();
  const store = openStore(INSTANCE);
  const KEY = "hub_KEY0123456789";
  writeSetting(store, "resource-key:shared-llm", { value: KEY, stored: "2026-10-19T08:00:00.000Z" });
  assert.deepEqual(readSetting(store, "resource-key:shared-llm"), { value: KEY, stored: "2026-10-19T08:00:00.000Z" });
  const listed = listSettings(store).find((setting) => setting.key === "resource-key:shared-llm");
  assert.equal(listed?.secret, true);
  assert.equal(JSON.stringify(listed).includes(KEY), false);
  assert.ok(secretValues(store).includes(KEY));
  clearSetting(store, "resource-key:shared-llm");
  assert.equal(readSetting(store, "resource-key:shared-llm"), null);
  assert.equal(secretValues(store).includes(KEY), false);
});
