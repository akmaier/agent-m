// Module: MOD-desktop-shell
// Guards: UC-044; THE BRIDGE RUNS AS AN APP; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
// Level: unit
//
// The app reads the resources the build places beside it, `build.json` and `update-key.pem`, at start
// (MOD-desktop-shell, "What the build places among the app's resources"). These cases start the app's real entry,
// src/desktop-shell/main.mjs, over a constructed Electron: a small object that records what the entry asks of it and opens
// no window. The Bridge's server is the real one, on loopback, and is asked over HTTP. No other service is contacted.
// The resources folder is the folder Electron names as `process.resourcesPath`; a case puts a fixture folder there.

import assert from "node:assert/strict";
import test from "node:test";
import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { registerHooks } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unusedPorts } from "./desktop-shell.d/ports.mjs";
import { saveSettings } from "../src/desktop-shell/settings.mjs";

// `import electron from "electron"` of the entry resolves to the constructed Electron of the running case. The two modules the shell
// composes that need packages of the Bridge build — MOD-tunnels (ssh2) and MOD-mail-protocols (imapflow, nodemailer) — are replaced by
// doubles with the same exports: these cases read what the entry does with its resources, and open no tunnel and touch no mailbox.
const ELECTRON = "export default new Proxy({}, { get: (_, name) => globalThis.__agentMBuildResourcesElectron?.[name] });";
const DOUBLES = {
  "/src/tunnels/index.mjs": `export const ensureKey = async () => ({ publicKey: "ssh-ed25519 AAAA double", fingerprint: "SHA256:double" });
    export const openTunnels = async () => {}; export const closeTunnels = async () => {}; export const tunnelState = () => [];
    export const tunnelHandlers = { "GET /v1/tunnels": async () => ({ tunnels: [] }) };`,
  "/src/mail-protocols/index.mjs": "export const mailHandlers = () => ({});",
};
const moduleUrl = (source) => `data:text/javascript,${encodeURIComponent(source)}`;
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "electron") return { url: moduleUrl(ELECTRON), shortCircuit: true };
    const resolved = next(specifier, context);
    const double = Object.entries(DOUBLES).find(([tail]) => resolved.url.endsWith(tail));
    return double ? { url: moduleUrl(double[1]), shortCircuit: true } : resolved;
  },
});

const TOKEN_HEADER = "x-agent-m-bridge-token";
const BUILD = { instance: "alice/agent-m", appId: "io.github.alice.agent-m.bridge", origin: "https://alice.github.io", version: "2026.10.0", commit: "0123456789abcdef0123456789abcdef01234567" };
const publicKeyPem = () => generateKeyPairSync("ed25519").publicKey.export({ type: "spki", format: "pem" });
const temporary = () => mkdtempSync(join(tmpdir(), "agent-m-1005-"));

// A resources folder as the build lays it out. `build` is the text of build.json; null leaves the file out.
const resourcesFolder = ({ build = JSON.stringify(BUILD), key } = {}) => {
  const folder = temporary();
  if (build !== null) writeFileSync(join(folder, "build.json"), build);
  if (key !== undefined) writeFileSync(join(folder, "update-key.pem"), key);
  return folder;
};

function constructedElectron(appData) {
  const exits = [];
  const handlers = {};
  const record = { windows: [], loadedUrl: null, quits: 0, exits, appEvents: {} };
  let settle;
  const outcome = new Promise((resolve) => { settle = resolve; });
  record.outcome = outcome;
  class BrowserWindow {
    constructor() { this.webContents = { setWindowOpenHandler() {}, on() {} }; record.windows.push(this); }
    on() {}
    isMinimized() { return false; }
    show() {} focus() {} restore() {} hide() {}
    async loadURL(url) { record.loadedUrl = url; settle({ kind: "loaded", url }); }
  }
  Object.assign(record, {
    app: {
      requestSingleInstanceLock: () => true,
      whenReady: async () => {},
      getPath: (name) => { assert.equal(name, "appData"); return appData; },
      on: (name, handler) => { record.appEvents[name] = handler; },
      quit: () => { record.quits += 1; settle({ kind: "quit" }); },
      exit: () => { exits.push(true); record.exited?.(); },
    },
    protocol: { registerSchemesAsPrivileged() {}, handle() {} },
    ipcMain: { handle: (name, handler) => { handlers[name] = handler; } },
    shell: { openExternal() {} },
    BrowserWindow,
  });
  record.exited = null;
  record.whenExited = new Promise((resolve) => { record.exited = resolve; });
  return record;
}

let counter = 0;
// Starts the entry as Electron would: with these command-line arguments and this resources folder. Resolves with what the
// entry did — it loaded its window, or it asked to quit — together with what it printed as an error.
async function startEntry({ resources, argv = [], appData }) {
  const fake = constructedElectron(appData);
  const errors = [];
  const saved = { argv: process.argv, resourcesPath: process.resourcesPath, error: console.error };
  globalThis.__agentMBuildResourcesElectron = fake;
  process.argv = [process.argv[0], "src/desktop-shell/main.mjs", ...argv];
  process.resourcesPath = resources;
  console.error = (...parts) => { errors.push(parts.join(" ")); };
  try {
    counter += 1;
    await import(`../src/desktop-shell/main.mjs?case=${counter}`);
    const outcome = await Promise.race([fake.outcome, new Promise((_, reject) => setTimeout(() => reject(new Error("The entry neither loaded its window nor asked to quit.")), 5000))]);
    return { fake, outcome, errors };
  } finally {
    process.argv = saved.argv; process.resourcesPath = saved.resourcesPath; console.error = saved.error;
  }
}

async function stopEntry(started) {
  if (started.outcome.kind !== "loaded") return;
  started.fake.appEvents["before-quit"]({ preventDefault() {} });
  await started.fake.whenExited;
}

const bridgeAsks = (port, origin, token) => fetch(`http://127.0.0.1:${port}/v1/pair`, { headers: { origin, ...(token ? { [TOKEN_HEADER]: token } : {}) } });
const refused = async (port) => { try { await fetch(`http://127.0.0.1:${port}/v1/pair`); return false; } catch { return true; } };
const bridgeSettings = (port) => ({ name: "lab", port, agents: [], products: [], every: 300, paused: true, jumpHost: null, tunnels: [] });

// TST-1005001 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE RUNS AS AN APP
// given: a resources folder holding build.json of instance alice/agent-m with origin https://alice.github.io, and a per-user data place whose settings file names a free port; the entry started with no command-line argument
// input: the entry's start, then two requests to the Bridge's pairing route, one from the origin of build.json and one from another origin
// expect: the window of the instance's Pages location is loaded; the request from build.json's origin is answered 200 and names that origin; the one from another origin is refused 403; the data folder is named after the app's identifier and holds the pairing token
// Planted fault: taking the origin from the command line (absent here) or from a fixed value makes the first request refused, and the first assertion on the answer fails.
test("TST-1005001: MOD-desktop-shell serves the Bridge for the origin of build.json when started without arguments", async () => {
  const appData = temporary(), resources = resourcesFolder();
  const [port] = await unusedPorts(1);
  const folder = join(appData, BUILD.appId);
  saveSettings(folder, bridgeSettings(port));
  const started = await startEntry({ resources, appData });
  try {
    assert.equal(started.outcome.kind, "loaded", `the entry started (errors: ${started.errors.join(" | ")})`);
    assert.equal(started.outcome.url, "agent-m://alice.github.io/agent-m/desktop-shell/window.html", "the window of the instance's Pages location");
    const token = readFileSync(join(folder, "pairing-token"), "utf8").trim();
    const own = await bridgeAsks(port, BUILD.origin, token);
    assert.equal(own.status, 200, "failure node: the Bridge answers the origin of build.json");
    assert.equal((await own.json()).origin, BUILD.origin);
    assert.equal((await bridgeAsks(port, "https://other.github.io", token)).status, 403, "any other origin is refused");
  } finally { await stopEntry(started); rmSync(appData, { recursive: true, force: true }); rmSync(resources, { recursive: true, force: true }); }
});

// TST-1005002 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
// given: a resources folder with build.json and an update-key.pem holding an Ed25519 public key in PEM; a second with build.json and no update-key.pem
// input: readBuild of each folder, the function the entry reads its resources with
// expect: the first answer carries the build's instance, appId, origin, version and commit as build.json holds them, and updateKey is the text of update-key.pem byte for byte; the second answer carries the same build fields and updateKey null
// Planted fault: reading the key from another file name, or trimming its text, makes the first updateKey differ from the file.
test("TST-1005002: MOD-desktop-shell reads the build and the update key from the resources folder", async () => {
  const { readBuild } = await import("../src/desktop-shell/build.mjs");
  const pem = publicKeyPem();
  const withKey = resourcesFolder({ key: pem }), withoutKey = resourcesFolder();
  try {
    assert.deepEqual(readBuild(withKey), { ...BUILD, updateKey: pem });
    assert.deepEqual(readBuild(withoutKey), { ...BUILD, updateKey: null });
  } finally { rmSync(withKey, { recursive: true, force: true }); rmSync(withoutKey, { recursive: true, force: true }); }
});

// TST-1005003 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE RUNS AS AN APP
// given: a resources folder without build.json, and a free port in the settings of the per-user data place; the entry started with no command-line argument
// input: the entry's start
// expect: the entry asks to quit and prints an error that names build.json; no window is made; nothing listens on the Bridge's port; the per-user data place holds no data folder
// Planted fault: falling back to an undefined instance, or serving before the file is read, makes a window appear or the port answer, and the assertions on the window and the port fail.
test("TST-1005003: MOD-desktop-shell ends the start with an error naming build.json when the file is missing, and serves nothing", async () => {
  const appData = temporary(), resources = resourcesFolder({ build: null });
  const [port] = await unusedPorts(1);
  const started = await startEntry({ resources, appData });
  try {
    assert.equal(started.outcome.kind, "quit", "failure node: the entry asks to quit");
    assert.match(started.errors.join("\n"), /build\.json/, "the error names the file");
    assert.equal(started.fake.windows.length, 0, "no window is made");
    assert.equal(await refused(port), true, "nothing listens on the Bridge's port");
    assert.deepEqual(readdirSync(appData), [], "no data folder is made");
  } finally { rmSync(appData, { recursive: true, force: true }); rmSync(resources, { recursive: true, force: true }); }
});

// TST-1005004 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE RUNS AS AN APP
// given: three resources folders whose build.json cannot be used — a directory in its place, a text that is not JSON, and a JSON object without the instance and the origin; the entry started with no command-line argument over each
// input: the entry's start, once for each folder
// expect: each time the entry asks to quit and prints an error that names build.json; no window is made and the per-user data place holds no data folder
// Planted fault: accepting a build.json without an origin lets the start go on, and the third folder's window or data folder appears.
test("TST-1005004: MOD-desktop-shell ends the start with an error naming build.json when the file is unreadable or unusable", async () => {
  const unusable = {
    "a directory in its place": (folder) => mkdirSync(join(folder, "build.json")),
    "text that is not JSON": (folder) => writeFileSync(join(folder, "build.json"), "{ not json"),
    "no instance and no origin": (folder) => writeFileSync(join(folder, "build.json"), JSON.stringify({ appId: BUILD.appId, version: BUILD.version, commit: BUILD.commit })),
  };
  for (const [description, make] of Object.entries(unusable)) {
    const appData = temporary(), resources = resourcesFolder({ build: null });
    make(resources);
    const started = await startEntry({ resources, appData });
    try {
      assert.equal(started.outcome.kind, "quit", `${description}: the entry asks to quit`);
      assert.match(started.errors.join("\n"), /build\.json/, `${description}: the error names the file`);
      assert.equal(started.fake.windows.length, 0, `${description}: no window is made`);
      assert.deepEqual(readdirSync(appData), [], `${description}: no data folder is made`);
    } finally { rmSync(appData, { recursive: true, force: true }); rmSync(resources, { recursive: true, force: true }); }
  }
});

// TST-1005005 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
// given: a resources folder without build.json, as when the app is started from the source folder; the entry started with --instance, --origin, --port and --data-folder
// input: the entry's start, then a request to the Bridge's pairing route from the origin of the command line
// expect: the window of the command line's instance is loaded and the request is answered 200 naming the command line's origin, without any build.json
// Planted fault: reading build.json even when the command line names the instance makes this start end with an error, and the first assertion fails. This case holds on main before the change and is named as already green there.
test("TST-1005005: MOD-desktop-shell started from the source folder takes the instance and origin from its command line", async () => {
  const appData = temporary(), resources = resourcesFolder({ build: null }), data = temporary();
  const [port] = await unusedPorts(1);
  saveSettings(data, bridgeSettings(port));
  const started = await startEntry({ resources, appData, argv: ["--instance=carol/product-x", "--origin=https://carol.github.io", `--port=${port}`, `--data-folder=${data}`] });
  try {
    assert.equal(started.outcome.kind, "loaded", `the entry started (errors: ${started.errors.join(" | ")})`);
    assert.equal(started.outcome.url, "agent-m://carol.github.io/product-x/desktop-shell/window.html");
    const answer = await bridgeAsks(port, "https://carol.github.io", readFileSync(join(data, "pairing-token"), "utf8").trim());
    assert.equal(answer.status, 200);
    assert.equal((await answer.json()).origin, "https://carol.github.io");
  } finally { await stopEntry(started); for (const folder of [appData, resources, data]) rmSync(folder, { recursive: true, force: true }); }
});
