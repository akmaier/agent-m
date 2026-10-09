// ITM-279's public browser-store release guards.
// Module: MOD-browser-store
// Guards: UC-003; UC-044; CONFIGURATION LIVES IN THE BROWSER; A STORED SECRET IS HIDDEN UNTIL SHOWN; A CLEAR IS A REAL CLEAR
// Level: release
import test from "node:test";
import assert from "node:assert/strict";
import { clearSetting, listSettings, openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";
const key = "jump-host", instance = "akmaier/agent-m";
const host = { hostname: "jump.example.test", user: "agent-m", sshPort: 2222, portRange: [42000, 42099], httpsAddress: "https://jump.example.test/agent-m", login: "private-web-login" };
function storage() { const values = new Map(); return { getItem: (k) => values.get(k) ?? null, setItem: (k,v) => values.set(k,String(v)), removeItem: (k) => values.delete(k), get length() { return values.size; }, key: (i) => [...values.keys()][i] ?? null }; }
function install() { const value=storage(); Object.defineProperty(globalThis,"localStorage",{value,configurable:true,writable:true}); return value; }
// given: the accepted optional jump-host shape; input: write then reopen through public Store; expect: every field persists
 test("TST-279-R1 public Store persists the accepted optional jump-host shape", () => { install(); writeSetting(openStore(instance),key,host); assert.deepEqual(readSetting(openStore(instance),key),host); });
// given: two instance Stores; input: each writes its own host; expect: no instance reads the other
 test("TST-279-R2 public Store isolates jump hosts by instance", () => { install(); const a=openStore("a/one"), b=openStore("b/two"); writeSetting(a,key,host); writeSetting(b,key,{...host,hostname:"other.example.test",login:"other-login"}); assert.equal(readSetting(a,key).hostname,"jump.example.test"); assert.equal(readSetting(b,key).hostname,"other.example.test"); });
// given: a stored login; input: listSettings through public interface; expect: metadata has no stored login or value
 test("TST-279-R3 public listing hides jump-host login and values", () => { install(); const s=openStore(instance); writeSetting(s,key,host); const info=listSettings(s).find((x)=>x.key===key); assert.equal(info.secret,true); assert.equal(info.setUpIn,"bridge"); assert.equal(JSON.stringify(info).includes(host.login),false); assert.equal(JSON.stringify(info).includes(host.hostname),false); });
// given: a persisted login; input: public clearSetting; expect: raw entry and reread are absent
 test("TST-279-R4 public Clear removes the persisted jump-host login", () => { const raw=install(), s=openStore(instance); writeSetting(s,key,host); clearSetting(s,key); assert.equal(raw.getItem(`agent-m:${instance}:${key}`),null); assert.equal(readSetting(s,key),null); });
