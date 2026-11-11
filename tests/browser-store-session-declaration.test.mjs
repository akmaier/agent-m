// MOD-browser-store keeps a coding agent on CI under `ci-agent:<name>` — { agent, runner, secret, place, capabilities, models } (docs/architecture/MOD-browser-store.md, Data) —
// and an endpoint's place, context and CI secret (ITM-1185). A CLI session's declaration is kept by its Bridge, not by this browser (MOD-bridge-http, GET and PUT /v1/agents):
// the key `session:<bridge>:<agent>` is no key of the catalogue and is refused.
//
// Module: MOD-browser-store
// Guards: UC-049; UC-010; UC-044; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE; CONFIGURATION LIVES IN THE BROWSER
// Level: unit
//
// Run: node --test tests/browser-store-session-declaration.test.mjs
//
// The tests use constructed values and a Map-backed localStorage only. They make no network request.

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
  secretValues,
  writeSetting,
} from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const PREFIX = `agent-m:${INSTANCE}:`;
const CI_AGENT = "ci-agent:hosted-claude";
const CI_AGENT_VALUE = { agent: "claude", runner: "hosted", secret: "ANTHROPIC_API_KEY", place: "Anthropic, USA",
  capabilities: ["read the repository", "draft text", "write to the repository", "run code and tests"], models: [{ model: "claude-opus-5", context: 200000 }] };
const ENDPOINT = "endpoint:hub";
const ENDPOINT_VALUE = { url: "https://models.example.test/v1", kind: "openai", model: "hub-1", key: "endpoint-key-constructed-001", bridge: "lab", place: "Anthropic, USA", context: 128000, secret: "HUB_API_KEY" };

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

// TST-1185001 · level: unit · module: MOD-browser-store
// guards: UC-049; UC-044; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE; CONFIGURATION LIVES IN THE BROWSER
// given: an instance store and a coding agent on CI { agent, runner, secret, place, capabilities, models } named hosted-claude
// input: writeSetting(store, "ci-agent:hosted-claude", value), then readSetting on a reopened store
// expect: the write is accepted and the value is read back whole, with no field added or dropped, under the key prefix of the instance
test("TST-1185001: a coding agent on CI is kept under ci-agent:<name> and read back whole", () => {
  const storage = memoryStorage();
  install(storage);

  writeSetting(openStore(INSTANCE), CI_AGENT, CI_AGENT_VALUE);

  assert.deepEqual(readSetting(openStore(INSTANCE), CI_AGENT), CI_AGENT_VALUE);
  assert.notEqual(storage.getItem(PREFIX + CI_AGENT), null, "the declaration stands under the instance's prefix in localStorage");
});

// TST-1185002 · level: unit · module: MOD-browser-store
// guards: UC-049; UC-044; EVERY SETTING IS REACHED FROM ONE PAGE; A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; A CLEAR IS A REAL CLEAR
// given: a stored coding agent on CI and a Bridge token
// input: listSettings, secretValues, then clearSetting on the coding agent
// expect: it is listed with the seven SettingInfo fields, labelled "Coding agent on CI: hosted-claude", secret false, setUpIn "endpoints" and a nonempty grants; secretValues holds none of its fields — its secret is a
//   CI secret's name, not a value —; clear removes its raw entry
test("TST-1185002: a coding agent on CI is listed as a setting that is not secret, set up beside the endpoints, and clears for real", () => {
  const storage = memoryStorage();
  install(storage);
  const store = openStore(INSTANCE);
  writeSetting(store, CI_AGENT, CI_AGENT_VALUE);
  writeSetting(store, "bridge:lab", { address: "http://127.0.0.1:8111", token: "bridge-token-constructed-002" });

  const info = listSettings(store).find((setting) => setting.key === CI_AGENT);
  assert.ok(info, "the coding agent is listed");
  assert.deepEqual(Object.keys(info).sort(), ["expires", "grants", "key", "label", "lastTest", "secret", "setUpIn"]);
  assert.equal(info.secret, false);
  assert.equal(info.setUpIn, "endpoints");
  assert.equal(typeof info.grants, "string");
  assert.ok(info.grants.length > 0, "it says what it grants");
  assert.equal(info.label, "Coding agent on CI: hosted-claude");
  assert.equal(info.expires, null);
  assert.equal(info.lastTest, null);

  const secrets = secretValues(store);
  assert.deepEqual(secrets, ["bridge-token-constructed-002"], "only the Bridge's token is a secret value");

  clearSetting(store, CI_AGENT);
  assert.equal(storage.getItem(PREFIX + CI_AGENT), null, "Clear removes the raw entry");
  assert.equal(listSettings(store).some((setting) => setting.key === CI_AGENT), false);
});

// TST-1185003 · level: unit · module: MOD-browser-store
// guards: UC-049; UC-044; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE
// given: one browser holding a coding agent on CI and an endpoint, and an empty browser of the same instance
// input: exportSettings (plain and locked), readExport, then importSettings into the empty browser
// expect: both exports carry the coding agent whole; readExport returns it; the import adds its key and the empty browser reads it back whole
test("TST-1185003: the export and the import carry a coding agent on CI like every other non-secret setting", async () => {
  install(memoryStorage());
  const source = openStore(INSTANCE);
  writeSetting(source, CI_AGENT, CI_AGENT_VALUE);
  writeSetting(source, ENDPOINT, ENDPOINT_VALUE);

  const plain = await exportSettings(source);
  assert.deepEqual(JSON.parse(plain).settings[CI_AGENT], CI_AGENT_VALUE);
  const locked = await exportSettings(source, "constructed passphrase");
  assert.equal(locked.includes("claude-opus-5"), false, "the locked file shows no field of the coding agent");
  assert.deepEqual((await readExport(locked, "constructed passphrase")).settings[CI_AGENT], CI_AGENT_VALUE);
  assert.deepEqual((await readExport(plain)).settings[CI_AGENT], CI_AGENT_VALUE);

  install(memoryStorage());
  const destination = openStore(INSTANCE);
  const result = await importSettings(destination, plain);
  assert.deepEqual(result.added.sort(), [ENDPOINT, CI_AGENT].sort());
  assert.deepEqual(result.kept, []);
  assert.deepEqual(readSetting(destination, CI_AGENT), CI_AGENT_VALUE);
});

// TST-1185004 · level: unit · module: MOD-browser-store
// guards: UC-049; UC-003; CONFIGURATION LIVES IN THE BROWSER; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: an endpoint { url, kind, model, key, bridge, place, context, secret } where secret is the name of a CI secret
// input: writeSetting, readSetting on a reopened store, listSettings and secretValues
// expect: the endpoint is read back whole; it is listed as secret; secretValues holds its key and neither its secret name, its place nor its context
test("TST-1185004: an endpoint keeps its place, context and CI secret name whole, and only its key counts as secret", () => {
  install(memoryStorage());
  writeSetting(openStore(INSTANCE), ENDPOINT, ENDPOINT_VALUE);
  const store = openStore(INSTANCE);

  assert.deepEqual(readSetting(store, ENDPOINT), ENDPOINT_VALUE);
  assert.equal(listSettings(store).find((setting) => setting.key === ENDPOINT).secret, true);
  assert.deepEqual(secretValues(store), [ENDPOINT_VALUE.key]);
});

// TST-1185005 · level: unit · module: MOD-browser-store
// guards: UC-049; UC-044; CONFIGURATION LIVES IN THE BROWSER; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE
// given: a store holding the products setting, and keys that are no family of the catalogue: session:lab:claude (a CLI session's declaration, which its Bridge keeps), session, sessions:lab:claude, session-lab:claude, agent-session:lab:claude, ci-agent
// input: writeSetting with each such key
// expect: each throws UnknownSetting naming the key and writes no byte
test("TST-1185005: a key outside the catalogue is refused, a CLI session's key and session-like ones included", () => {
  const storage = memoryStorage();
  install(storage);
  const store = openStore(INSTANCE);
  writeSetting(store, "products", []);
  const before = storage.snapshot();

  for (const key of ["session:lab:claude", "session", "sessions:lab:claude", "session-lab:claude", "agent-session:lab:claude", "ci-agent"]) {
    assert.throws(() => writeSetting(store, key, CI_AGENT_VALUE),
      (error) => error instanceof StoreError && error.name === "UnknownSetting" && error.key === key, key);
  }
  assert.deepEqual(storage.snapshot(), before, "a refused key writes nothing");
});
