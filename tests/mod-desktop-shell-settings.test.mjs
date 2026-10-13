// Module: MOD-desktop-shell
// Guards: UC-003; UC-044; THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; THE BRIDGE OPENS ITS TUNNELS ITSELF; THE BRIDGE CREATES ITS OWN SSH KEY
// Level: unit

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import Module from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportSettings } from "../src/browser-store/index.mjs";
import { loadSettings, saveSettings, takeExport } from "../src/desktop-shell/settings.mjs";

const jumpHost = { hostname: "jump.example.test", user: "bridge", sshPort: 2222, portRange: [40100, 40199], login: { user: "web", password: "must-not-persist" } };
const bridge = { port: 4111, token: "paired-token" };
const folder = () => mkdtempSync(join(tmpdir(), "agent-m-291-settings-"));
const settingsFile = (dataFolder) => join(dataFolder, "settings.json");
const ssh2Cache = join(tmpdir(), "agent-m-291-desktop-settings-ssh2-1.17.0");
let sshRuntimeFailure;

function plainExport(settings, instance = "example/agent-m") {
  return JSON.stringify({ "agent-m-settings": 1, instance, exported: "2026-10-13T00:00:00.000Z", locked: false, foreign: {}, settings });
}

function sshRuntime() {
  if (sshRuntimeFailure) throw sshRuntimeFailure;
  try {
    if (!existsSync(join(ssh2Cache, "node_modules", "ssh2", "package.json"))) {
      const installed = spawnSync("npm", ["install", "--no-save", "--prefix", ssh2Cache, "ssh2@1.17.0"], { encoding: "utf8", timeout: 40_000 });
      assert.equal(installed.status, 0, `ssh2 staging failed: ${installed.stderr}`);
    }
    const nodePath = join(ssh2Cache, "node_modules");
    const positive = spawnSync(process.execPath, ["-e", "const ssh2=require('ssh2');if(require('ssh2/package.json').version!=='1.17.0'||typeof ssh2.utils.generateKeyPairSync!=='function')throw Error('ssh2 known positive');console.log('ssh2-known-positive')"], { encoding: "utf8", timeout: 40_000, env: { ...process.env, NODE_PATH: nodePath } });
    assert.equal(positive.status, 0, `ssh2 known positive failed: ${positive.stderr}`);
    assert.match(positive.stdout, /ssh2-known-positive/);
    return nodePath;
  } catch (failure) { sshRuntimeFailure = failure; throw failure; }
}

async function composeForTest() {
  process.env.NODE_PATH = sshRuntime();
  Module._initPaths();
  return import("../src/desktop-shell/compose.mjs");
}

// TST-291001 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
// given: a fresh controlled Bridge data folder and bounded manual settings with browser-only secrets beside them
// input: saveSettings then loadSettings through the public desktop settings interface
// expect: only the canonical private settings fields persist and restart reads those same bytes
// Planted fault: persisting jump-host login or an endpoint key makes the key-set and jump-host assertions fail.
test("TST-291001: MOD-desktop-shell saves bounded private settings", () => {
  const dataFolder = folder();
  try {
    const settings = saveSettings(dataFolder, {
      name: "lab", port: 4711, agents: [{ name: "codex", folder: "/tmp/codex" }], products: ["https://github.com/example/product"], every: 120,
      paused: true, jumpHost,
      tunnels: [{ direction: "reverse", jumpHost: jumpHost.hostname, user: jumpHost.user, sshPort: jumpHost.sshPort, remotePort: 4111, bind: "127.0.0.1", bridgePort: 4711, keyFile: "foreign-key", password: "must-not-persist" }],
      repositoryToken: "must-not-persist", endpoint: "must-not-persist", mailbox: "must-not-persist", signIn: "must-not-persist",
    });
    const disk = JSON.parse(readFileSync(settingsFile(dataFolder), "utf8"));
    assert.deepEqual(settings, disk, "failure node: settings writer returns exactly the persisted private contract");
    assert.deepEqual(Object.keys(disk).sort(), ["agent-m-bridge-settings", "agents", "every", "jumpHost", "name", "paused", "port", "products", "tunnels"], "failure node: persisted settings exclude browser and mail secrets");
    assert.deepEqual(disk.jumpHost, { hostname: jumpHost.hostname, user: jumpHost.user, sshPort: jumpHost.sshPort }, "failure node: only the Bridge jump-host fields persist");
    assert.equal(disk.tunnels[0].keyFile, join(dataFolder, "ssh", "id_ed25519"));
    assert.deepEqual(loadSettings(dataFolder), disk, "failure node: restart reads the canonical persisted settings");
  } finally { rmSync(dataFolder, { recursive: true, force: true }); }
});

// TST-291002 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE OPENS ITS TUNNELS ITSELF
// given: a matching plain canonical export with one named bridge through the jump host and browser-only secrets
// input: takeExport selects that named Bridge for this desktop Bridge
// expect: the reverse plan keeps remote port 4111 and loopback bridge port 4711 while secrets stay out of settings
// Planted fault: reading remote-session instead of bridge:<name> makes this import report MissingTunnelSettings.
test("TST-291002: MOD-desktop-shell imports a named Bridge-through-jump-host entry as one reverse plan", async () => {
  const dataFolder = folder();
  try {
    saveSettings(dataFolder, { name: "manual", port: 5511, products: [], every: 123, paused: true, jumpHost: null, tunnels: [] });
    const text = plainExport({
      products: ["https://github.com/example/product"], "jump-host": jumpHost, "bridge:lab": bridge, "bridge:direct": { address: "http://127.0.0.1:4711", token: "direct-token" },
      "github-token": { token: "must-not-persist" }, "endpoint:openai": { key: "must-not-persist" }, "mailbox": { imap: { password: "must-not-persist" } },
    });
    const taken = await takeExport(dataFolder, { instance: "example/agent-m", ownComputer: false, bridge: "lab" }, text);
    assert.deepEqual(taken.products, ["https://github.com/example/product"]);
    assert.equal(taken.name, "lab");
    assert.equal(taken.port, 5511, "failure node: import preserves the existing local Bridge API port");
    assert.equal(taken.paused, true, "failure node: import preserves the current explicit pause state");
    assert.equal(taken.pairingToken, "paired-token");
    assert.deepEqual(taken.tunnels, [{ direction: "reverse", jumpHost: jumpHost.hostname, user: jumpHost.user, sshPort: jumpHost.sshPort, remotePort: 4111, bind: "127.0.0.1", bridgePort: 5511, keyFile: join(dataFolder, "ssh", "id_ed25519") }], "failure node: named Bridge choice takes its reverse plan only");
    assert.deepEqual(Object.keys(JSON.parse(readFileSync(settingsFile(dataFolder), "utf8"))).sort(), ["agent-m-bridge-settings", "agents", "every", "jumpHost", "name", "paused", "port", "products", "tunnels"], "failure node: import persists only the Bridge contract");
  } finally { rmSync(dataFolder, { recursive: true, force: true }); }
});

// TST-291003 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
// given: existing persisted Bridge settings and a complete export for a different instance
// input: takeExport reads the foreign export for this instance
// expect: WrongInstance is named before the persisted settings change
// Planted fault: moving the write before the instance check changes the settings bytes and fails this case.
test("TST-291003: MOD-desktop-shell refuses a foreign instance before writing", async () => {
  const dataFolder = folder();
  try {
    saveSettings(dataFolder, { name: "before", port: 4711, products: [], every: 300, paused: false, jumpHost: null, tunnels: [] });
    const before = readFileSync(settingsFile(dataFolder));
    await assert.rejects(takeExport(dataFolder, { instance: "example/agent-m", ownComputer: true }, plainExport({}, "other/instance")), { name: "WrongInstance" });
    assert.deepEqual(readFileSync(settingsFile(dataFolder)), before, "failure node: rejected foreign export leaves persisted settings byte-identical");
  } finally { rmSync(dataFolder, { recursive: true, force: true }); }
});

// TST-291004 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
// given: a locked matching canonical export with one Bridge through the jump host and a passphrase held only in memory
// input: takeExport selects the person's own computer, then reads the same export with a wrong passphrase
// expect: the own-computer choice takes its forward plan only and the wrong passphrase names WrongPassphrase
// Planted fault: retaining the export's token for own-computer mode makes the pairing-token assertion fail.
test("TST-291004: MOD-desktop-shell reads a locked own-computer export as one forward plan", async () => {
  const dataFolder = folder();
  try {
    const encrypted = await exportSettings({
      prefix: "agent-m:example/agent-m:", storage: new MapStorage({ products: ["https://github.com/example/product"], "jump-host": jumpHost, "bridge:lab": bridge }),
    }, "correct passphrase");
    const taken = await takeExport(dataFolder, { instance: "example/agent-m", ownComputer: true, passphrase: "correct passphrase" }, encrypted);
    assert.equal(taken.pairingToken, null, "failure node: own-computer import does not rotate pairing to a remote Bridge token");
    assert.deepEqual(taken.tunnels, [{ direction: "forward", jumpHost: jumpHost.hostname, user: jumpHost.user, sshPort: jumpHost.sshPort, remotePort: 4111, bind: "127.0.0.1", bridgePort: 4711, keyFile: join(dataFolder, "ssh", "id_ed25519") }], "failure node: own-computer choice takes each Bridge-through-jump-host forward plan only");
    await assert.rejects(takeExport(dataFolder, { instance: "example/agent-m", ownComputer: true, passphrase: "wrong passphrase" }, encrypted), { name: "WrongPassphrase" });
  } finally { rmSync(dataFolder, { recursive: true, force: true }); }
});

// TST-291005 · level: unit · module: MOD-desktop-shell
// guards: UC-003; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY; THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
// given: a fresh controlled Bridge folder, a real pinned ssh2 runtime, and the production composition entry
// input: compose requests its established ephemeral listener port 0, then persisted settings are asked to save port 0
// expect: compose listens on an assigned loopback port while persisted settings still reject port 0 as invalid
// Planted fault: passing port 0 into persisted settings makes the final InvalidSettings assertion fail.
test("TST-291005: MOD-desktop-shell keeps ephemeral compose port separate from persisted settings", async () => {
  const dataFolder = folder();
  try {
    const { compose } = await composeForTest();
    const bridge = await compose({ instance: "example/agent-m", origin: "https://example.github.io", dataFolder, port: 0 });
    try {
      assert.match(bridge.address, /^http:\/\/127\.0\.0\.1:(?!4711$)\d+$/, "failure node: composition gives port 0 only to the loopback listener");
      assert.equal(bridge.settings.port, 4711, "composition retains the validated persisted default");
      assert.throws(() => saveSettings(dataFolder, { ...bridge.settings, port: 0 }), { name: "InvalidSettings" }, "persisted port 0 remains invalid");
    } finally { await bridge.close(); }
  } finally { rmSync(dataFolder, { recursive: true, force: true }); }
});

class MapStorage {
  #entries;
  constructor(values) { this.#entries = Object.entries(values).map(([key, value]) => [`agent-m:example/agent-m:${key}`, JSON.stringify(value)]); }
  get length() { return this.#entries.length; }
  key(index) { return this.#entries[index]?.[0] ?? null; }
  getItem(key) { return this.#entries.find(([stored]) => stored === key)?.[1] ?? null; }
}
