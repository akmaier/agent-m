// Independent release coverage for ITM-291's delivered desktop consumer.
// Module: MOD-desktop-shell
// Level: release
// Guards: UC-003; UC-044; THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT;
//         THE BRIDGE OPENS ITS TUNNELS ITSELF; THE BRIDGE CREATES ITS OWN SSH KEY

import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import Module from "node:module";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

const ssh2Cache = join(tmpdir(), "agent-m-291-release-ssh2-1.17.0");
const ssh2Package = join(ssh2Cache, "node_modules", "ssh2", "package.json");
if (!existsSync(ssh2Package)) {
  const installed = spawnSync("npm", ["install", "--no-save", "--prefix", ssh2Cache, "ssh2@1.17.0"], { encoding: "utf8", timeout: 40_000 });
  assert.equal(installed.status, 0, `ssh2 staging failed: ${installed.stderr}`);
}
const nodePath = join(ssh2Cache, "node_modules");
const positive = spawnSync(process.execPath, ["-e", "const ssh2=require('ssh2');if(require('ssh2/package.json').version!=='1.17.0'||typeof ssh2.utils.generateKeyPairSync!=='function')throw Error('ssh2 known positive');console.log('ssh2-known-positive')"], { encoding: "utf8", timeout: 40_000, env: { ...process.env, NODE_PATH: nodePath } });
assert.equal(positive.status, 0, `ssh2 known positive failed: ${positive.stderr}`);
assert.match(positive.stdout, /ssh2-known-positive/);
process.env.NODE_PATH = nodePath;
Module._initPaths();
const require = createRequire(import.meta.url);
const { Server, utils } = require("ssh2");

const sourceRoot = process.env.AGENT_M_291_SOURCE_ROOT ?? new URL("../src/", import.meta.url).pathname;
const source = (path) => pathToFileURL(join(sourceRoot, path)).href;
const { compose } = await import(source("desktop-shell/compose.mjs"));
const { loadSettings, saveSettings, takeExport } = await import(source("desktop-shell/settings.mjs"));
const { exportSettings } = await import(source("browser-store/index.mjs"));

const folder = () => mkdtempSync(join(tmpdir(), "agent-m-release-291-"));
const jumpHost = { hostname: "jump.release.test", user: "bridge", sshPort: 2222 };
const listen = (server) => new Promise((resolve, reject) => server.listen(0, "127.0.0.1", (error) => error ? reject(error) : resolve(server.address().port)));
const closedPort = async () => { const reservation = createServer(); const port = await listen(reservation); await new Promise((resolve) => reservation.close(resolve)); return port; };
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
class Storage {
  constructor(values) { this.entries = Object.entries(values).map(([key, value]) => [`agent-m:release-owner/agent-m:${key}`, JSON.stringify(value)]); }
  get length() { return this.entries.length; }
  key(index) { return this.entries[index]?.[0] ?? null; }
  getItem(key) { return this.entries.find(([stored]) => stored === key)?.[1] ?? null; }
}

// TST-291901
// level: release
// module: MOD-desktop-shell
// guards: UC-003; UC-044; THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; THE BRIDGE OPENS ITS TUNNELS ITSELF; THE BRIDGE CREATES ITS OWN SSH KEY
// given: the production desktop compose/settings public interfaces, a fresh controlled private folder, and a locked matching-instance dashboard export
// input: persist manual settings, import the selected remote session, then restart the real loopback composition from those bytes
// expect: the retained private contract excludes browser credentials, preserves the local port and pause state, selects one own-key reverse plan, and the composed server is reachable only on loopback
// Planted fault: changing takeExport's selected direction from reverse to forward makes this same case's exact plan assertion fail; byte-exact restoration makes it pass.
test("TST-291901: public desktop import preserves bounded private state into the real composed loopback bridge", async () => {
  const dataFolder = folder();
  let ssh, remote;
  try {
    saveSettings(dataFolder, { name: "manual", port: 5511, products: [], every: 120, paused: true, jumpHost: null, tunnels: [], endpoint: "must-not-persist", repositoryToken: "must-not-persist" });
    const sshPort = await closedPort(), remotePort = await closedPort();
    ssh = new Server({ hostKeys: [utils.generateKeyPairSync("rsa", { bits: 2048 }).private] }, (client) => {
      client.on("error", () => {});
      client.on("authentication", (context) => context.accept());
      client.on("request", async (accept, reject, name, info) => {
        if (name !== "tcpip-forward") return reject();
        remote = createServer((socket) => client.forwardOut(info.bindAddr, info.bindPort, socket.remoteAddress, socket.remotePort, (error, stream) => error ? socket.destroy(error) : socket.pipe(stream).pipe(socket)));
        try { await new Promise((resolve, rejectListen) => remote.listen(info.bindPort, info.bindAddr, (error) => error ? rejectListen(error) : resolve())); accept(); }
        catch { reject(); }
      });
    });
    await new Promise((resolve, reject) => ssh.listen(sshPort, "127.0.0.1", (error) => error ? reject(error) : resolve()));
    const selectedHost = { hostname: "127.0.0.1", user: jumpHost.user, sshPort };
    const session = { name: "remote", port: remotePort, token: "paired-release-token" };
    const exportText = await exportSettings({ prefix: "agent-m:release-owner/agent-m:", storage: new Storage({ products: ["https://github.com/release/product"], "jump-host": selectedHost, "remote-session:remote": session, "endpoint:release": { url: "https://models.example.test/v1", kind: "openai-compatible", model: "release", key: "must-not-persist", throughBridge: false }, "github-token": { value: "must-not-persist", name: "Agent M", expires: "2027-01-03", stored: "2026-10-09" } }) }, "release passphrase");
    const taken = await takeExport(dataFolder, { instance: "release-owner/agent-m", ownComputer: false, session: "remote", passphrase: "release passphrase" }, exportText);
    const persisted = JSON.parse(readFileSync(join(dataFolder, "settings.json"), "utf8"));
    assert.deepEqual(Object.keys(persisted).sort(), ["agent-m-bridge-settings", "every", "jumpHost", "name", "paused", "port", "products", "tunnels"], "failure node: public import persists only the Bridge-owned private contract");
    assert.equal(taken.port, 5511, "failure node: import retains the local listener port");
    assert.equal(taken.paused, true, "failure node: import retains the explicit pause state");
    assert.deepEqual(taken.tunnels, [{ direction: "reverse", jumpHost: selectedHost.hostname, user: selectedHost.user, sshPort, remotePort, bind: "127.0.0.1", bridgePort: 5511, keyFile: join(dataFolder, "ssh", "id_ed25519") }], "failure node: named remote import uses its one reverse plan and this Bridge key");
    assert.equal(JSON.stringify(persisted).includes("must-not-persist"), false, "browser credentials never cross the desktop private-settings boundary");
    assert.deepEqual(loadSettings(dataFolder), persisted, "restart reads the same canonical bytes");
    const bridge = await compose({ instance: "release-owner/agent-m", origin: "https://release-owner.github.io", dataFolder, port: 0, paused: () => true });
    try {
      assert.match(bridge.address, /^http:\/\/127\.0\.0\.1:\d+$/, "failure node: production composition remains loopback-only");
      assert.equal(bridge.settings.port, 5511, "real composition receives the imported persisted local port");
      assert.match(bridge.key.publicKey, /^ssh-ed25519 /, "production composition creates the Bridge's own key");
      for (let attempt = 0; attempt < 80 && (await bridge.tunnels())[0]?.state !== "open"; attempt += 1) await pause(10);
      assert.deepEqual(await bridge.tunnels(), [{ name: `reverse:127.0.0.1:${remotePort}`, kind: "reverse", state: "open", reason: null }], "failure node: imported state reaches the production authenticated tunnel runtime");
    } finally { await bridge.close(); }
    if (!process.env.AGENT_M_291_FAULT_CHILD && process.platform === "linux" && process.env.GITHUB_ACTIONS === "true") {
      const temporary = mkdtempSync(join(tmpdir(), "agent-m-291-fault-")), copied = join(temporary, "src"), settings = join(copied, "desktop-shell", "settings.mjs");
      cpSync(sourceRoot, copied, { recursive: true });
      const original = readFileSync(settings);
      const originalHash = createHash("sha256").update(original).digest("hex"), testPath = new URL(import.meta.url).pathname;
      const mutation = Buffer.from(original.toString().replace('choice.ownComputer ? "forward" : "reverse"', '"forward"'));
      assert.notDeepEqual(mutation, original, "fault text exists in the production import selector");
      const childArgv = [process.execPath, "--test", "--test-name-pattern", "TST-291901", testPath];
      const childEnvironment = { AGENT_M_291_SOURCE_ROOT: copied, AGENT_M_291_FAULT_CHILD: "1" };
      const childEnv = { ...process.env, ...childEnvironment };
      delete childEnv.NODE_TEST_CONTEXT;
      const invoke = () => spawnSync(childArgv[0], childArgv.slice(1), { cwd: process.cwd(), encoding: "utf8", timeout: 40_000, env: childEnv });
      try {
        const faultStarted = new Date().toISOString(); writeFileSync(settings, mutation); const faultSourceHash = createHash("sha256").update(readFileSync(settings)).digest("hex"), failed = invoke(); const faultEnded = new Date().toISOString();
        const restoredStarted = new Date().toISOString(); writeFileSync(settings, original); const restoredSourceHash = createHash("sha256").update(readFileSync(settings)).digest("hex"), passed = invoke(); const restoredEnded = new Date().toISOString();
        const testHash = createHash("sha256").update(readFileSync(new URL(import.meta.url))).digest("hex");
        const receipt = { case: "TST-291901", cwd: process.cwd(), childArgv, childEnvironment: { ...childEnvironment, NODE_TEST_CONTEXT: null }, originalHash, faultSourceHash, restoredSourceHash, testHash, fault: 'choice.ownComputer ? "forward" : "reverse" -> "forward"', faultStarted, faultEnded, faultStatus: failed.status, faultSignal: failed.signal, faultError: failed.error?.code ?? null, faultStdout: failed.stdout, faultStderr: failed.stderr, restoredStarted, restoredEnded, restoredStatus: passed.status, restoredSignal: passed.signal, restoredError: passed.error?.code ?? null, restoredStdout: passed.stdout, restoredStderr: passed.stderr };
        process.stdout.write(`TST-291901-counterproof ${JSON.stringify(receipt)}\n`);
        assert.equal(restoredSourceHash, originalHash, "byte-exact source restoration precedes the same-case positive");
        assert.notEqual(failed.status, 0, "faulted same case fails"); assert.equal(failed.signal, null, "fault receipt is not a timed-out child"); assert.equal(failed.error, undefined, "fault receipt has no launcher error"); assert.match(`${failed.stdout}\n${failed.stderr}`, /failure node: named remote import uses its one reverse plan/, "fault reaches the guarded reverse-plan assertion");
        assert.equal(passed.status, 0, "byte-restored same case passes"); assert.equal(passed.signal, null, "restored receipt is not a timed-out child"); assert.equal(passed.error, undefined, "restored receipt has no launcher error");
      } finally { writeFileSync(settings, original); rmSync(temporary, { recursive: true, force: true }); }
    }
  } finally { if (remote) await new Promise((resolve) => remote.close(resolve)); if (ssh) await new Promise((resolve) => ssh.close(resolve)); rmSync(dataFolder, { recursive: true, force: true }); }
});
