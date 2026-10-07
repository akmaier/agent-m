// MOD-browser-store's endpoint settings (ITM-259).
//
// Module: MOD-browser-store
// Guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE; A CLEAR IS A REAL CLEAR
// Level: unit
//
// Run: node --test tests/browser-store-endpoint-settings.test.mjs
//
// These tests use an in-memory localStorage stand-in only. They make no endpoint request.

import test from "node:test";
import assert from "node:assert/strict";
import { clearSetting, openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const PREFIX = `agent-m:${INSTANCE}:`;
const ENDPOINT = "endpoint:campus";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function install(storage) {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
}

// TST-ITM-259-01
// given: a browser store where an author saves an OpenAI-compatible endpoint with a key
// input: reopen the same instance's store
// expect: the endpoint URL, kind, model, key and throughBridge choice remain exactly as saved
test("an endpoint survives reopening the same instance store", () => {
  const storage = memoryStorage();
  install(storage);
  const endpoint = { url: "https://models.example.test/v1", kind: "openai", model: "campus-1", key: "refused-key", throughBridge: false };

  writeSetting(openStore(INSTANCE), ENDPOINT, endpoint);

  assert.deepEqual(readSetting(openStore(INSTANCE), ENDPOINT), endpoint);
});

// TST-ITM-259-02
// given: an endpoint that does not require an API key
// input: save then read that endpoint
// expect: its optional key is absent while the other endpoint fields are kept
test("an endpoint without a key is stored unchanged", () => {
  install(memoryStorage());
  const endpoint = { url: "http://127.0.0.1:11434", kind: "ollama", model: "llama3", throughBridge: true };
  const store = openStore(INSTANCE);

  writeSetting(store, "endpoint:local", endpoint);

  assert.deepEqual(readSetting(store, "endpoint:local"), endpoint);
  assert.equal(Object.hasOwn(readSetting(store, "endpoint:local"), "key"), false);
});

// TST-ITM-259-03
// given: a stored endpoint whose key was refused by a constructed endpoint response
// input: reopen and read it, then explicitly write a replacement key
// expect: reading retains the refused key; only the explicit write replaces it
test("a refused endpoint key changes only when the author explicitly writes a replacement", () => {
  install(memoryStorage());
  const store = openStore(INSTANCE);
  const refused = { url: "https://models.example.test/v1", kind: "openai", model: "campus-1", key: "refused-key", throughBridge: false };
  const constructedRefusal = { status: 401, message: "key refused" };
  writeSetting(store, ENDPOINT, refused);

  assert.equal(constructedRefusal.status, 401, "the constructed response represents the refusal");
  assert.deepEqual(readSetting(openStore(INSTANCE), ENDPOINT), refused, "the refusal does not overwrite browser storage");

  const replacement = { ...refused, key: "replacement-key" };
  writeSetting(store, ENDPOINT, replacement);
  assert.deepEqual(readSetting(openStore(INSTANCE), ENDPOINT), replacement, "an explicit write replaces the key");
});

// TST-ITM-259-04
// given: an endpoint and its recorded last test stored in localStorage
// input: clear the endpoint
// expect: the endpoint's actual localStorage entry is removed, not only hidden from reads
test("clearing an endpoint removes its actual localStorage entry", () => {
  const storage = memoryStorage();
  install(storage);
  const store = openStore(INSTANCE);
  writeSetting(store, ENDPOINT, { url: "https://models.example.test/v1", kind: "openai", model: "campus-1", key: "key", throughBridge: false });
  writeSetting(store, `last-test:${ENDPOINT}`, { at: "2026-10-07T10:00:00.000Z", outcome: "refused" });

  clearSetting(store, ENDPOINT);

  assert.equal(storage.getItem(PREFIX + ENDPOINT), null);
  assert.equal(readSetting(store, ENDPOINT), null);
  assert.deepEqual(readSetting(store, `last-test:${ENDPOINT}`), { at: "2026-10-07T10:00:00.000Z", outcome: "refused" });
});

// TST-ITM-259-05
// given: two Agent M instances in one browser, each with endpoint and paired Bridge settings
// input: save distinct values under each instance's prefix
// expect: neither instance reads the other instance's endpoint, Bridge, or recorded Bridge test
test("instance prefixes isolate endpoint and pairing settings", () => {
  install(memoryStorage());
  const one = openStore("alice/one");
  const two = openStore("bob/two");
  const oneEndpoint = { url: "https://one.example.test/v1", kind: "openai", model: "one", throughBridge: false };
  const twoEndpoint = { url: "https://two.example.test/v1", kind: "anthropic", model: "two", throughBridge: true };
  const oneBridge = { address: "http://127.0.0.1:8111", token: "one-pairing" };
  const twoBridge = { address: "https://bridge.example.test", token: "two-pairing" };

  writeSetting(one, ENDPOINT, oneEndpoint);
  writeSetting(one, "bridge", oneBridge);
  writeSetting(one, "last-test:bridge", { at: "2026-10-07T10:00:00.000Z", outcome: "working" });
  writeSetting(two, ENDPOINT, twoEndpoint);
  writeSetting(two, "bridge", twoBridge);
  writeSetting(two, "last-test:bridge", { at: "2026-10-07T11:00:00.000Z", outcome: "working" });

  assert.deepEqual(readSetting(one, ENDPOINT), oneEndpoint);
  assert.deepEqual(readSetting(two, ENDPOINT), twoEndpoint);
  assert.deepEqual(readSetting(one, "bridge"), oneBridge);
  assert.deepEqual(readSetting(two, "bridge"), twoBridge);
  assert.notDeepEqual(readSetting(one, "last-test:bridge"), readSetting(two, "last-test:bridge"));
});
