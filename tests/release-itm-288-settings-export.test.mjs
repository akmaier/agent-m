// Module: MOD-settings-pages
// Level: release
// Guards: UC-042; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; CONFIGURATION LIVES IN THE BROWSER
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import test from "node:test";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

class E extends EventTarget { constructor(){super();this.childNodes=[];this.className="";this.value="";this.files=[];} append(...x){this.childNodes.push(...x.flat());} replaceChildren(...x){this.childNodes=[];this.append(...x);} get textContent(){return this.childNodes.map(x=>x?.textContent??String(x)).join("");} set textContent(x){this.childNodes=[String(x)];} click(){this.dispatchEvent(new Event("click"));} focus(){} }
globalThis.document={createElement:()=>new E()};
function byClass(root,name){const out=[];const walk=n=>{for(const x of n.childNodes??[]){if(x instanceof E){if(x.className.split(" ").includes(name))out.push(x);walk(x);}}};walk(root);return out;}
class Storage { constructor(){this.m=new Map();} getItem(k){return this.m.get(k)??null;} setItem(k,v){this.m.set(k,String(v));} removeItem(k){this.m.delete(k);} get length(){return this.m.size;} key(i){return [...this.m.keys()][i]??null;} snapshot(){return [...this.m.entries()].sort();} }
async function render(store){const target=new E();await view.routes.find(r=>r.name==="settings").render(target,{instance:{repository:"release/example"},store,go(){}});return target;}
async function fire(node,type="click"){node.dispatchEvent(new Event(type));await new Promise(r=>setTimeout(r,10));}
async function waitFor(check){for(let i=0;i<500;i++){if(check())return;await new Promise(r=>setTimeout(r,10));}assert.ok(check(),"public operation did not settle");}
const values={"github-token":{value:"github-secret"},"github-token:o/p":{value:"github-product-secret"},"gitlab-token:g/p":{value:"gitlab-secret"},products:["p"],notifications:{on:true},notified:{},"endpoint:e":{url:"https://m",key:"endpoint-secret"},bridge:{address:"https://b",token:"bridge-secret"},"jump-host":{hostname:"j",user:"u",sshPort:22,portRange:[1,2],login:{user:"w",password:"jump-secret"}},"remote-session:r":{port:1,token:"remote-secret"},"last-test:bridge":{at:"x",outcome:"working"}};
const names=Object.keys(values);
async function exported(store,passphrase=""){const page=await render(store);byClass(page,"settings-export-passphrase")[0].value=passphrase;const blobs=[],old=globalThis.URL;globalThis.URL={createObjectURL:b=>(blobs.push(b),"blob:release"),revokeObjectURL(){}};try{await fire(byClass(page,"settings-export-download")[0]);await waitFor(()=>blobs.length===1);}finally{globalThis.URL=old;}return {page,text:await blobs[0].text()};}
// TST-288901
// level: release
// module: MOD-settings-pages
// guards: UC-042; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS; AN EXPORT CAN BE LOCKED WITH A PASSPHRASE; CONFIGURATION LIVES IN THE BROWSER
// given: complete implemented literal and family settings in controlled browser storage
// input: public Settings exports plain and locked bytes and imports them into added/kept and refusal destinations
// expect: every secret grant is disclosed without secret bytes; every implemented value round-trips; complete added/kept names and named refusal preserve exact raw storage
 test("TST-288901: public Settings exports and imports every implemented setting",async()=>{
  Object.defineProperty(globalThis,"crypto",{configurable:true,value:webcrypto});
  const raw=new Storage();Object.defineProperty(globalThis,"localStorage",{configurable:true,value:raw});const source=openStore("release/example");for(const [key,value] of Object.entries(values))writeSetting(source,key,value);
  const {page,text:plain}=await exported(source);const notice=byClass(page,"settings-export-notice")[0].textContent;
  for(const label of ["GitHub token","GitLab token","Endpoint","Bridge","Jump host","Remote session"])assert.match(notice,new RegExp(label));
  for(const secret of ["github-secret","github-product-secret","gitlab-secret","endpoint-secret","bridge-secret","jump-secret","remote-secret"])assert.equal(notice.includes(secret),false);
  assert.deepEqual(JSON.parse(plain).settings,values);
  const destinationRaw=new Storage();Object.defineProperty(globalThis,"localStorage",{configurable:true,value:destinationRaw});const destination=openStore("release/example");
  const kept={products:'["keep-products"]',bridge:'{ "address" : "keep-bridge" }'};for(const [key,rawValue] of Object.entries(kept))destination.storage.setItem(`${destination.prefix}${key}`,rawValue);
  const target=await render(destination), input=byClass(target,"settings-import-file")[0];input.files=[{text:async()=>plain}];await fire(input,"change");await waitFor(()=>readSetting(destination,"remote-session:r")?.token==="remote-secret");
  for(const [key,value] of Object.entries(values))if(!(key in kept))assert.deepEqual(readSetting(destination,key),value);for(const [key,rawValue] of Object.entries(kept))assert.equal(destination.storage.getItem(`${destination.prefix}${key}`),rawValue);
  const added=names.filter(key=>!(key in kept)).join(", "), keptNames=Object.keys(kept).join(", "), imported=byClass(target,"settings-import-result")[0].textContent;assert.equal(imported,`Added: ${added}. Kept: ${keptNames}.`);
  Object.defineProperty(globalThis,"localStorage",{configurable:true,value:raw});const {text:locked}=await exported(source,"pass");assert.equal(locked.includes("remote-secret"),false);
  const cleanRaw=new Storage();Object.defineProperty(globalThis,"localStorage",{configurable:true,value:cleanRaw});const clean=openStore("release/example"),cleanPage=await render(clean),cleanFile=byClass(cleanPage,"settings-import-file")[0];byClass(cleanPage,"settings-import-passphrase")[0].value="pass";cleanFile.files=[{text:async()=>locked}];await fire(cleanFile,"change");await waitFor(()=>readSetting(clean,"remote-session:r")?.token==="remote-secret");for(const [key,value] of Object.entries(values))assert.deepEqual(readSetting(clean,key),value);
  const before=cleanRaw.snapshot();byClass(cleanPage,"settings-import-passphrase")[0].value="wrong";cleanFile.files=[{text:async()=>locked}];await fire(cleanFile,"change");await waitFor(()=>/passphrase is wrong/i.test(byClass(cleanPage,"settings-import-result")[0].textContent));assert.deepEqual(cleanRaw.snapshot(),before);
  cleanFile.files=[{text:async()=>"{"}];await fire(cleanFile,"change");await waitFor(()=>/not an Agent M settings export/i.test(byClass(cleanPage,"settings-import-result")[0].textContent));assert.deepEqual(cleanRaw.snapshot(),before);
});
