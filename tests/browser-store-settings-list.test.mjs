// MOD-browser-store's public settings list (ITM-272).
//
// Module: MOD-browser-store
// Guards: UC-003; EVERY SETTING IS REACHED FROM ONE PAGE; A STORED SECRET IS HIDDEN UNTIL SHOWN
// Level: unit
//
// Run: node --test tests/browser-store-settings-list.test.mjs
//
// These unit tests use a Map-backed localStorage only.  They make no endpoint request and call no paid service.

import test from "node:test";
import assert from "node:assert/strict";
import { clearSetting, listSettings, openStore, writeSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";

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
}

function byKey(settings) {
  return new Map(settings.map((setting) => [setting.key, setting]));
}

function assertSettingInfo(setting, key) {
  assert.deepEqual(Object.keys(setting).sort(), ["expires", "grants", "key", "label", "lastTest", "secret", "setUpIn"], `${key} has exactly the accepted SettingInfo fields`);
  assert.equal(setting.key, key);
  assert.equal(typeof setting.label, "string", `${key} has a display label`);
  assert.ok(setting.label.length > 0, `${key} has a nonempty display label`);
  assert.equal(typeof setting.grants, "string", `${key} says what it grants`);
  assert.ok(setting.grants.length > 0, `${key} has a nonempty grant description`);
  assert.equal(typeof setting.setUpIn, "string", `${key} names where it is set up`);
  assert.ok(setting.setUpIn.length > 0, `${key} has a nonempty setup location`);
}

// TST-272 · level: unit · module: MOD-browser-store
// guards: EVERY SETTING IS REACHED FROM ONE PAGE; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: an instance store with its implemented literal settings, an expiring instance token, and its last test
// input: listSettings(store)
// expect: each implemented literal setting, including unset ones, has SettingInfo fields; expiry and last test return, but the stored value does not
test("TST-272 listSettings lists implemented literal settings without exposing their stored values", () => {
  install(memoryStorage());
  const store = openStore(INSTANCE);
  const secret = "github-secret-that-must-not-be-listed";
  writeSetting(store, "github-token", { value: secret, name: "Agent M", expires: "2027-01-03", stored: "2026-10-07" });
  writeSetting(store, "last-test:github-token", { at: "2026-10-07T10:00:00.000Z", outcome: "working" });

  const settings = byKey(listSettings(store));
  for (const key of ["github-token", "products", "notifications", "notified", "bridge"]) {
    assert.ok(settings.has(key), `${key} is listed even when unset`);
    assertSettingInfo(settings.get(key), key);
  }
  assert.equal(settings.get("github-token").secret, true);
  assert.equal(settings.get("products").secret, false);
  assert.equal(settings.get("github-token").expires, "2027-01-03");
  assert.deepEqual(settings.get("github-token").lastTest, { at: "2026-10-07T10:00:00.000Z", outcome: "working" });
  assert.equal(settings.get("products").expires, null);
  assert.equal(settings.get("products").lastTest, null);
  assert.equal(JSON.stringify([...settings.values()]).includes(secret), false, "the token value is not returned in list metadata");
});

// TST-273 · level: unit · module: MOD-browser-store
// guards: UC-003; EVERY SETTING IS REACHED FROM ONE PAGE; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: a reopened instance store with two endpoint names, an endpoint key, and stored implemented dynamic settings
// input: listSettings(store), then clearSetting(store, one endpoint) and listSettings(store) again
// expect: each dynamic setting is discoverable by key; endpoint metadata names endpoints and its last test but not its key, and clearing removes it
test("TST-273 listSettings discovers dynamic settings and removes a cleared endpoint from discovery", () => {
  install(memoryStorage());
  const first = openStore(INSTANCE);
  const firstKey = "endpoint:campus";
  const secondKey = "endpoint:local";
  const endpointSecret = "endpoint-secret-that-must-not-be-listed";
  writeSetting(first, firstKey, { url: "https://models.example.test/v1", kind: "openai-compatible", model: "campus-1", key: endpointSecret, throughBridge: false });
  writeSetting(first, secondKey, { url: "https://models.example.test/messages", kind: "anthropic", model: "claude-campus", throughBridge: false });
  writeSetting(first, `last-test:${firstKey}`, { at: "2026-10-07T11:00:00.000Z", outcome: "refused" });
  writeSetting(first, "github-token:alice/thesis-tool", { value: "product-token-that-must-not-be-listed", name: "thesis-tool", expires: "2027-02-01", stored: "2026-10-07" });
  writeSetting(first, "gitlab-token:gitlab.example.test/group/project", { value: "gitlab-token-that-must-not-be-listed", name: "project", expires: "2027-02-02", stored: "2026-10-07" });

  const settings = byKey(listSettings(openStore(INSTANCE)));
  for (const key of [firstKey, secondKey, "github-token:alice/thesis-tool", "gitlab-token:gitlab.example.test/group/project"]) {
    assert.ok(settings.has(key), `${key} is discovered without the caller providing its name`);
    assertSettingInfo(settings.get(key), key);
  }
  assert.equal(settings.get(firstKey).secret, true);
  assert.equal(settings.get(firstKey).setUpIn, "endpoints");
  assert.deepEqual(settings.get(firstKey).lastTest, { at: "2026-10-07T11:00:00.000Z", outcome: "refused" });
  assert.equal(settings.get(secondKey).lastTest, null);
  assert.equal(JSON.stringify([...settings.values()]).includes(endpointSecret), false, "an endpoint credential is not returned in list metadata");

  clearSetting(first, firstKey);
  assert.equal(byKey(listSettings(openStore(INSTANCE))).has(firstKey), false, "a cleared endpoint no longer appears in discovery");
});

// TST-274 · level: unit · module: MOD-browser-store
// guards: UC-003; CONFIGURATION LIVES IN THE BROWSER; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
// given: two browser instances, an unknown first-instance entry, and a network function that throws if called
// input: listSettings(firstInstanceStore)
// expect: unknown and second-instance entries are excluded; localStorage is unchanged, no cookie is written, and no network request runs
test("TST-274 listSettings isolates an instance and only reads its known storage entries", () => {
  const storage = memoryStorage({ [`agent-m:${INSTANCE}:unknown`]: JSON.stringify({ value: "not a setting" }) });
  install(storage);
  const cookies = { value: "" };
  Object.defineProperty(globalThis, "document", {
    value: { get cookie() { return cookies.value; }, set cookie(value) { cookies.value += String(value); } },
    configurable: true,
    writable: true,
  });
  let requestCount = 0;
  Object.defineProperty(globalThis, "fetch", {
    value: () => { requestCount += 1; throw new Error("listSettings must not make a network request"); },
    configurable: true,
    writable: true,
  });
  const first = openStore(INSTANCE);
  const second = openStore("other/instance");
  writeSetting(first, "endpoint:first", { url: "https://first.example.test/v1", kind: "openai-compatible", model: "one", throughBridge: false });
  writeSetting(second, "endpoint:second", { url: "https://second.example.test/v1", kind: "openai-compatible", model: "two", throughBridge: false });
  const before = storage.snapshot();

  const settings = byKey(listSettings(first));

  assert.ok(settings.has("endpoint:first"));
  assert.equal(settings.has("endpoint:second"), false, "another instance's endpoint is not listed");
  assert.equal(settings.has("unknown"), false, "an unknown storage entry is not listed");
  assert.deepEqual(storage.snapshot(), before, "listing changes no localStorage entry");
  assert.equal(cookies.value, "", "listing writes no cookie");
  assert.equal(requestCount, 0, "listing makes no network request");
});
