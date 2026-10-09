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
const ssh2Cache = "/private/tmp/agent-m-286-ssh2-1.17.0";

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
