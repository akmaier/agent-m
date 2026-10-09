// Module: MOD-settings-pages
// Level: release
// Guards: UC-003; UC-011; UC-042; UC-044; EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE; THE DASHBOARD WRITES THE TUNNEL COMMANDS; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS; A STORED SECRET IS HIDDEN UNTIL SHOWN
import assert from "node:assert/strict";
import test from "node:test";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget { constructor(name) { super(); this.localName=name; this.childNodes=[]; this.className=""; this.value=""; this.type=""; } append(...nodes) { for (const node of nodes.flat()) this.childNodes.push(typeof node === "string" ? { textContent: node } : node); } replaceChildren(...nodes) { this.childNodes=[]; this.append(...nodes); } get textContent() { return this.childNodes.map((n) => n.textContent).join(""); } set textContent(value) { this.replaceChildren(String(value)); } focus() {} }
globalThis.document={createElement:(name)=>new Element(name)};
function all(root, name) { const out=[]; const visit=(node)=>{ for(const child of node.childNodes??[]) { if(child instanceof Element) { if(child.className.split(" ").includes(name)) out.push(child); visit(child); } } }; visit(root); return out; }
class Storage { constructor(){this.values=new Map();} getItem(k){return this.values.get(k)??null;} setItem(k,v){this.values.set(k,String(v));} removeItem(k){this.values.delete(k);} get length(){return this.values.size;} key(i){return [...this.values.keys()][i]??null;} }
async function click(button) { button.dispatchEvent(new Event("click")); await new Promise((resolve)=>setImmediate(resolve)); }
async function rendered(store) { const target=document.createElement("div"); await view.routes.find((route)=>route.name==="bridge").render(target,{instance:{repository:"release/fixture"},store}); return target; }

// TST-287901
// level: release
// module: MOD-settings-pages
// guards: UC-003; UC-011; UC-042; UC-044; EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE; THE DASHBOARD WRITES THE TUNNEL COMMANDS; THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS; A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; A STORED SECRET IS HIDDEN UNTIL SHOWN
// given: canonical stored jump-host and occupied remote-session records at a served HTTPS origin
// input: public Bridge route saves a named remote session, reopens it, and renders its supplied setup text
// expect: lowest free inclusive port persists under remote-session:name, existing records persist, token stays hidden until Show, and public commands/proxy builders render loopback/configured-origin text without a request, tunnel, HTTPS test, or process start
test("TST-287901: public Bridge route persists and renders canonical remote-session setup", async () => {
  Object.defineProperty(globalThis,"localStorage",{configurable:true,value:new Storage()}); Object.defineProperty(globalThis,"location",{configurable:true,value:{origin:"https://release.example.test"}}); globalThis.fetch=async()=>{throw new Error("setup must not request")}; const store=openStore("release/fixture");
  writeSetting(store,"jump-host",{hostname:"jump.example.test",user:"agent",sshPort:22,portRange:[40100,40102]}); writeSetting(store,"remote-session:alpha",{port:40100,token:"alpha-token"}); const page=await rendered(store); all(page,"remote-session-name")[0].value="beta"; all(page,"remote-session-token")[0].value="beta-token"; await click(all(page,"remote-session-save")[0]);
  assert.deepEqual(readSetting(store,"remote-session:beta"),{port:40101,token:"beta-token"},"failure node: public route stores the allocator result canonically"); assert.deepEqual(readSetting(store,"remote-session:alpha"),{port:40100,token:"alpha-token"}); assert.match(all(page,"remote-session-commands")[0].textContent,/-R 127\.0\.0\.1:40101:127\.0\.0\.1:4711/); assert.match(all(page,"remote-session-proxy-apache")[0].textContent,/bridge\/beta/); assert.match(all(page,"remote-session-proxy-nginx")[0].textContent,/release\.example\.test/); const reopened=await rendered(store); assert.equal(all(reopened,"remote-session-token")[0].type,"password"); await click(all(reopened,"remote-session-show")[0]); assert.equal(all(reopened,"remote-session-token")[0].type,"text");
});
