// MOD-browser-store — expiringSoon: the stored tokens whose recorded expiry is within fourteen days of a given moment, or past.
//
// Module: MOD-browser-store
// Guards: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
// Level: unit
//
// Run: node --test tests/browser-store-expiring-soon.test.mjs
//
// Each test states its input and its expected result in its own text (given / input / expect); no expected result is read
// from a document. localStorage is a Map-backed stand-in installed on globalThis, and fetch is a spy that fails the test
// if it is ever called: expiringSoon reads the store and makes no request.

import test from "node:test";
import assert from "node:assert/strict";
import { expiringSoon, openStore, writeSetting } from "../src/browser-store/index.mjs";

const INSTANCE = "akmaier/agent-m";
const NOW = new Date("2026-10-17T12:00:00Z");

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => { values.set(key, String(value)); },
    removeItem: (key) => { values.delete(key); },
    get length() { return values.size; },
    key: (index) => [...values.keys()][index] ?? null,
    snapshot: () => JSON.stringify([...values.entries()].sort()),
  };
}

// Installs a fresh localStorage and a fetch spy; returns the spy's call counter and the storage.
function install() {
  const storage = memoryStorage();
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true, writable: true });
  const calls = { fetch: 0 };
  Object.defineProperty(globalThis, "fetch", {
    value: () => { calls.fetch += 1; throw new Error("expiringSoon must make no request"); },
    configurable: true, writable: true,
  });
  return { storage, calls };
}

const token = (expires, extra = {}) => ({ value: "ghp_secret_value", name: "Agent M", ...(expires === undefined ? {} : { expires }), stored: "2026-10-01", ...extra });
const byKey = (list) => [...list].sort((a, b) => a.key < b.key ? -1 : 1);

// TST-808001 · level: unit · module: MOD-browser-store
// guards: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
// given: the instance's token recorded as expiring on 2026-10-31, and now = 2026-10-17T12:00:00Z (that date is 14 days after now's date)
// input: expiringSoon(store, now)
// expect: exactly [{ key: "github-token", expires: "2026-10-31" }]
test("TST-808001 a token expiring in 14 days is named", () => {
  install();
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", token("2026-10-31"));
  assert.deepEqual(expiringSoon(store, NOW), [{ key: "github-token", expires: "2026-10-31" }]);
});

// TST-808002 · level: unit · module: MOD-browser-store
// guards: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
// given: the instance's token recorded as expiring on 2026-11-01 (15 days after now's date 2026-10-17), same now
// input: expiringSoon(store, now)
// expect: [] — a token 15 days from expiry is not named
test("TST-808002 a token expiring in 15 days is not named", () => {
  install();
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", token("2026-11-01"));
  assert.deepEqual(expiringSoon(store, NOW), []);
});

// TST-808003 · level: unit · module: MOD-browser-store
// guards: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
// given: three tokens recorded as expiring on 2026-10-17 (the day of now), 2026-10-16 (one day past) and 2026-01-01 (long past)
// input: expiringSoon(store, now)
// expect: all three named, each with its recorded expiry text unchanged
test("TST-808003 a token whose expiry is today or already past is named", () => {
  install();
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", token("2026-10-17"));
  writeSetting(store, "github-token:alice/thesis-tool", token("2026-10-16"));
  writeSetting(store, "gitlab-token:gitlab.example.test/group/project", token("2026-01-01"));
  assert.deepEqual(byKey(expiringSoon(store, NOW)), [
    { key: "github-token", expires: "2026-10-17" },
    { key: "github-token:alice/thesis-tool", expires: "2026-10-16" },
    { key: "gitlab-token:gitlab.example.test/group/project", expires: "2026-01-01" },
  ]);
});

// TST-808004 · level: unit · module: MOD-browser-store
// guards: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
// given: four tokens with no recorded expiry — the field absent, null, the empty text, and text that is no date ("never")
// input: expiringSoon(store, now)
// expect: [] — a token with no recorded expiry is never named
test("TST-808004 a token with no recorded expiry is not named", () => {
  install();
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", token(undefined));
  writeSetting(store, "github-token:alice/thesis-tool", token(null));
  writeSetting(store, "gitlab-token:gitlab.example.test/group/project", token(""));
  writeSetting(store, "github-token:bob/other-tool", token("never"));
  assert.deepEqual(expiringSoon(store, NOW), []);
});

// TST-808005 · level: unit · module: MOD-browser-store
// guards: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
// given: the instance token (expires 2026-10-31), a GitHub product token (2026-11-05, 19 days), a second GitHub product token (2026-10-20, 3 days) and a GitLab project token (2026-10-10, past)
// input: expiringSoon(store, now)
// expect: the instance token, the 3-day product token and the GitLab token, each once, and not the 19-day product token
test("TST-808005 the tokens of the instance and of each product are checked, and only those within the days are named", () => {
  install();
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", token("2026-10-31"));
  writeSetting(store, "github-token:alice/far", token("2026-11-05"));
  writeSetting(store, "github-token:alice/near", token("2026-10-20"));
  writeSetting(store, "gitlab-token:gitlab.example.test/group/project", token("2026-10-10"));
  assert.deepEqual(byKey(expiringSoon(store, NOW)), [
    { key: "github-token", expires: "2026-10-31" },
    { key: "github-token:alice/near", expires: "2026-10-20" },
    { key: "gitlab-token:gitlab.example.test/group/project", expires: "2026-10-10" },
  ]);
});

// TST-808006 · level: unit · module: MOD-browser-store
// guards: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
// given: a store holding, besides one expiring token, a setting that is no token but carries an expires field (endpoint:hub, expires 2026-10-01), a recorded last test, and a token of another instance (expires 2026-10-01)
// input: expiringSoon(store, now)
// expect: only the one token of this instance; the endpoint, the last-test entry and the other instance's token are not named
test("TST-808006 only the stored tokens of this instance are named", () => {
  install();
  const store = openStore(INSTANCE);
  const other = openStore("other/instance");
  writeSetting(store, "github-token", token("2026-10-20"));
  writeSetting(store, "endpoint:hub", { url: "https://models.example.test/v1", kind: "openai-compatible", model: "m", expires: "2026-10-01" });
  writeSetting(store, "last-test:github-token", { at: "2026-10-07T10:00:00.000Z", outcome: "working" });
  writeSetting(other, "github-token", token("2026-10-01"));
  assert.deepEqual(expiringSoon(store, NOW), [{ key: "github-token", expires: "2026-10-20" }]);
});

// TST-808007 · level: unit · module: MOD-browser-store
// guards: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
// given: a store with no setting at all
// input: expiringSoon(store, now)
// expect: []
test("TST-808007 an empty store names no token", () => {
  install();
  assert.deepEqual(expiringSoon(openStore(INSTANCE), NOW), []);
});

// TST-808008 · level: unit · module: MOD-browser-store
// guards: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE
// given: one token expiring on 2026-10-31 and another on 2026-11-01, and moments at the first and the last second of 2026-10-17 UTC
// input: expiringSoon(store, 2026-10-17T00:00:00Z) and expiringSoon(store, 2026-10-17T23:59:59Z)
// expect: both calls name exactly the 2026-10-31 token (the time of day does not move the 14-day edge; the days count from the date of now in UTC)
test("TST-808008 the time of day within a UTC day does not move the fourteen-day edge", () => {
  install();
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", token("2026-10-31"));
  writeSetting(store, "github-token:alice/edge", token("2026-11-01"));
  const expected = [{ key: "github-token", expires: "2026-10-31" }];
  assert.deepEqual(expiringSoon(store, new Date("2026-10-17T00:00:00Z")), expected);
  assert.deepEqual(expiringSoon(store, new Date("2026-10-17T23:59:59Z")), expected);
});

// TST-808009 · level: unit · module: MOD-browser-store
// guards: A TOKEN'S EXPIRY IS WARNED OF IN ADVANCE; CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
// given: a store with an expiring token, a fetch spy that fails on any call, a cookie jar, and a snapshot of localStorage
// input: expiringSoon(store, now)
// expect: the result holds only { key, expires } per entry and never the token's value; fetch was called 0 times; localStorage is byte-identical to the snapshot; no cookie was written
test("TST-808009 expiringSoon makes no request, changes nothing and returns no token value", () => {
  const { storage, calls } = install();
  const jar = { value: "" };
  Object.defineProperty(globalThis, "document", {
    value: { get cookie() { return jar.value; }, set cookie(v) { jar.value += String(v); } },
    configurable: true, writable: true,
  });
  const store = openStore(INSTANCE);
  writeSetting(store, "github-token", token("2026-10-20", { value: "ghp_must_not_be_returned" }));
  const before = storage.snapshot();
  const result = expiringSoon(store, NOW);
  assert.equal(result.length, 1);
  assert.deepEqual(Object.keys(result[0]).sort(), ["expires", "key"]);
  assert.equal(JSON.stringify(result).includes("ghp_must_not_be_returned"), false);
  assert.equal(calls.fetch, 0);
  assert.equal(storage.snapshot(), before);
  assert.equal(jar.value, "");
});
