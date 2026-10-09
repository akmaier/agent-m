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
