// MOD-browser-store — one person's configuration in their browser (docs/architecture/MOD-browser-store.md): its
// interface. Of it, ITM-204 builds what UC-001 keeps in the browser and, for UC-047, its notifications and what they
// notified: openStore, readSetting, writeSetting and clearSetting, over the catalogue's keys for the instance's GitHub
// token, a GitHub product's own token, a GitLab project's token, the list of products, notifications and notified
// (CONFIGURATION LIVES IN THE BROWSER, CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE, A CLEAR IS A REAL
// CLEAR, THE DASHBOARD KEEPS ITS PRODUCTS IN THE BROWSER). ITM-272 adds listSettings for the implemented catalogue;
// clearEverything, exportSettings, importSettings, readExport, expiringSoon and secretValues are not built yet.
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

const LITERAL_SETTING_KEYS = ["github-token", "products", "notifications", "notified", "bridge"];

function settingDescription(key) {
  if (key === "github-token") return { label: "GitHub token", secret: true, grants: "access to the instance repository", setUpIn: "settings" };
  if (key === "products") return { label: "Products", secret: false, grants: "the managed product list", setUpIn: "add-product" };
  if (key === "notifications") return { label: "Notifications", secret: false, grants: "acceptance notifications", setUpIn: "notifications" };
  if (key === "notified") return { label: "Notified files", secret: false, grants: "the record of notified files", setUpIn: "notifications" };
  if (key === "bridge") return { label: "Bridge", secret: true, grants: "access to the paired Bridge", setUpIn: "bridge" };
  if (key.startsWith("github-token:")) return { label: `GitHub token: ${key.slice("github-token:".length)}`, secret: true, grants: "access to one GitHub product", setUpIn: "add-product" };
  if (key.startsWith("gitlab-token:")) return { label: `GitLab token: ${key.slice("gitlab-token:".length)}`, secret: true, grants: "access to one GitLab product", setUpIn: "add-product" };
  if (key.startsWith("endpoint:")) return { label: `Endpoint: ${key.slice("endpoint:".length)}`, secret: true, grants: "access to a model endpoint", setUpIn: "endpoints" };
  return null;
}

function storedSettingKeys(store) {
  const keys = [];
  for (let index = 0; index < store.storage.length; index += 1) {
    const storageKey = store.storage.key(index);
    if (!storageKey?.startsWith(store.prefix)) continue;
    const key = storageKey.slice(store.prefix.length);
    if (key.startsWith("last-test:") || !isKnownKey(key) || LITERAL_SETTING_KEYS.includes(key)) continue;
    keys.push(key);
  }
  return keys.sort();
}

function expiryOf(value) {
  return value && typeof value === "object" && typeof value.expires === "string" ? value.expires : null;
}

function lastTestOf(store, key) {
  const value = readSetting(store, `last-test:${key}`);
  if (!value || typeof value !== "object" || typeof value.at !== "string" || typeof value.outcome !== "string") return null;
  return { at: value.at, outcome: value.outcome };
}

// listSettings(store) -> SettingInfo[] — every implemented literal setting, set or not, and stored instances of the
// implemented dynamic families. It reads only this instance's localStorage keys and never returns stored values,
// including credentials.
export function listSettings(store) {
  return [...LITERAL_SETTING_KEYS, ...storedSettingKeys(store)].map((key) => {
    const description = settingDescription(key);
    return { key, ...description, expires: expiryOf(readSetting(store, key)), lastTest: lastTestOf(store, key) };
  });
}
