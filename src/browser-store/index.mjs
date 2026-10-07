// MOD-browser-store — one person's configuration in their browser (docs/architecture/MOD-browser-store.md): its
// interface. Of it, ITM-204 builds what UC-001 keeps in the browser and, for UC-047, its notifications and what they
// notified: openStore, readSetting, writeSetting and clearSetting, over the catalogue's keys for the instance's GitHub
// token, a GitHub product's own token, a GitLab project's token, the list of products, notifications and notified
// (CONFIGURATION LIVES IN THE BROWSER, CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE, A CLEAR IS A REAL
// CLEAR, THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER). clearEverything, listSettings, exportSettings,
// importSettings, readExport, expiringSoon and secretValues are not built yet.
//
// Module: MOD-browser-store
//
// catalogue.mjs names every key this item's catalogue knows; store.mjs reads, writes and clears localStorage under the
// instance's prefix and throws StoreError. Every other file of this folder is private to it.

import { isKnownKey } from "./catalogue.mjs";
import { getRaw, openInstanceStorage, removeRaw, setRaw, StoreError } from "./store.mjs";

export { StoreError };

// openStore(instance: string) -> Store — the store for the instance "owner/repository" in this browser. Throws
// StorageUnavailable.
export function openStore(instance) {
  return openInstanceStorage(instance);
}

// readSetting(store, key) -> the value kept under `key`, or null when it is not set.
export function readSetting(store, key) {
  const raw = getRaw(store, key);
  if (raw === null) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

// writeSetting(store, key, value) -> void — stores `value` under a key of the catalogue. Throws UnknownSetting for any
// other key, and StorageUnavailable. Sets no cookie and puts nothing into an address.
export function writeSetting(store, key, value) {
  if (!isKnownKey(key)) throw new StoreError("UnknownSetting", { key }, `${key} is not a setting MOD-browser-store keeps.`);
  setRaw(store, key, JSON.stringify(value));
}

// clearSetting(store, key) -> void — removes the entry from localStorage itself, not only from a form (A CLEAR IS A
// REAL CLEAR).
export function clearSetting(store, key) {
  removeRaw(store, key);
}
