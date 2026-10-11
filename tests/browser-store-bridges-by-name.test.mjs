// Each Bridge kept under its name in the browser (ITM-403) — MOD-browser-store's family `bridge:<name>`, as docs/architecture/MOD-browser-store.md
// states it in Data: `{ address, token }` for a Bridge reached directly, `{ port, token }` for one reached through the jump host, each listed,
// cleared and exported with its token as a secret; an endpoint's entry names the Bridge that calls it in `bridge`.
// Run: node --test tests/browser-store-bridges-by-name.test.mjs
//
// Module: MOD-browser-store
// Guards: UC-003; UC-011; UC-042
// Guards: CONFIGURATION LIVES IN THE BROWSER; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// Guards: A CLEAR IS A REAL CLEAR
// Level: unit
//
// The tests use constructed credentials and a Map-backed localStorage fixture only; nothing reaches the network. The expected values are the
// fixture's own. Where the module file leaves a reading open, the test states the reading it takes, and the pull request names it:
//   - The family `bridge:<name>` is added beside the single `bridge` and the family `remote-session:<name>`, which stay accepted: the pages of
//     MOD-settings-pages and their tests still write them, and this item changes only src/browser-store/. A name is any non-empty text.
//   - The store keeps the value as it is given, as it does for every family; it checks no field of it.
//   - In the list a Bridge is a stored instance of its family, as an endpoint is: only the Bridges that are stored are listed, each with
//     `secret: true` and `setUpIn: "bridge"`, and the list never holds a token.
// A name the module does not provide yet fails each test by itself. The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import {
  clearEverything,
  clearSetting,
  exportSettings,
  importSettings,
  listSettings,
  openStore,
  readExport,
  readSetting,
  secretValues,
  writeSetting,
} from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const PREFIX = `agent-m:${INSTANCE}:`;

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    get length() { return values.size; },
    key: (index) => [...values.keys()][index] ?? null,
    keys: () => [...values.keys()].sort(),
  };
}
function install(storage) {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true, writable: true });
}
const fresh = (instance = INSTANCE) => { const storage = memoryStorage(); install(storage); return { storage, store: openStore(instance) }; };

// Two Bridges of each form: two reached directly, on this computer and at an SSH forward; two reached through the jump host.
const BRIDGES = {
  "bridge:laptop": { address: "http://127.0.0.1:8111", token: "laptop-token-constructed-001" },
  "bridge:lab-forward": { address: "http://127.0.0.1:9222", token: "forward-token-constructed-002" },
  "bridge:cluster-a": { port: 42001, token: "cluster-a-token-constructed-003" },
  "bridge:cluster-b": { port: 42002, token: "cluster-b-token-constructed-004" },
};
const TOKENS = Object.values(BRIDGES).map((bridge) => bridge.token);
const populate = (store) => { for (const [key, value] of Object.entries(BRIDGES)) writeSetting(store, key, value); };

// guards: CONFIGURATION LIVES IN THE BROWSER; UC-011
// given: a store; two Bridges reached directly and two through the jump host, each under its name
// input: writeSetting and readSetting for each; and the key `bridge:` with no name
// expect: each value read back exactly as written, under the key `bridge:<name>` in localStorage under the instance's prefix; no name is UnknownSetting
test("bridge:<name> — two Bridges of each form are kept under their names and read back as written", () => {
  const { storage, store } = fresh();
  populate(store);
  for (const [key, value] of Object.entries(BRIDGES)) {
    assert.deepEqual(readSetting(store, key), value);
    assert.equal(storage.getItem(PREFIX + key), JSON.stringify(value));
  }
  assert.throws(() => writeSetting(store, "bridge:", BRIDGES["bridge:laptop"]), (error) => error.name === "UnknownSetting" && error.key === "bridge:");
  assert.equal(readSetting(store, "bridge:unknown"), null);
});

// guards: THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS; UC-011
// given: the four Bridges stored, and none stored in a second store of the same browser
// input: listSettings of each
// expect: the four keys listed, in order, each a secret set up in `bridge`, its label naming the Bridge; no token anywhere in the list; the second store lists none
test("bridge:<name> — each stored Bridge is listed as a secret, without its token", () => {
  const { store } = fresh();
  assert.deepEqual(listSettings(store).filter((info) => info.key.startsWith("bridge:")), [], "none stored, none listed");
  populate(store);
  const listed = listSettings(store).filter((info) => info.key.startsWith("bridge:"));
  assert.deepEqual(listed.map((info) => info.key), ["bridge:cluster-a", "bridge:cluster-b", "bridge:laptop", "bridge:lab-forward"].sort());
  for (const info of listed) {
    assert.equal(info.secret, true);
    assert.equal(info.setUpIn, "bridge");
    assert.ok(info.label.includes(info.key.slice("bridge:".length)), `the label names the Bridge: ${info.label}`);
  }
  const text = JSON.stringify(listSettings(store));
  for (const token of TOKENS) assert.ok(!text.includes(token), "a token is never listed");
  install(memoryStorage());
  assert.deepEqual(listSettings(openStore("other/instance")).filter((info) => info.key.startsWith("bridge:")), []);
});

// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; UC-042
// given: the four Bridges stored
// input: secretValues
// expect: exactly the four tokens, and no address or port
test("bridge:<name> — the token of each Bridge is a secret value, its address and port are not", () => {
  const { store } = fresh();
  assert.deepEqual(secretValues(store), [], "known positive: nothing stored, no secret");
  populate(store);
  assert.deepEqual([...secretValues(store)].sort(), [...TOKENS].sort());
});

// guards: SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; UC-042
// given: the four Bridges stored in one browser, and in another browser one of them already stored with another token
// input: exportSettings plain and locked, readExport of each, importSettings into the other store
// expect: both exports hold the four Bridges with their tokens; the import adds the three it lacks and keeps the one it has, with its own token
test("bridge:<name> — Bridges are exported with their tokens and imported, an existing one kept", async () => {
  const { store } = fresh();
  populate(store);
  const plain = await exportSettings(store);
  const locked = await exportSettings(store, "a passphrase");
  for (const token of TOKENS) assert.ok(plain.includes(token), "the plain export holds the token");
  assert.ok(!locked.includes(TOKENS[0]), "the locked export hides it");
  for (const read of [await readExport(plain), await readExport(locked, "a passphrase")]) {
    for (const [key, value] of Object.entries(BRIDGES)) assert.deepEqual(read.settings[key], value);
  }

  const other = fresh();
  writeSetting(other.store, "bridge:laptop", { address: "http://127.0.0.1:1", token: "own-token" });
  const result = await importSettings(other.store, plain);
  assert.deepEqual([...result.added].sort(), ["bridge:cluster-a", "bridge:cluster-b", "bridge:lab-forward"]);
  assert.deepEqual(result.kept, ["bridge:laptop"]);
  assert.deepEqual(readSetting(other.store, "bridge:laptop"), { address: "http://127.0.0.1:1", token: "own-token" });
  assert.deepEqual(readSetting(other.store, "bridge:cluster-a"), BRIDGES["bridge:cluster-a"]);
});

// guards: A CLEAR IS A REAL CLEAR; UC-011
// given: the four Bridges stored
// input: clearSetting of one; then clearEverything
// expect: the one's raw entry gone from localStorage and from the list, the other three untouched; then no `bridge:` entry of the instance left
test("bridge:<name> — one Bridge is cleared with its entry removed, and clearing everything removes the rest", () => {
  const { storage, store } = fresh();
  populate(store);
  clearSetting(store, "bridge:cluster-a");
  assert.equal(storage.getItem(`${PREFIX}bridge:cluster-a`), null);
  assert.equal(readSetting(store, "bridge:cluster-a"), null);
  assert.ok(!listSettings(store).some((info) => info.key === "bridge:cluster-a"));
  assert.deepEqual(readSetting(store, "bridge:cluster-b"), BRIDGES["bridge:cluster-b"]);
  assert.equal(storage.keys().filter((key) => key.startsWith(`${PREFIX}bridge:`)).length, 3);
  clearEverything(store);
  assert.deepEqual(storage.keys(), []);
});

// guards: UC-003; UC-042; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
// given: the four Bridges, and an endpoint whose entry names the Bridge that calls it, `bridge: "cluster-a"`, with a key
// input: write, read, list, secretValues, export and import of the endpoint
// expect: the entry read back with `bridge` as written; its key a secret and the Bridge's name not; the name survives export and import; the name
//         is one of the Bridges stored
test("endpoint:<name> — an endpoint names the Bridge that calls it", async () => {
  const { store } = fresh();
  populate(store);
  const endpoint = { url: "http://127.0.0.1:11434", kind: "ollama", model: "llama3", key: "endpoint-key-constructed-005", bridge: "cluster-a" };
  writeSetting(store, "endpoint:hpc", endpoint);
  assert.deepEqual(readSetting(store, "endpoint:hpc"), endpoint);
  assert.ok(readSetting(store, `bridge:${endpoint.bridge}`), "the name is one of the Bridges stored");
  assert.ok(secretValues(store).includes("endpoint-key-constructed-005"));
  assert.ok(!secretValues(store).includes("cluster-a"));
  const text = await exportSettings(store);
  const other = fresh();
  await importSettings(other.store, text);
  assert.deepEqual(readSetting(other.store, "endpoint:hpc"), endpoint);
  assert.deepEqual(readSetting(other.store, "bridge:cluster-a"), BRIDGES["bridge:cluster-a"]);
});
