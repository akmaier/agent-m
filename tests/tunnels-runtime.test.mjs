// Module: MOD-tunnels
// Guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; UC-011; UC-044
// Level: unit

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const source = new URL("../src/tunnels/index.mjs", import.meta.url).href;
const ssh2Cache = join(tmpdir(), "agent-m-286-ssh2-1.17.0");

function run(command, arguments_, options = {}) {
  const result = spawnSync(command, arguments_, { encoding: "utf8", timeout: 40_000, ...options });
  if (result.status !== 0) throw new Error(`${command} ${arguments_.join(" ")} failed; status=${result.status}; signal=${result.signal}; error=${result.error?.code ?? "none"}; stderr=${result.stderr}`);
  return result;
}

function runtime() {
  if (!existsSync(join(ssh2Cache, "node_modules", "ssh2", "package.json"))) run("npm", ["install", "--no-save", "--prefix", ssh2Cache, "ssh2@1.17.0"]);
  const positive = run(process.execPath, ["--input-type=module", "-e", `
    import { createRequire } from "node:module";
    const require = createRequire(import.meta.url);
    const { Client, Server, utils } = require("ssh2");
    if (require("ssh2/package.json").version !== "1.17.0") throw new Error("ssh2 version");
    const server = new Server({ hostKeys: [utils.generateKeyPairSync("ed25519").private] }, (client) => client.on("authentication", (ctx) => ctx.accept()));
    await new Promise((resolve, reject) => server.listen(0, "127.0.0.1", (error) => error ? reject(error) : resolve()));
    const client = new Client();
    await new Promise((resolve, reject) => client.once("ready", resolve).once("error", reject).connect({ host: "127.0.0.1", port: server.address().port, username: "fixture", password: "fixture", hostVerifier: () => true }));
    const closed = new Promise((resolve) => client.once("close", resolve));
    client.end(); await closed; await new Promise((resolve) => server.close(resolve));
    console.log("ssh2-loopback-known-positive");
  `], { env: { ...process.env, NODE_PATH: join(ssh2Cache, "node_modules") } });
  assert.match(positive.stdout, /ssh2-loopback-known-positive/);
  return join(ssh2Cache, "node_modules");
}

function invoke(folder, plan) {
  const script = `
    const tunnels = await import(${JSON.stringify(source)});
    if (typeof tunnels.openTunnels !== "function") throw new Error("missing openTunnels runtime export");
    await tunnels.openTunnels(process.argv[1], JSON.parse(process.argv[2]), 4711);
    console.log(JSON.stringify(tunnels.tunnelState()));
    await tunnels.closeTunnels();
  `;
  return spawnSync(process.execPath, ["--input-type=module", "-e", script, folder, JSON.stringify([plan])], { encoding: "utf8", timeout: 40_000, env: { ...process.env, NODE_PATH: runtime() } });
}

function dataFolder() { return mkdtempSync(join(tmpdir(), "agent-m-286-tunnels-")); }

// TST-286001
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-044
// given: a pinned ssh2@1.17.0 loopback connection proven before the product call and a controlled canonical reverse plan
// input: openTunnels(dataFolder, [plan], bridgePort)
// expect: the runtime exposes the plan as reverse while its controlled SSH connection is opening or open
test("TST-286001: public runtime accepts a canonical reverse tunnel plan after ssh2 loopback positive", () => {
  const folder = dataFolder();
  try {
    const result = invoke(folder, { direction: "reverse", jumpHost: "127.0.0.1", user: "fixture", sshPort: 1, remotePort: 41001, bind: "127.0.0.1", bridgePort: 4711, keyFile: "fixture" });
    assert.equal(result.status, 0, `failure node: runtime opener: ${result.stderr}`);
    assert.ok(JSON.parse(result.stdout).some((state) => state.kind === "reverse"));
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-286002
// level: unit
// module: MOD-tunnels
// guards: A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; UC-011
// given: a pinned ssh2@1.17.0 loopback connection proven before the product call and a non-loopback reverse plan
// input: openTunnels(dataFolder, [nonLoopbackPlan], bridgePort)
// expect: NotLoopback is reported before any connection or forwarding request
test("TST-286002: runtime refuses a non-loopback reverse plan before forwarding", () => {
  const folder = dataFolder();
  try {
    const result = invoke(folder, { direction: "reverse", jumpHost: "127.0.0.1", user: "fixture", sshPort: 1, remotePort: 41002, bind: "0.0.0.0", bridgePort: 4711, keyFile: "fixture" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /NotLoopback/);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-286003
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; A REVERSE TUNNEL LISTENS ONLY ON THE JUMP HOST'S LOOPBACK; UC-044
// given: a controlled real ssh2 jump host, its loopback forwarding listener, and a controlled Bridge TCP echo server
// input: a byte payload through public openTunnels' reverse plan and the jump host's actual forwarded connection
// expect: the Bridge echo receives and returns the exact bytes, then closeTunnels closes the runtime
test("TST-286003: reverse forwarding carries exact bytes through real ssh2 loopback", () => {
  const folder = dataFolder();
  const script = `
    import { createRequire } from "node:module"; import net from "node:net";
    const require = createRequire(import.meta.url); const { Server, utils } = require("ssh2");
    const { openTunnels, closeTunnels, tunnelState } = await import(${JSON.stringify(source)});
    const listen = (server) => new Promise((ok, no) => server.listen(0, "127.0.0.1", (e) => e ? no(e) : ok(server.address().port)));
    const bridge = net.createServer((s) => s.pipe(s)); const bridgePort = await listen(bridge);
    let sshClient, remote; const stages=[]; const ssh = new Server({ hostKeys:[utils.generateKeyPairSync("ed25519").private] }, (c) => { sshClient=c; c.on("authentication", x=>x.accept()); c.on("request", async (accept, reject, name, info) => { if(name !== "tcpip-forward") return reject(); remote=net.createServer((socket)=>c.forwardOut(info.bindAddr, info.bindPort, socket.remoteAddress, socket.remotePort, (error, stream)=> { if(error)return socket.destroy(error); stages.push("streamcreated"); socket.pipe(stream).pipe(socket); })); await new Promise((ok,no)=>remote.listen(info.bindPort, info.bindAddr, e=>e?no(e):ok())); accept(); stages.push("forwardrequestaccepted"); }); });
    const sshPort = await listen(ssh); const remotePort = 42003;
    await openTunnels(process.argv[1], [{ direction:"reverse", jumpHost:"127.0.0.1", user:"fixture", sshPort, remotePort, bind:"127.0.0.1", bridgePort }], bridgePort);
    for(let i=0;i<50 && tunnelState()[0]?.state !== "open";i++) await new Promise(r=>setTimeout(r,10));
    if(tunnelState()[0]?.state !== "open") throw new Error(JSON.stringify(tunnelState()));
    const received = await new Promise((resolve,reject) => { const socket=net.connect(remotePort,"127.0.0.1"); socket.once("error",reject); socket.once("data",d=>{ stages.push("payloadreceived"); resolve(d.toString()); socket.destroy(); }); socket.write("reverse-bytes"); });
    stages.push("close-start"); await closeTunnels(); await new Promise(r=>remote.close(r)); await new Promise(r=>ssh.close(r)); await new Promise(r=>bridge.close(r));
    if(received !== "reverse-bytes") throw new Error("bytes="+received+" stages="+stages); console.log("reverse-byte-positive", stages.join(","));
  `;
  try {
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", script, folder], { encoding: "utf8", timeout: 40_000, env: { ...process.env, NODE_PATH: runtime() } });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /reverse-byte-positive/);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-286004
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-011
// given: a controlled ssh2 jump host with an accepted tcpip channel and a remote loopback TCP echo server
// input: bytes written to the public forward listener opened by openTunnels
// expect: the remote echo returns the exact bytes and closeTunnels closes the forward listener
test("TST-286004: forward forwarding carries exact bytes through real ssh2 loopback", () => {
  const folder = dataFolder(); const script = `
    import { createRequire } from "node:module"; import net from "node:net";
    const require=createRequire(import.meta.url); const {Server,utils}=require("ssh2"); const {openTunnels,closeTunnels,tunnelState}=await import(${JSON.stringify(source)});
    const listen=s=>new Promise((ok,no)=>s.listen(0,"127.0.0.1",e=>e?no(e):ok(s.address().port))); const echo=net.createServer(s=>s.pipe(s)); const remotePort=await listen(echo);
    const reservation=net.createServer(); const localPort=await listen(reservation); await new Promise(r=>reservation.close(r)); const ssh=new Server({hostKeys:[utils.generateKeyPairSync("ed25519").private]},c=>{c.on("authentication",x=>x.accept());c.on("tcpip",(accept,reject,info)=>{if(info.destIP!=="127.0.0.1"||info.destPort!==localPort)return reject();const stream=accept();const s=net.connect(remotePort,"127.0.0.1");s.pipe(stream).pipe(s);});}); const sshPort=await listen(ssh);
    await openTunnels(process.argv[1],[{direction:"forward",jumpHost:"127.0.0.1",user:"fixture",sshPort,remotePort:localPort,bind:"127.0.0.1",bridgePort:remotePort}],remotePort);
    for(let i=0;i<50&&tunnelState()[0]?.state!=="open";i++)await new Promise(r=>setTimeout(r,10)); if(tunnelState()[0]?.state!=="open")throw Error(JSON.stringify(tunnelState()));
    const got=await new Promise((ok,no)=>{const s=net.connect(localPort,"127.0.0.1");s.once("error",no);s.once("data",d=>{ok(d.toString());s.destroy()});s.write("forward-bytes")}); await closeTunnels();await new Promise(r=>ssh.close(r));await new Promise(r=>echo.close(r));if(got!=="forward-bytes")throw Error(got);console.log("forward-byte-positive");
  `; try { const result=spawnSync(process.execPath,["--input-type=module","-e",script,folder],{encoding:"utf8",timeout:40000,env:{...process.env,NODE_PATH:runtime()}});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/forward-byte-positive/);} finally {rmSync(folder,{recursive:true,force:true});}
});

// TST-286005
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-044
// given: one controlled jump-host endpoint whose real ssh2 host key changes after first trust
// input: openTunnels is called before and after the key change
// expect: the original known-jump-hosts bytes persist, changed host key becomes failed, and forwarding is never requested
test("TST-286005: changed host key is refused before forwarding", () => {
  const folder=dataFolder(); const script=`
    import {createRequire} from "node:module";import {readFileSync} from "node:fs";import {join} from "node:path";const require=createRequire(import.meta.url);const {Server,utils}=require("ssh2");const {openTunnels,closeTunnels,tunnelState}=await import(${JSON.stringify(source)});let requests=0;const key1=utils.generateKeyPairSync("ed25519").private,key2=utils.generateKeyPairSync("ed25519").private;const make=(key,allow)=>new Server({hostKeys:[key]},c=>{c.on("error",()=>{});c.on("authentication",x=>x.accept());c.on("request",(a,r)=>{requests++;allow?a():r()})});let s=make(key1,true);await new Promise((ok,no)=>s.listen(0,"127.0.0.1",e=>e?no(e):ok()));const port=s.address().port,plan={direction:"reverse",jumpHost:"127.0.0.1",user:"x",sshPort:port,remotePort:44005,bind:"127.0.0.1",bridgePort:1};await openTunnels(process.argv[1],[plan],1);for(let i=0;i<30&&tunnelState()[0]?.state!=="open";i++)await new Promise(r=>setTimeout(r,10));if(tunnelState()[0]?.state!=="open")throw Error(JSON.stringify(tunnelState()));const before=readFileSync(join(process.argv[1],"ssh","known-jump-hosts"));await closeTunnels();await new Promise(r=>s.close(r));s=make(key2,false);await new Promise((ok,no)=>s.listen(port,"127.0.0.1",e=>e?no(e):ok()));requests=0;await openTunnels(process.argv[1],[plan],1);await new Promise(r=>setTimeout(r,100));const state=tunnelState()[0];const after=readFileSync(join(process.argv[1],"ssh","known-jump-hosts"));await closeTunnels();await new Promise(r=>s.close(r));if(state.reason!=="host-key-changed"||requests!==0||!before.equals(after))throw Error(JSON.stringify({state,requests}));console.log("host-key-positive");
  `;try{const r=spawnSync(process.execPath,["--input-type=module","-e",script,folder],{encoding:"utf8",timeout:40000,env:{...process.env,NODE_PATH:runtime()}});assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/host-key-positive/)}finally{rmSync(folder,{recursive:true,force:true})}
});

// TST-286006
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-011; UC-044
// given: a real authenticated ssh2 jump host, one accepted reverse plan, and an occupied loopback port for a forward plan
// input: openTunnels(dataFolder, [reversePlan, forwardPlan], bridgePort)
// expect: the named reverse state remains open while the named forward state becomes port-taken, and closeTunnels stops both
test("TST-286006: an occupied forward listener fails without closing another authenticated tunnel", () => {
  const folder = dataFolder();
  const script = `
    import {createRequire} from "node:module"; import net from "node:net";
    const require=createRequire(import.meta.url); const {Server,utils}=require("ssh2"); const {openTunnels,closeTunnels,tunnelState}=await import(${JSON.stringify(source)});
    const listen=s=>new Promise((ok,no)=>s.listen(0,"127.0.0.1",e=>e?no(e):ok(s.address().port))); const pause=ms=>new Promise(r=>setTimeout(r,ms));
    const ssh=new Server({hostKeys:[utils.generateKeyPairSync("ed25519").private]},c=>{c.on("error",()=>{});c.on("authentication",x=>x.accept());c.on("request",(a,r,n)=>n==="tcpip-forward"?a():r())}); const sshPort=await listen(ssh);
    const held=net.createServer(); const forwardPort=await listen(held); const reversePort=forwardPort+1;
    const plans=[{direction:"reverse",jumpHost:"127.0.0.1",user:"fixture",sshPort,remotePort:reversePort,bind:"127.0.0.1",bridgePort:1},{direction:"forward",jumpHost:"127.0.0.1",user:"fixture",sshPort,remotePort:forwardPort,bind:"127.0.0.1",bridgePort:1}];
    await openTunnels(process.argv[1],plans,1); for(let i=0;i<60;i++){const states=tunnelState();if(states.some(x=>x.name===\`reverse:127.0.0.1:\${reversePort}\`&&x.state==="open")&&states.some(x=>x.name===\`forward:127.0.0.1:\${forwardPort}\`&&x.reason==="port-taken"))break;await pause(10)}
    const states=tunnelState(); const reverse=states.find(x=>x.name===\`reverse:127.0.0.1:\${reversePort}\`); const forward=states.find(x=>x.name===\`forward:127.0.0.1:\${forwardPort}\`); if(reverse?.state!=="open"||forward?.state!=="failed"||forward.reason!=="port-taken")throw Error(JSON.stringify(states));
    await closeTunnels(); await new Promise(r=>held.close(r)); await new Promise(r=>ssh.close(r)); console.log("forward-port-collision-positive");
  `;
  try { const result=spawnSync(process.execPath,["--input-type=module","-e",script,folder],{encoding:"utf8",timeout:40000,env:{...process.env,NODE_PATH:runtime()}});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/forward-port-collision-positive/); } finally { rmSync(folder,{recursive:true,force:true}); }
});

// TST-286007
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-011; UC-044
// given: one authenticated real ssh2 jump host, one host refusing authentication, and one dynamically reserved then closed loopback port
// input: openTunnels(dataFolder, [openPlan, authPlan, unreachablePlan], bridgePort)
// expect: the named open state remains open while the named failed states expose auth-refused and host-unreachable
test("TST-286007: authentication and unreachable failures are isolated from an open authenticated tunnel", () => {
  const folder=dataFolder(); const script=`
    import {createRequire} from "node:module"; import net from "node:net";
    const require=createRequire(import.meta.url); const {Server,utils}=require("ssh2"); const {openTunnels,closeTunnels,tunnelState}=await import(${JSON.stringify(source)}); const listen=s=>new Promise((ok,no)=>s.listen(0,"127.0.0.1",e=>e?no(e):ok(s.address().port))); const pause=ms=>new Promise(r=>setTimeout(r,ms));
    const hostKey=utils.generateKeyPairSync("ed25519").private; const open=new Server({hostKeys:[hostKey]},c=>{c.on("error",()=>{});c.on("authentication",x=>x.accept());c.on("request",(a,r,n)=>n==="tcpip-forward"?a():r())}); const openPort=await listen(open);
    const denied=new Server({hostKeys:[hostKey]},c=>{c.on("error",()=>{});c.on("authentication",x=>x.reject())}); const deniedPort=await listen(denied);
    const reserved=net.createServer(); const unreachablePort=await listen(reserved); await new Promise(r=>reserved.close(r)); const plan=(sshPort,remotePort)=>({direction:"reverse",jumpHost:"127.0.0.1",user:"fixture",sshPort,remotePort,bind:"127.0.0.1",bridgePort:1}); const plans=[plan(openPort,45107),plan(deniedPort,45108),plan(unreachablePort,45109)];
    await openTunnels(process.argv[1],plans,1); for(let i=0;i<100;i++){const states=tunnelState(); if(states.some(x=>x.name==="reverse:127.0.0.1:45107"&&x.state==="open")&&states.some(x=>x.name==="reverse:127.0.0.1:45108"&&x.reason==="auth-refused")&&states.some(x=>x.name==="reverse:127.0.0.1:45109"&&x.reason==="host-unreachable"))break; await pause(10)}
    const states=tunnelState(); if(!states.some(x=>x.name==="reverse:127.0.0.1:45107"&&x.state==="open")||!states.some(x=>x.name==="reverse:127.0.0.1:45108"&&x.state==="failed"&&x.reason==="auth-refused")||!states.some(x=>x.name==="reverse:127.0.0.1:45109"&&x.state==="failed"&&x.reason==="host-unreachable"))throw Error(JSON.stringify(states));
    await closeTunnels(); await new Promise(r=>open.close(r)); await new Promise(r=>denied.close(r)); console.log("isolated-failure-positive");
  `; try { const result=spawnSync(process.execPath,["--input-type=module","-e",script,folder],{encoding:"utf8",timeout:40000,env:{...process.env,NODE_PATH:runtime()}});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/isolated-failure-positive/)}finally{rmSync(folder,{recursive:true,force:true})}
});

// TST-286008
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-044
// given: a real authenticated ssh2 host that accepts a reverse request and then closes each connection
// input: openTunnels followed by closeTunnels while reconnect supervision is active
// expect: reconnect delays grow, and closing cancels the next timer and closes the client connection
test("TST-286008: reconnect delays grow and close cancels the next reconnect", () => {
  const folder=dataFolder(); const script=`
    import {createRequire} from "node:module"; const require=createRequire(import.meta.url); const {Server,utils}=require("ssh2"); const {openTunnels,closeTunnels}=await import(${JSON.stringify(source)}); const pause=ms=>new Promise(r=>setTimeout(r,ms)); const attempts=[];
    const ssh=new Server({hostKeys:[utils.generateKeyPairSync("ed25519").private]},c=>{attempts.push(Date.now());c.on("error",()=>{});c.on("authentication",x=>x.accept());c.on("request",(a,r,n)=>{if(n!=="tcpip-forward")return r();a();setTimeout(()=>c.end(),5)})}); await new Promise((ok,no)=>ssh.listen(0,"127.0.0.1",e=>e?no(e):ok())); const sshPort=ssh.address().port;
    await openTunnels(process.argv[1],[{direction:"reverse",jumpHost:"127.0.0.1",user:"fixture",sshPort,remotePort:45208,bind:"127.0.0.1",bridgePort:1}],1); for(let i=0;i<70&&attempts.length<3;i++)await pause(10); if(attempts.length<3)throw Error("attempts="+attempts.length); const gaps=[attempts[1]-attempts[0],attempts[2]-attempts[1]]; if(gaps[0]<70||gaps[1]<170)throw Error("gaps="+gaps);
    await closeTunnels(); const stopped=attempts.length; await pause(350); if(attempts.length!==stopped)throw Error("reconnect-after-close="+attempts.length); await new Promise(r=>ssh.close(r)); console.log("reconnect-close-positive",gaps.join(","));
  `; try { const result=spawnSync(process.execPath,["--input-type=module","-e",script,folder],{encoding:"utf8",timeout:40000,env:{...process.env,NODE_PATH:runtime()}});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/reconnect-close-positive/)}finally{rmSync(folder,{recursive:true,force:true})}
});

// TST-286009
// level: unit
// module: MOD-tunnels
// guards: THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-011
// given: a real authenticated ssh2 host that refuses each forward tcpip channel
// input: a client writes through the public forward listener, then closeTunnels is called
// expect: the refused client closes and the listener refuses a later client after close
test("TST-286009: refused forward channels leave no listener for a later client after close", () => {
  const folder=dataFolder(); const script=`
    import {createRequire} from "node:module"; import net from "node:net"; const require=createRequire(import.meta.url); const {Server,utils}=require("ssh2"); const {openTunnels,closeTunnels,tunnelState}=await import(${JSON.stringify(source)}); const listen=s=>new Promise((ok,no)=>s.listen(0,"127.0.0.1",e=>e?no(e):ok(s.address().port))); const pause=ms=>new Promise(r=>setTimeout(r,ms));
    let refusals=0; const ssh=new Server({hostKeys:[utils.generateKeyPairSync("ed25519").private]},c=>{c.on("error",()=>{});c.on("authentication",x=>x.accept());c.on("tcpip",(_a,r)=>{refusals++;r()})}); const sshPort=await listen(ssh); const reservation=net.createServer(); const localPort=await listen(reservation); await new Promise(r=>reservation.close(r));
    await openTunnels(process.argv[1],[{direction:"forward",jumpHost:"127.0.0.1",user:"fixture",sshPort,remotePort:localPort,bind:"127.0.0.1",bridgePort:1}],1); for(let i=0;i<50&&tunnelState()[0]?.state!=="open";i++)await pause(10); if(tunnelState()[0]?.state!=="open")throw Error(JSON.stringify(tunnelState()));
    const refused=await new Promise((ok,no)=>{const s=net.connect(localPort,"127.0.0.1");let done=false;const finish=v=>{if(!done){done=true;ok(v)}};s.once("error",e=>finish(e.code));s.once("close",()=>finish("closed"));s.write("refused");setTimeout(()=>no(Error("refused client stayed open")),500)}); if(!refusals||!refused)throw Error(JSON.stringify({refusals,refused}));
    await closeTunnels(); const after=await new Promise(ok=>{const s=net.connect(localPort,"127.0.0.1");s.once("error",e=>ok(e.code));s.once("connect",()=>ok("connected"))}); await new Promise(r=>ssh.close(r)); if(after!=="ECONNREFUSED")throw Error("listener="+after); console.log("refused-forward-close-positive");
  `; try { const result=spawnSync(process.execPath,["--input-type=module","-e",script,folder],{encoding:"utf8",timeout:40000,env:{...process.env,NODE_PATH:runtime()}});assert.equal(result.status,0,result.stderr);assert.match(result.stdout,/refused-forward-close-positive/)}finally{rmSync(folder,{recursive:true,force:true})}
});
