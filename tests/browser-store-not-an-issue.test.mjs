// MOD-browser-store's catalogue key `not-an-issue` (ITM-957), as the accepted text of docs/architecture/MOD-browser-store.md states it (:75, blob 4c942dfe3dbe): "| `not-an-issue` | the identifiers of mails marked *not an issue* | no |",
// and :108: "`writeSetting` ... Throws `UnknownSetting` for any other key". Nothing here marks a mail: that is MOD-mail-handling's (ITM-956).
// Run: node --test tests/browser-store-not-an-issue.test.mjs
//
// Module: MOD-browser-store
// Guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN; EVERY SETTING IS REACHED FROM ONE PAGE; A CLEAR IS A REAL CLEAR
// Level: unit
//
// A Map-backed localStorage only; no request. Each test states its input and its expected result before it runs (given / input / expect). Readings the texts leave open, which the tests state: the value is a list of
// `MAIL-` identifiers, stored as JSON like every setting; the key is no secret (the catalogue's third column says "no"), so listSettings gives it `secret: false` and exportSettings carries it. The counter-proofs are recorded in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { clearSetting, exportSettings, listSettings, openStore, readSetting, secretValues, writeSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const MARKS = ["MAIL-0123456789abcdef", "MAIL-fedcba9876543210"];
const KEY = `agent-m:${INSTANCE}:not-an-issue`;
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

// TST-957001 · level: unit · module: MOD-browser-store
// guards: A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
// given: an empty store of the instance
// input: writeSetting(store, "not-an-issue", the two identifiers), then readSetting(store, "not-an-issue")
// expect: no error; the list read is the one written; localStorage holds it as JSON under agent-m:akmaier/agent-m:not-an-issue
test("writeSetting stores the key not-an-issue, which readSetting returns", () => {
  const { storage, store } = fresh();
  writeSetting(store, "not-an-issue", MARKS);
  assert.deepEqual(readSetting(store, "not-an-issue"), MARKS);
  assert.equal(storage.values.get(KEY), JSON.stringify(MARKS));
});

// TST-957002 · level: unit · module: MOD-browser-store
// guards: EVERY SETTING IS REACHED FROM ONE PAGE
// given: a store holding the marks; and one holding none
// input: listSettings(store) of each; secretValues; exportSettings (unlocked)
// expect: both list the key not-an-issue, with exactly the SettingInfo fields, secret false, a label, what it grants and where it is set up; the marks appear nowhere in the list; no secret value; the export carries the marks
test("listSettings lists the key not-an-issue as a setting that is not secret, and an export holds it", async () => {
  const { store } = fresh();
  const unset = listSettings(store).find((one) => one.key === "not-an-issue");
  assert.ok(unset, "listed while unset");
  writeSetting(store, "not-an-issue", MARKS);
  const set = listSettings(store).find((one) => one.key === "not-an-issue");
  for (const info of [unset, set]) {
    assert.deepEqual(Object.keys(info).sort(), ["expires", "grants", "key", "label", "lastTest", "secret", "setUpIn"]);
    assert.equal(info.secret, false);
    for (const field of ["label", "grants", "setUpIn"]) assert.ok(typeof info[field] === "string" && info[field].length > 0, field);
  }
  assert.equal(JSON.stringify(listSettings(store)).includes(MARKS[0]), false);
  assert.deepEqual(secretValues(store), []);
  assert.equal((await exportSettings(store)).includes(MARKS[0]), true, "an export holds the marks (UC-038 1a)");
});

// TST-957003 · level: unit · module: MOD-browser-store
// guards: A CLEAR IS A REAL CLEAR
// given: a store holding the marks
// input: clearSetting(store, "not-an-issue")
// expect: the key is gone from localStorage itself, and readSetting gives null
test("clearSetting removes the key not-an-issue from localStorage", () => {
  const { storage, store } = fresh();
  writeSetting(store, "not-an-issue", MARKS);
  assert.equal(storage.values.has(KEY), true, "known positive: stored before the clear");
  clearSetting(store, "not-an-issue");
  assert.equal(storage.values.has(KEY), false);
  assert.equal(readSetting(store, "not-an-issue"), null);
});

// TST-957004 · level: unit · module: MOD-browser-store
// guards: EVERY SETTING IS REACHED FROM ONE PAGE
// given: an empty store
// input: writeSetting for the key "not-an-issues", which no key of the catalogue is
// expect: it throws UnknownSetting naming the key, and nothing is stored (green on the unchanged code: the known negative beside TST-957001)
test("writeSetting still refuses a key outside the catalogue", () => {
  const { storage, store } = fresh();
  assert.throws(() => writeSetting(store, "not-an-issues", MARKS), (error) => error.name === "UnknownSetting" && error.key === "not-an-issues");
  assert.equal(storage.length, 0);
});
