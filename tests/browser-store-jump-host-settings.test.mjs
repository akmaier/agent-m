// MOD-browser-store's jump-host setting (ITM-279).
//
// Module: MOD-browser-store
// Guards: UC-044; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS; A STORED SECRET IS HIDDEN UNTIL SHOWN; A CLEAR IS A REAL CLEAR
// Level: unit
//
// Run: node --test tests/browser-store-jump-host-settings.test.mjs
//
// The Map-backed localStorage below is the same browser boundary exercised by the existing
// MOD-browser-store unit tests. It makes no network request and calls no paid service.

import test from "node:test";
import assert from "node:assert/strict";
import { StoreError, clearSetting, listSettings, openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const PREFIX = `agent-m:${INSTANCE}:`;
const JUMP_HOST = "jump-host";
const JUMP_HOST_VALUE = {
  hostname: "jump.example.test",
  user: "agent-m",
  sshPort: 2222,
  portRange: [42000, 42099],
  httpsAddress: "https://jump.example.test/agent-m",
  login: "jump-host-login-that-must-not-be-listed",
};

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    get length() { return values.size; },
    key: (index) => [...values.keys()][index] ?? null,
  };
}

function install(storage) {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
}

function byKey(settings) {
  return new Map(settings.map((setting) => [setting.key, setting]));
}

// TST-279-01 · module: MOD-browser-store · guards: UC-044; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
// given: an empty browser store and the accepted jump-host value
// input: write it, reopen the same instance, read it, then list settings
// expected result: the accepted value persists, and list metadata names its bridge setup route without returning login or any stored value
test("TST-279-01 persists the accepted jump-host value and lists only non-secret metadata", () => {
  install(memoryStorage());
  const first = openStore(INSTANCE);
  assert.ok(byKey(listSettings(first)).has(JUMP_HOST), "the jump host is listed while unset");
  writeSetting(first, JUMP_HOST, JUMP_HOST_VALUE);

  assert.deepEqual(readSetting(openStore(INSTANCE), JUMP_HOST), JUMP_HOST_VALUE,
    "reopening the instance returns the accepted jump-host value unchanged");

  const info = byKey(listSettings(openStore(INSTANCE))).get(JUMP_HOST);
  assert.deepEqual(Object.keys(info).sort(), ["expires", "grants", "key", "label", "lastTest", "secret", "setUpIn"],
    "the jump host has exactly SettingInfo's accepted fields");
  assert.equal(info.key, JUMP_HOST);
  assert.equal(info.secret, true, "the optional web-server login makes the setting secret");
  assert.equal(info.setUpIn, "bridge", "the setting is set up in the bridge route");
  assert.match(info.grants, /jump host/i, "metadata says what it grants");
  assert.equal(JSON.stringify(info).includes(JUMP_HOST_VALUE.login), false, "metadata never returns the login");
  assert.equal(JSON.stringify(info).includes(JUMP_HOST_VALUE.hostname), false, "metadata never returns stored values");
});

// TST-279-02 · module: MOD-browser-store · guards: UC-044; CONFIGURATION LIVES IN THE BROWSER
// given: two Agent M instances in one browser
// input: write a jump host for each instance and list both
// expected result: each instance reads and lists only its own jump-host setting
test("TST-279-02 isolates jump-host settings between instances", () => {
  install(memoryStorage());
  const first = openStore("alice/one");
  const second = openStore("bob/two");
  const other = { hostname: "other.example.test", user: "other", sshPort: 22, portRange: [43000, 43010] };
  writeSetting(first, JUMP_HOST, JUMP_HOST_VALUE);
  writeSetting(second, JUMP_HOST, other);

  assert.deepEqual(readSetting(first, JUMP_HOST), JUMP_HOST_VALUE);
  assert.deepEqual(readSetting(second, JUMP_HOST), other);
  assert.equal(byKey(listSettings(first)).has(JUMP_HOST), true);
  assert.equal(byKey(listSettings(second)).has(JUMP_HOST), true);
});

// TST-279-03 · module: MOD-browser-store · guards: A CLEAR IS A REAL CLEAR; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: a stored jump host including its optional login
// input: clearSetting(store, "jump-host")
// expected result: the actual localStorage entry, including its login, is gone and unknown settings remain refused
test("TST-279-03 clears the actual jump-host entry including its login and still refuses unknown keys", () => {
  const storage = memoryStorage();
  install(storage);
  const store = openStore(INSTANCE);
  writeSetting(store, JUMP_HOST, JUMP_HOST_VALUE);

  clearSetting(store, JUMP_HOST);

  assert.equal(storage.getItem(PREFIX + JUMP_HOST), null, "Clear removes the actual jump-host localStorage entry");
  assert.equal(readSetting(store, JUMP_HOST), null, "the cleared jump host cannot be read");
  assert.equal(JSON.stringify([...Array(storage.length)].map((_, index) => storage.getItem(storage.key(index)))).includes(JUMP_HOST_VALUE.login), false,
    "no retained localStorage value contains the cleared login");
  assert.throws(() => writeSetting(store, "unknown-jump-host", JUMP_HOST_VALUE),
    (error) => error instanceof StoreError && error.name === "UnknownSetting" && error.key === "unknown-jump-host");
});
