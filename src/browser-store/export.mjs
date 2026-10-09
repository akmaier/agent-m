// MOD-browser-store's canonical version-1 settings export. The format belongs to this module and is readable in a
// browser or Node through WebCrypto; it does not open localStorage while reading an export.

import { isKnownKey } from "./catalogue.mjs";
import { StoreError, getRaw, setRaw } from "./store.mjs";

const VERSION = 1;
const ITERATIONS = 600000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const cryptoApi = () => globalThis.crypto;
const base64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const fromBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

function notAnExport() {
  return new StoreError("NotAnExport", {}, "This is not an Agent M settings export.");
}

function wrongPassphrase() {
  return new StoreError("WrongPassphrase", {}, "The passphrase is wrong or this locked export cannot be read.");
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function passphraseKey(passphrase, salt) {
  const base = await cryptoApi().subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return cryptoApi().subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, base,
    { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

function storedSettings(store) {
  const settings = {};
  for (let index = 0; index < store.storage.length; index += 1) {
    const storageKey = store.storage.key(index);
    if (!storageKey?.startsWith(store.prefix)) continue;
    const key = storageKey.slice(store.prefix.length);
    if (!isKnownKey(key)) continue;
    const raw = getRaw(store, key);
    try { settings[key] = JSON.parse(raw); } catch { /* invalid local bytes are not an exportable setting */ }
  }
  return settings;
}

function validateSettings(settings) {
  if (!isObject(settings)) throw notAnExport();
  for (const key of Object.keys(settings)) if (!isKnownKey(key)) throw notAnExport();
  return settings;
}

function validateHead(file) {
  if (!isObject(file) || file["agent-m-settings"] !== VERSION || typeof file.instance !== "string" ||
    typeof file.exported !== "string" || typeof file.locked !== "boolean") throw notAnExport();
}

function validatePlain(file) {
  if (file.locked !== false || !isObject(file.foreign) || Object.keys(file.foreign).length !== 0) throw notAnExport();
  return validateSettings(file.settings);
}

async function decryptLocked(file, passphrase) {
  if (file.locked !== true || !isObject(file.kdf) || !isObject(file.cipher) || typeof file.data !== "string" ||
    file.kdf.name !== "PBKDF2" || file.kdf.hash !== "SHA-256" || file.kdf.iterations !== ITERATIONS ||
    typeof file.kdf.salt !== "string" || file.cipher.name !== "AES-GCM" || typeof file.cipher.iv !== "string") throw notAnExport();
  try {
    const key = await passphraseKey(passphrase, fromBase64(file.kdf.salt));
    const clear = await cryptoApi().subtle.decrypt({ name: "AES-GCM", iv: fromBase64(file.cipher.iv) }, key, fromBase64(file.data));
    const payload = JSON.parse(decoder.decode(clear));
    if (!isObject(payload) || !isObject(payload.foreign) || Object.keys(payload.foreign).length !== 0) throw wrongPassphrase();
    return validateSettings(payload.settings);
  } catch (error) {
    if (error instanceof StoreError && error.name === "NotAnExport") throw error;
    throw wrongPassphrase();
  }
}

// readExport(text, passphrase?) -> { instance, settings }. It is deliberately independent of Store/localStorage.
export async function readExport(text, passphrase = "") {
  let file;
  try { file = JSON.parse(text); } catch { throw notAnExport(); }
  validateHead(file);
  const settings = file.locked ? await decryptLocked(file, passphrase) : validatePlain(file);
  return { instance: file.instance, settings };
}

// exportSettings(store, passphrase?) -> canonical version-1 JSON text.
export async function exportSettings(store, passphrase = "") {
  const head = { "agent-m-settings": VERSION, instance: store.prefix.slice("agent-m:".length, -1), exported: new Date().toISOString() };
  const payload = { settings: storedSettings(store), foreign: {} };
  if (!passphrase) return JSON.stringify({ ...head, locked: false, ...payload });

  const salt = cryptoApi().getRandomValues(new Uint8Array(16));
  const iv = cryptoApi().getRandomValues(new Uint8Array(12));
  const key = await passphraseKey(passphrase, salt);
  const encrypted = await cryptoApi().subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(payload)));
  return JSON.stringify({ ...head, locked: true,
    kdf: { name: "PBKDF2", hash: "SHA-256", iterations: ITERATIONS, salt: base64(salt) },
    cipher: { name: "AES-GCM", iv: base64(iv) }, data: base64(encrypted) });
}

// importSettings(store, text, passphrase?) -> adds only absent keys after complete export validation.
export async function importSettings(store, text, passphrase = "") {
  const { settings } = await readExport(text, passphrase);
  const added = [], kept = [];
  for (const [key, value] of Object.entries(settings)) {
    if (getRaw(store, key) !== null) kept.push(key);
    else added.push(key);
  }
  for (const key of added) setRaw(store, key, JSON.stringify(settings[key]));
  return { added, kept };
}
