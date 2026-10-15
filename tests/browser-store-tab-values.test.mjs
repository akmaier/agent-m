// MOD-browser-store — the values one browser tab keeps in its sessionStorage (readTabValue, writeTabValue).

import test from "node:test";
import assert from "node:assert/strict";
import { exportSettings, importSettings, listSettings, openStore, readSetting, readTabValue, writeSetting, writeTabValue } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const PREFIX = `agent-m:${INSTANCE}:`;

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => { values.set(key, String(value)); },
    removeItem: (key) => { values.delete(key); },
    get length() { return values.size; },
    key: (index) => [...values.keys()][index] ?? null,
  };
}

function install(name, storage) {
  Object.defineProperty(globalThis, name, { value: storage, configurable: true, writable: true });
}

// TST-482001 · level: unit · module: MOD-browser-store
// guards: CONFIGURATION LIVES IN THE BROWSER
// given: two browser tabs of one instance, each with its own sessionStorage and a localStorage they share.
// input: writeTabValue(store, "prompt-bar-conversation", { turns: 2 }) in tab one, readTabValue in both tabs, then writeTabValue with null in tab one.
// expect: tab one reads { turns: 2 } back under the key agent-m:akmaier/agent-m:prompt-bar-conversation in its sessionStorage and nothing in localStorage; tab two reads null; after null tab one reads null and its sessionStorage holds no entry.
test("TST-482001 a tab value is read back in its tab, removed by null, and not read by another tab", () => {
  const local = memoryStorage();
  const tabOne = memoryStorage();
  const tabTwo = memoryStorage();
  install("localStorage", local);
  install("sessionStorage", tabOne);
  const storeOne = openStore(INSTANCE);
  writeTabValue(storeOne, "prompt-bar-conversation", { turns: 2 });
  assert.deepEqual(readTabValue(storeOne, "prompt-bar-conversation"), { turns: 2 });
  assert.equal(tabOne.getItem(`${PREFIX}prompt-bar-conversation`), '{"turns":2}');
  assert.equal(local.length, 0);

  install("sessionStorage", tabTwo);
  const storeTwo = openStore(INSTANCE);
  assert.equal(readTabValue(storeTwo, "prompt-bar-conversation"), null);

  install("sessionStorage", tabOne);
  writeTabValue(storeOne, "prompt-bar-conversation", null);
  assert.equal(readTabValue(storeOne, "prompt-bar-conversation"), null);
  assert.equal(tabOne.length, 0);
});

// TST-482002 · level: unit · module: MOD-browser-store
// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// given: a store holding the setting products and a tab value prompt-bar-conversation.
// input: listSettings(store), exportSettings(store), then importSettings of that export into a second browser whose sessionStorage is empty.
// expect: the list has no key prompt-bar-conversation, the export text does not contain it or its value, and after the import the second browser's sessionStorage holds no entry and its localStorage holds only products.
test("TST-482002 the list and the export hold no tab value and an import writes none", async () => {
  install("localStorage", memoryStorage());
  install("sessionStorage", memoryStorage());
  const store = openStore(INSTANCE);
  writeSetting(store, "products", ["akmaier/agent-m"]);
  writeTabValue(store, "prompt-bar-conversation", { secretTurn: "tab-only-text" });

  assert.equal(listSettings(store).some((info) => info.key === "prompt-bar-conversation"), false);
  const text = await exportSettings(store);
  assert.equal(text.includes("prompt-bar-conversation"), false);
  assert.equal(text.includes("tab-only-text"), false);

  const local = memoryStorage();
  const session = memoryStorage();
  install("localStorage", local);
  install("sessionStorage", session);
  const second = openStore(INSTANCE);
  await importSettings(second, text);
  assert.equal(session.length, 0);
  assert.equal(local.length, 1);
  assert.deepEqual(readSetting(second, "products"), ["akmaier/agent-m"]);
});

// TST-482003 · level: unit · module: MOD-browser-store
// guards: CONFIGURATION LIVES IN THE BROWSER
// given: a browser whose localStorage works and whose sessionStorage is absent, and one whose sessionStorage refuses writes.
// input: readTabValue and writeTabValue on the store of each.
// expect: both calls throw StorageUnavailable in the browser without sessionStorage, and writeTabValue throws StorageUnavailable in the one that refuses writes.
test("TST-482003 StorageUnavailable is thrown where sessionStorage cannot be used", () => {
  install("localStorage", memoryStorage());
  install("sessionStorage", undefined);
  const store = openStore(INSTANCE);
  assert.throws(() => readTabValue(store, "k"), { name: "StorageUnavailable" });
  assert.throws(() => writeTabValue(store, "k", 1), { name: "StorageUnavailable" });

  const refusing = { ...memoryStorage(), setItem() { throw new Error("quota"); } };
  install("sessionStorage", refusing);
  const refusingStore = openStore(INSTANCE);
  assert.throws(() => writeTabValue(refusingStore, "k", 1), { name: "StorageUnavailable" });
});
