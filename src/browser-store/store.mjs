// Reading, writing and clearing one instance's settings in this browser's localStorage, under its prefix
// (docs/architecture/MOD-browser-store.md, Data) — CONFIGURATION LIVES IN THE BROWSER, CONFIGURATION IS STORED IN
// LOCALSTORAGE, NOT IN A COOKIE.
//
// Module: MOD-browser-store

// StoreError — the failures this item's functions throw (MOD-browser-store, Interfaces): StorageUnavailable (the
// browser refuses localStorage, for example in a private window) and, from writeSetting (index.mjs) only,
// UnknownSetting { key }.
export class StoreError extends Error {
  constructor(name, fields, message) {
    super(message);
    this.name = name;
    Object.assign(this, fields ?? {});
  }
}

// The prefix of one instance's keys, "agent-m:<owner>/<repository>:", so that two instances in one browser never share
// an entry.
const prefixOf = (instance) => `agent-m:${instance}:`;

// The browser's localStorage, told apart from one that merely exists but refuses to store anything — a private window,
// historically — by a real write and its removal. A browser that throws reaching globalThis.localStorage at all, or
// that has none, fails the same way.
function reachableStorage(prefix) {
  let storage;
  try { storage = globalThis.localStorage; } catch { storage = null; }
  if (!storage || typeof storage.setItem !== "function") {
    throw new StoreError("StorageUnavailable", {}, "localStorage is not available in this browser.");
  }
  const probe = `${prefix}__probe__`;
  try {
    storage.setItem(probe, "1");
    storage.removeItem(probe);
  } catch {
    throw new StoreError("StorageUnavailable", {}, "localStorage refuses to store anything here.");
  }
  return storage;
}

// openInstanceStorage(instance) -> { storage, prefix } — the Store openStore (index.mjs) returns. Throws
// StorageUnavailable.
export function openInstanceStorage(instance) {
  const prefix = prefixOf(instance);
  return { storage: reachableStorage(prefix), prefix };
}

// getRaw(store, key) -> the raw JSON text kept under `key`, or null when it is not set.
export function getRaw(store, key) {
  const v = store.storage.getItem(store.prefix + key);
  return v === null || v === undefined ? null : v;
}

// setRaw(store, key, raw) -> void. Throws StorageUnavailable where the browser refuses the write — a quota used up, or
// storage taken away, after the store was opened.
export function setRaw(store, key, raw) {
  try {
    store.storage.setItem(store.prefix + key, raw);
  } catch {
    throw new StoreError("StorageUnavailable", {}, "localStorage refused to store this value.");
  }
}

// removeRaw(store, key) -> void — removes the entry from localStorage itself (A CLEAR IS A REAL CLEAR).
export function removeRaw(store, key) {
  store.storage.removeItem(store.prefix + key);
}
