// MOD-browser-store — instance clearing and the values that must not enter a repository.

import test from "node:test";
import assert from "node:assert/strict";
import { clearEverything, openStore, secretValues, writeSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const OTHER_INSTANCE = "other/example";
const prefix = (instance) => `agent-m:${instance}:`;

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

function install(storage) {
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
}

// TST-290103
// level: unit
// module: MOD-browser-store
// guards: A CLEAR IS A REAL CLEAR; CONFIGURATION LIVES IN THE BROWSER
// given: one browser localStorage has canonical and unknown entries under this instance's prefix, a second instance's entry, and an unrelated browser entry.
// input: clearEverything(openStore(instance)).
// expect: every entry under this instance's prefix is removed from localStorage itself while the other instance and unrelated entries remain byte-for-byte present.
test("TST-290103 clearEverything removes every entry of one instance without clearing other browser state", () => {
  const storage = memoryStorage({
    [`${prefix(INSTANCE)}github-token`]: '{"value":"instance-token"}',
    [`${prefix(INSTANCE)}unrecognised-old-entry`]: "raw-old-byte",
    [`${prefix(OTHER_INSTANCE)}github-token`]: "other-instance-byte",
    "unrelated-browser-key": "unrelated-byte",
  });
  install(storage);

  clearEverything(openStore(INSTANCE));

  assert.equal(storage.getItem(`${prefix(INSTANCE)}github-token`), null);
  assert.equal(storage.getItem(`${prefix(INSTANCE)}unrecognised-old-entry`), null);
  assert.equal(storage.getItem(`${prefix(OTHER_INSTANCE)}github-token`), "other-instance-byte");
  assert.equal(storage.getItem("unrelated-browser-key"), "unrelated-byte");
});

// TST-290104
// level: unit
// module: MOD-browser-store
// guards: NO SECRET IN THE REPOSITORY; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: one instance store has every implemented credential family and records that are configuration, notices and test metadata rather than credentials.
// input: secretValues(store).
// expect: it returns exactly the instance and product token values, endpoint key, Bridge and remote-session tokens, and jump-host login value, without addresses, names, products, notices or last-test metadata.
test("TST-290104 secretValues returns only implemented credential strings", () => {
  install(memoryStorage());
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", { value: "instance-token", name: "Agent M", expires: "2027-01-01", stored: "2026-10-10" });
  writeSetting(store, "github-token:alice/product", { value: "github-product-token" });
  writeSetting(store, "gitlab-token:gitlab.example.test/group/project", { value: "gitlab-product-token" });
  writeSetting(store, "endpoint:campus", { url: "https://models.example.test/v1", kind: "openai", model: "small", key: "endpoint-key", throughBridge: false });
  writeSetting(store, "bridge", { address: "http://127.0.0.1:4711", token: "bridge-token" });
  writeSetting(store, "jump-host", { hostname: "jump.example.test", user: "agentm", sshPort: 22, portRange: [40100, 40101], httpsAddress: "https://jump.example.test", login: "jump-login" });
  writeSetting(store, "remote-session:lab", { port: 40100, token: "remote-token" });
  writeSetting(store, "products", ["https://github.com/alice/product"]);
  writeSetting(store, "notifications", { checked: "2026-10-10T01:00:00.000Z" });
  writeSetting(store, "last-test:endpoint:campus", { at: "2026-10-10T01:00:00.000Z", outcome: "works" });

  assert.deepEqual(secretValues(store).sort(), [
    "bridge-token", "endpoint-key", "github-product-token", "gitlab-product-token", "instance-token", "jump-login", "remote-token",
  ].sort());
});
