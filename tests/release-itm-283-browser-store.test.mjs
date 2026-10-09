// Module: MOD-browser-store
// Level: release
// Guards: UC-042; UC-044; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; CONFIGURATION LIVES IN THE BROWSER; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import test from "node:test";
import { clearSetting, exportSettings, importSettings, listSettings, openStore, readExport, readSetting, writeSetting } from "../src/browser-store/index.mjs";

function storage() { const values = new Map(); return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key), get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null, snapshot: () => [...values.entries()].sort() }; }
function install(value) { Object.defineProperty(globalThis, "localStorage", { value, configurable: true }); Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true }); }

// TST-283901
// level: release
// module: MOD-browser-store
// guards: UC-042; UC-044; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; CONFIGURATION LIVES IN THE BROWSER; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
// given: constructed Map storage containing one instance's bridge, jump host, two named remote sessions and secrets, plus another instance
// input: public exportSettings/readExport/importSettings/listSettings/clearSetting in plain and locked forms
// expect: canonical version-1 envelopes round-trip this instance only, locked output uses PBKDF2 SHA-256 600000/AES-GCM without secrets, malformed/wrong-passphrase imports preserve raw bytes, remote metadata is secret-free, and Clear removes the selected raw session
test("TST-283901: public canonical export isolates, locks, imports and clears Bridge setup settings", async () => {
  const raw = storage(); install(raw); const instance = "owner/repo", other = "other/repo", store = openStore(instance);
  const bridge = { address: "https://jump.example.test/bridge", token: "bridge-secret" }, jump = { hostname: "jump.example.test", user: "agent", sshPort: 22, portRange: [40100, 40199], login: { user: "web", password: "jump-secret" } };
  const all = { "github-token": { value: "github-secret" }, products: ["https://github.com/owner/repo"], notifications: { checked: "2026-10-09" }, notified: { repo: {} }, "endpoint:main": { url: "https://model.test", key: "endpoint-secret" }, bridge, "jump-host": jump, "remote-session:alpha": { port: 40100, token: "alpha-secret" }, "remote-session:beta": { port: 40101, token: "beta-secret" }, "last-test:bridge": { at: "2026-10-09", outcome: "working" } };
  for (const [key, value] of Object.entries(all)) writeSetting(store, key, value); writeSetting(openStore(other), "bridge", { address: "https://other.test", token: "other-secret" });
  const plain = await exportSettings(store), plainFile = JSON.parse(plain); assert.equal(plainFile["agent-m-settings"], 1); assert.equal(plainFile.locked, false); assert.equal(plainFile.instance, instance); assert.equal(plain.includes("other-secret"), false);
  Object.defineProperty(globalThis, "localStorage", { value: undefined, configurable: true }); assert.deepEqual((await readExport(plain)).settings, all); install(raw);
  const locked = await exportSettings(store, "constructed passphrase"), lockedFile = JSON.parse(locked); assert.equal(lockedFile.locked, true); assert.equal(lockedFile.kdf.iterations, 600000); assert.equal(lockedFile.kdf.hash, "SHA-256"); assert.equal(lockedFile.cipher.name, "AES-GCM"); assert.equal(locked.includes("alpha-secret"), false); assert.deepEqual((await readExport(locked, "constructed passphrase")).settings["remote-session:beta"], { port: 40101, token: "beta-secret" });
  const before = raw.snapshot(); await assert.rejects(importSettings(store, locked, "wrong")); assert.deepEqual(raw.snapshot(), before); await assert.rejects(importSettings(store, "{ bad")); assert.deepEqual(raw.snapshot(), before);
  const destinationRaw = storage(); install(destinationRaw); const destination = openStore(instance); destinationRaw.setItem("agent-m:owner/repo:bridge", '{ "address" : "kept-byte-exact" }'); const imported = await importSettings(destination, plain); assert.ok(imported.kept.includes("bridge")); assert.ok(imported.added.includes("remote-session:alpha")); assert.equal(destinationRaw.getItem("agent-m:owner/repo:bridge"), '{ "address" : "kept-byte-exact" }'); assert.deepEqual(readSetting(destination, "remote-session:beta"), all["remote-session:beta"]);
  const beforeUnknown = destinationRaw.snapshot(); const unknown = JSON.stringify({ "agent-m-settings": 1, instance, exported: "2026-10-09T00:00:00.000Z", locked: false, settings: { products: ["new"], "unknown-key": {} }, foreign: {} }); await assert.rejects(importSettings(destination, unknown)); assert.deepEqual(destinationRaw.snapshot(), beforeUnknown);
  const info = listSettings(store).filter((entry) => entry.key.startsWith("remote-session:")); assert.equal(info.length, 2); assert.equal(JSON.stringify(info).includes("alpha-secret"), false); clearSetting(store, "remote-session:alpha"); assert.equal(readSetting(store, "remote-session:alpha"), null, "failure node: Clear removes the raw selected session");
});
