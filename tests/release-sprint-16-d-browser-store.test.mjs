// ITM-279's public browser-store release guards.
// Module: MOD-browser-store
// Guards: UC-003; UC-044; CONFIGURATION LIVES IN THE BROWSER; A STORED SECRET IS HIDDEN UNTIL SHOWN; A CLEAR IS A REAL CLEAR
// Level: release
import test from "node:test";
import assert from "node:assert/strict";
import { clearSetting, listSettings, openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";
const key = "jump-host", instance = "akmaier/agent-m";
const host = {
  hostname: "jump.example.test", user: "agent-m", sshPort: 2222, portRange: [42000, 42099],
  httpsAddress: "https://jump.example.test/agent-m",
  login: { user: "jump-web-user", password: "jump-web-password-that-must-not-be-listed" },
};
function storage() { const values = new Map(); return { getItem: (k) => values.get(k) ?? null, setItem: (k,v) => values.set(k,String(v)), removeItem: (k) => values.delete(k), get length() { return values.size; }, key: (i) => [...values.keys()][i] ?? null }; }
function install() { const value=storage(); Object.defineProperty(globalThis,"localStorage",{value,configurable:true,writable:true}); return value; }
// given: the accepted optional JumpHost login { user, password }; input: write then reopen through public Store; expect: every field persists
test("TST-279-R1 public Store persists the accepted optional jump-host shape", () => {
  install();
  writeSetting(openStore(instance), key, host);
  assert.deepEqual(readSetting(openStore(instance), key), host);
});

// given: two instance Stores, each with a distinct nested web-server login; input: write and read each; expect: neither reads the other
test("TST-279-R2 public Store isolates jump hosts by instance", () => {
  install();
  const a = openStore("a/one"), b = openStore("b/two");
  const other = { ...host, hostname: "other.example.test", login: { user: "other-web-user", password: "other-web-password" } };
  writeSetting(a, key, host);
  writeSetting(b, key, other);
  assert.equal(readSetting(a, key).hostname, host.hostname);
  assert.equal(readSetting(a, key).login.password, host.login.password);
  assert.equal(readSetting(b, key).hostname, other.hostname);
  assert.equal(readSetting(b, key).login.password, other.login.password);
});

// given: a stored nested login; input: listSettings through the public interface; expect: bridge metadata has no stored login or value
test("TST-279-R3 public listing hides jump-host login and values", () => {
  install();
  const store = openStore(instance);
  writeSetting(store, key, host);
  const info = listSettings(store).find((setting) => setting.key === key);
  const metadata = JSON.stringify(info);
  assert.equal(info.secret, true);
  assert.equal(info.setUpIn, "bridge");
  assert.equal(metadata.includes(host.login.user), false);
  assert.equal(metadata.includes(host.login.password), false);
  assert.equal(metadata.includes(host.hostname), false);
});

// given: a persisted nested login; input: public clearSetting; expect: raw entry and reread are absent
test("TST-279-R4 public Clear removes the persisted jump-host login", () => {
  const raw = install(), store = openStore(instance);
  writeSetting(store, key, host);
  clearSetting(store, key);
  assert.equal(raw.getItem(`agent-m:${instance}:${key}`), null);
  assert.equal(readSetting(store, key), null);
});
