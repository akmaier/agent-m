// MOD-browser-store's catalogue key `browser` (ITM-1077), as the accepted text of docs/architecture/MOD-browser-store.md states it (:76): "this browser's identifier, sixteen random hexadecimal
// digits made at its first use, which a job record names when this browser's tab takes a job", not a secret; and :83-84: "A key outside this catalogue is never written: `writeSetting` refuses it,
// so no key exists that the settings page does not show." Nothing here makes the identifier: that is ITM-1025's.
// Run: node --test tests/browser-store-browser-id.test.mjs
//
// Module: MOD-browser-store
// Guards: EVERY SETTING IS REACHED FROM ONE PAGE; A CLEAR IS A REAL CLEAR; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
// Level: unit
//
// A Map-backed localStorage only; no request. Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { clearSetting, listSettings, openStore, readSetting, secretValues, writeSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const ID = "0123456789abcdef";
const KEY = `agent-m:${INSTANCE}:browser`;
function memoryStorage() {
  const values = new Map();
  return { getItem: (key) => (values.has(key) ? values.get(key) : null), setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key),
    get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null, values };
}
function fresh() {
  const storage = memoryStorage();
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  return { storage, store: openStore(INSTANCE) };
}

// TST-1077101 · level: unit · module: MOD-browser-store
// guards: EVERY SETTING IS REACHED FROM ONE PAGE
// given: an empty store of the instance
// input: writeSetting(store, "browser", "0123456789abcdef"), then readSetting(store, "browser")
// expect: no error; the value read is the identifier; localStorage holds it as JSON under agent-m:akmaier/agent-m:browser
test("writeSetting stores the key browser, which readSetting returns", () => {
  const { storage, store } = fresh();
  writeSetting(store, "browser", ID);
  assert.equal(readSetting(store, "browser"), ID);
  assert.equal(storage.values.get(KEY), JSON.stringify(ID));
});

// TST-1077102 · level: unit · module: MOD-browser-store
// guards: EVERY SETTING IS REACHED FROM ONE PAGE
// given: a store holding the identifier; and one holding none
// input: listSettings(store) of each
// expect: both list the key browser, with exactly the SettingInfo fields, secret false, a label, what it grants and where it is set up; the stored value appears nowhere in the list
test("listSettings lists the key browser as a setting that is not secret, set or not", () => {
  const { store } = fresh();
  const unset = listSettings(store).find((one) => one.key === "browser");
  assert.ok(unset, "listed while unset");
  writeSetting(store, "browser", ID);
  const set = listSettings(store).find((one) => one.key === "browser");
  for (const info of [unset, set]) {
    assert.deepEqual(Object.keys(info).sort(), ["expires", "grants", "key", "label", "lastTest", "secret", "setUpIn"]);
    assert.equal(info.secret, false);
    for (const field of ["label", "grants", "setUpIn"]) assert.ok(typeof info[field] === "string" && info[field].length > 0, field);
  }
  assert.equal(JSON.stringify(listSettings(store)).includes(ID), false);
  assert.deepEqual(secretValues(store), [], "an identifier is no secret");
});

// TST-1077103 · level: unit · module: MOD-browser-store
// guards: A CLEAR IS A REAL CLEAR
// given: a store holding the identifier
// input: clearSetting(store, "browser")
// expect: the key is gone from localStorage itself, and readSetting gives null
test("clearSetting removes the key browser from localStorage", () => {
  const { storage, store } = fresh();
  writeSetting(store, "browser", ID);
  assert.equal(storage.values.has(KEY), true, "known positive: stored before the clear");
  clearSetting(store, "browser");
  assert.equal(storage.values.has(KEY), false);
  assert.equal(readSetting(store, "browser"), null);
});

// TST-1077104 · level: unit · module: MOD-browser-store
// guards: EVERY SETTING IS REACHED FROM ONE PAGE
// given: an empty store
// input: writeSetting for the key "browser-id", which no key of the catalogue is
// expect: it throws UnknownSetting naming the key, and nothing is stored (green on the unchanged code: the known negative beside TST-1077101)
test("writeSetting still refuses a key outside the catalogue", () => {
  const { storage, store } = fresh();
  assert.throws(() => writeSetting(store, "browser-id", ID), (error) => error.name === "UnknownSetting" && error.key === "browser-id");
  assert.equal(storage.length, 0);
});
