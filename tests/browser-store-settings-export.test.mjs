// MOD-browser-store's canonical settings export (ITM-283).
//
// Module: MOD-browser-store
// Guards: UC-042; UC-044; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS;
// AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; CONFIGURATION LIVES IN THE BROWSER;
// THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
// Level: unit
//
// Run: node --test tests/browser-store-settings-export.test.mjs
//
// The tests use constructed credentials and a Map-backed localStorage fixture only.
// They perform no network or device operation.

import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import {
  StoreError,
  clearSetting,
  exportSettings,
  importSettings,
  listSettings,
  openStore,
  readExport,
  readSetting,
  writeSetting,
} from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const OTHER_INSTANCE = "other/instance";
const PREFIX = `agent-m:${INSTANCE}:`;

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    get length() { return values.size; },
    key: (index) => [...values.keys()][index] ?? null,
    snapshot: () => [...values.entries()].sort(),
  };
}

function install(storage) {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true, writable: true });
}

const settings = {
  "github-token": { value: "github-secret-constructed-001", name: "Agent M", expires: "2027-01-03", stored: "2026-10-09" },
  "github-token:alice/product": { value: "github-product-secret-constructed-002", name: "Product", expires: "2027-02-01", stored: "2026-10-09" },
  "gitlab-token:gitlab.example.test/team/product": { value: "gitlab-secret-constructed-003", name: "Project", expires: "2027-03-01", stored: "2026-10-09" },
  products: ["https://github.com/alice/product"],
  "endpoint:campus": { url: "https://models.example.test/v1", kind: "openai-compatible", model: "campus-1", key: "endpoint-secret-constructed-004", throughBridge: false },
  bridge: { address: "http://127.0.0.1:8111", token: "bridge-secret-constructed-005" },
  "jump-host": { hostname: "jump.example.test", user: "agent-m", sshPort: 2222, portRange: [42000, 42099], httpsAddress: "https://jump.example.test/bridge", login: { user: "jump-web-user", password: "jump-secret-constructed-006" } },
  "remote-session:lab": { port: 42001, token: "remote-secret-constructed-007" },
  notifications: { checked: "2026-10-09T16:00:00.000Z" },
  notified: { "alice/product": { "SPEC.md": "0123456789abcdef" } },
  "last-test:bridge": { at: "2026-10-09T16:01:00.000Z", outcome: "working" },
};

function populate(store, values = settings) {
  for (const [key, value] of Object.entries(values)) writeSetting(store, key, value);
}

function assertCanonicalPlain(file) {
  assert.deepEqual(Object.keys(file).sort(), ["agent-m-settings", "exported", "foreign", "instance", "locked", "settings"],
    "the plain export has exactly the accepted version-1 envelope fields");
  assert.equal(file["agent-m-settings"], 1);
  assert.equal(file.instance, INSTANCE);
  assert.equal(file.locked, false);
  assert.match(file.exported, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.deepEqual(file.foreign, {}, "the bounded implemented catalogue exports no foreign sign-in-library keys");
}

// TST-283001
// level: unit
// module: MOD-browser-store
// guards: UC-042; UC-044; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; CONFIGURATION LIVES IN THE BROWSER
// given: one instance containing every implemented catalogue family, constructed secrets, and another instance's secret
// input: exportSettings(store), then readExport(text) after localStorage is unavailable in Node
// expect: the exact version-1 plain envelope holds only this instance's values, every secret included, and Node reads it without localStorage
test("TST-283001 exports and reads the canonical plain version-1 envelope without localStorage", async () => {
  const storage = memoryStorage();
  install(storage);
  const store = openStore(INSTANCE);
  populate(store);
  writeSetting(openStore(OTHER_INSTANCE), "bridge", { address: "https://other.example.test", token: "other-instance-secret" });

  const text = await exportSettings(store);
  const file = JSON.parse(text);
  assertCanonicalPlain(file);
  assert.deepEqual(file.settings, settings, "every implemented setting and constructed secret is exported as its value");
  assert.equal(text.includes("other-instance-secret"), false, "another instance's setting is not exported");

  Object.defineProperty(globalThis, "localStorage", { value: undefined, configurable: true, writable: true });
  assert.deepEqual(await readExport(text), { instance: INSTANCE, settings }, "Node reads the export without opening browser storage");
});

// TST-283002
// level: unit
// module: MOD-browser-store
// guards: UC-042; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// given: every implemented setting and constructed secret in one browser instance
// input: exportSettings(store, passphrase), readExport with the passphrase, then import with a wrong passphrase
// expect: the locked version-1 envelope exposes no secret, uses PBKDF2/SHA-256/600000 and AES-GCM, round-trips with the passphrase, and a wrong passphrase changes no byte
test("TST-283002 locks every exported secret with the accepted WebCrypto envelope and leaves storage unchanged on a wrong passphrase", async () => {
  const storage = memoryStorage();
  install(storage);
  const store = openStore(INSTANCE);
  populate(store);
  const before = storage.snapshot();

  const text = await exportSettings(store, "correct constructed passphrase");
  const file = JSON.parse(text);
  assert.deepEqual(Object.keys(file).sort(), ["agent-m-settings", "cipher", "data", "exported", "instance", "kdf", "locked"],
    "the locked export has exactly the accepted encrypted envelope fields");
  assert.equal(file["agent-m-settings"], 1);
  assert.equal(file.instance, INSTANCE);
  assert.equal(file.locked, true);
  assert.deepEqual(Object.keys(file.kdf).sort(), ["hash", "iterations", "name", "salt"]);
  assert.deepEqual(file.kdf.name, "PBKDF2");
  assert.deepEqual(file.kdf.hash, "SHA-256");
  assert.equal(file.kdf.iterations, 600000);
  assert.deepEqual(Object.keys(file.cipher).sort(), ["iv", "name"]);
  assert.equal(file.cipher.name, "AES-GCM");
  assert.equal(typeof file.data, "string");
  for (const secret of [settings["github-token"].value, settings["endpoint:campus"].key, settings.bridge.token, settings["jump-host"].login.password, settings["remote-session:lab"].token]) {
    assert.equal(text.includes(secret), false, `the locked envelope exposes no ${secret}`);
  }
  assert.deepEqual(await readExport(text, "correct constructed passphrase"), { instance: INSTANCE, settings });

  await assert.rejects(importSettings(store, text, "wrong constructed passphrase"),
    (error) => error instanceof StoreError && error.name === "WrongPassphrase");
  assert.deepEqual(storage.snapshot(), before, "a wrong passphrase writes no localStorage byte");
});

// TST-283003
// level: unit
// module: MOD-browser-store
// guards: UC-042; UC-044; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: a saved remote session with a constructed bridge token
// input: reopen the instance, list its settings, and clear the remote session
// expect: the session persists under its own name, metadata returns no raw port or token, and Clear removes the raw localStorage entry
test("TST-283003 persists named remote sessions, lists no secret metadata, and clears their raw entry", () => {
  const storage = memoryStorage();
  install(storage);
  const store = openStore(INSTANCE);
  const key = "remote-session:lab";
  const value = settings[key];
  writeSetting(store, key, value);

  assert.deepEqual(readSetting(openStore(INSTANCE), key), value, "reopening preserves the named session value");
  const info = listSettings(store).find((setting) => setting.key === key);
  assert.deepEqual(Object.keys(info).sort(), ["expires", "grants", "key", "label", "lastTest", "secret", "setUpIn"]);
  assert.equal(info.secret, true);
  assert.equal(info.setUpIn, "bridge");
  assert.equal(JSON.stringify(info).includes(value.token), false, "metadata does not expose the remote token");
  assert.equal(JSON.stringify(info).includes(String(value.port)), false, "metadata does not expose the remote port");

  clearSetting(store, key);
  assert.equal(storage.getItem(PREFIX + key), null, "Clear removes the raw remote-session entry");
});

// TST-283004
// level: unit
// module: MOD-browser-store
// guards: UC-042; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
// given: an export with missing settings, an existing destination key with deliberately noncanonical raw JSON bytes, malformed input, and a valid envelope with an unknown key after a missing one
// input: importSettings(destination, export), then import each invalid input
// expect: missing keys are added, existing bytes remain exact, added/kept keys are returned, and each invalid input makes no partial change
test("TST-283004 imports only absent settings and validates every incoming key before any write", async () => {
  const sourceStorage = memoryStorage();
  install(sourceStorage);
  const source = openStore(INSTANCE);
  populate(source, { "github-token": settings["github-token"], bridge: settings.bridge, "remote-session:lab": settings["remote-session:lab"] });
  const text = await exportSettings(source);

  const destinationStorage = memoryStorage({ [PREFIX + "github-token"]: '{ "value" : "kept-byte-exact" }' });
  install(destinationStorage);
  const destination = openStore(INSTANCE);
  const result = await importSettings(destination, text);
  assert.deepEqual(result.added.sort(), ["bridge", "remote-session:lab"]);
  assert.deepEqual(result.kept, ["github-token"]);
  assert.equal(destinationStorage.getItem(PREFIX + "github-token"), '{ "value" : "kept-byte-exact" }', "an existing setting is not rewritten");
  assert.deepEqual(readSetting(destination, "bridge"), settings.bridge);
  assert.deepEqual(readSetting(destination, "remote-session:lab"), settings["remote-session:lab"]);
  const beforeMalformed = destinationStorage.snapshot();

  await assert.rejects(importSettings(destination, "{ not JSON"),
    (error) => error instanceof StoreError && error.name === "NotAnExport");
  assert.deepEqual(destinationStorage.snapshot(), beforeMalformed, "malformed input cannot write after validation");

  const validButUnknown = JSON.stringify({
    "agent-m-settings": 1,
    instance: INSTANCE,
    exported: "2026-10-09T16:30:00.000Z",
    locked: false,
    settings: { products: ["https://github.com/alice/missing"], "unknown-after-products": { secret: "constructed" } },
    foreign: {},
  });
  await assert.rejects(importSettings(destination, validButUnknown),
    (error) => error instanceof StoreError && error.name === "NotAnExport");
  assert.deepEqual(destinationStorage.snapshot(), beforeMalformed,
    "an unknown key rejects before the preceding missing products setting is written");
});
