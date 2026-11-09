// MOD-browser-store writes a coding agent on CI's key only with its name: `ci-agent:<name>`, the name non-empty (docs/architecture/MOD-browser-store.md, Data) (ITM-1313).
// A CLI session's key `session:<bridge>:<agent>` is no key of the catalogue: the Bridge keeps its agents' declarations (MOD-bridge-http, GET and PUT /v1/agents).
//
// Module: MOD-browser-store
// Guards: UC-049; UC-010; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE; CONFIGURATION LIVES IN THE BROWSER
// Level: unit
//
// Run: node --test tests/browser-store-session-key-names.test.mjs
//
// The tests use constructed values and a Map-backed localStorage only. They make no network request.

import test from "node:test";
import assert from "node:assert/strict";
import { StoreError, listSettings, openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const PREFIX = `agent-m:${INSTANCE}:`;
const CI_AGENT = "ci-agent:hosted-claude";
const CI_AGENT_VALUE = { agent: "claude", runner: "hosted", secret: "ANTHROPIC_API_KEY", place: "Anthropic, USA", capabilities: ["read the repository"],
  models: [{ model: "claude-opus-5", context: 200000 }] };

function memoryStorage() {
  const values = new Map();
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
}

// TST-1313001 · level: unit · module: MOD-browser-store
// guards: UC-049; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE; CONFIGURATION LIVES IN THE BROWSER
// given: an instance store that holds the setting products and the coding agent on CI hosted-claude
// input: writeSetting(store, key, value) for ci-agent (no name), ci-agent: (an empty name), and the CLI session keys session:lab:claude, session:lab and session::claude
// expect: each throws a StoreError named UnknownSetting whose key is the key written, and localStorage is, entry for entry, what it was before
test("TST-1313001: a coding agent's key lacking its name, and every CLI session key, is refused and writes nothing", () => {
  const storage = memoryStorage();
  install(storage);
  const store = openStore(INSTANCE);
  writeSetting(store, "products", []);
  writeSetting(store, CI_AGENT, CI_AGENT_VALUE);
  const before = JSON.stringify(storage.snapshot());

  for (const key of ["ci-agent", "ci-agent:", "session:lab:claude", "session:lab", "session::claude"]) {
    assert.throws(
      () => writeSetting(store, key, CI_AGENT_VALUE),
      (error) => error instanceof StoreError && error.name === "UnknownSetting" && error.key === key,
      JSON.stringify(key),
    );
  }

  assert.equal(JSON.stringify(storage.snapshot()), before, "a refused key writes nothing");
});

// TST-1313002 · level: unit · module: MOD-browser-store
// guards: UC-049; UC-010; CONFIGURATION LIVES IN THE BROWSER
// given: an empty instance store (counter-proof of TST-1313001: the refusal does not take the key with its name)
// input: writeSetting(store, "ci-agent:hosted-claude", value), then readSetting and listSettings on a store opened again
// expect: the write is accepted and stands in localStorage under the instance's prefix; the value is read back whole; the setting is listed as "Coding agent on CI: hosted-claude", not secret, set up in "endpoints"
test("TST-1313002: a coding agent's key with its name is kept, read back whole and listed", () => {
  const storage = memoryStorage();
  install(storage);

  writeSetting(openStore(INSTANCE), CI_AGENT, CI_AGENT_VALUE);

  const reopened = openStore(INSTANCE);
  assert.deepEqual(JSON.parse(storage.getItem(PREFIX + CI_AGENT)), CI_AGENT_VALUE);
  assert.deepEqual(readSetting(reopened, CI_AGENT), CI_AGENT_VALUE);
  const info = listSettings(reopened).find((setting) => setting.key === CI_AGENT);
  assert.ok(info, "the coding agent is listed");
  assert.equal(info.label, "Coding agent on CI: hosted-claude");
  assert.equal(info.secret, false);
  assert.equal(info.setUpIn, "endpoints");
});
