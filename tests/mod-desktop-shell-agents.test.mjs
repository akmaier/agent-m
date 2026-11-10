// Module: MOD-desktop-shell
// Guards: UC-011; UC-044; THE BRIDGE FINDS THE INSTALLED AGENTS; THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT; THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; A LOCAL AGENT USES THE PERSON'S OWN LOGIN
// Level: unit
//
// ITM-407: the Bridge window and composition use the existing agent-processes and bridge-jobs interfaces.
// Fixture executables stand in for installed CLIs; no real agent, network service, or native window is started.

import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import Module from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { loadSettings, saveSettings } from "../src/desktop-shell/settings.mjs";
import { openEnclosures } from "./enclosure-fixture.mjs";

function fakeSsh2Module(root) {
  const folder = join(root, "node_modules", "ssh2");
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, "package.json"), JSON.stringify({ name: "ssh2", version: "1.17.0", main: "index.js" }));
  writeFileSync(join(folder, "index.js"), `
    const publicKey = "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFhpeHR1cmUtYnVmZmVyLWZvci1hZ2VudC1tLXRlc3Q=";
    const publicBuffer = Buffer.from(publicKey);
    exports.Client = class { on() { return this; } once() { return this; } connect() {} end() {} };
    exports.utils = {
      generateKeyPairSync() { return { private: "fixture-private-key", public: publicKey }; },
      parseKey() { return { type: "ssh-ed25519", getPublicSSH() { return publicBuffer; } }; }
    };
  `);
  assert.equal(existsSync(join(folder, "index.js")), true, "known positive: local ssh2 fixture is present");
  return join(root, "node_modules");
}

async function desktopComposition(nodePath) {
  process.env.NODE_PATH = nodePath;
  Module._initPaths();
  return import("../src/desktop-shell/compose.mjs");
}

function script(folder, name, body) {
  writeFileSync(join(folder, name), `#!/bin/sh\n${body}\n`, { mode: 0o755 });
}

function computer() {
  const root = mkdtempSync(join(tmpdir(), "agent-m-407-"));
  const bin = join(root, "bin");
  const calls = join(root, "calls");
  mkdirSync(bin);
  writeFileSync(calls, "");
  const log = `printf '%s\\n' "$0 $*" >> ${calls}`;
  script(bin, "claude", `${log}\ncase "$*" in '--version') echo '2.1.300';; 'auth status') echo '{\"authMethod\":\"claude.ai\"}';; *) exit 64;; esac`);
  script(bin, "codex", `${log}\ncase "$*" in '--version') echo 'codex 1.2.3';; 'login status') echo 'Logged in';; *) exit 64;; esac`);
  const folders = { claude: join(root, "work-claude"), codex: join(root, "work-codex") };
  for (const folder of Object.values(folders)) mkdirSync(folder);
  return { root, bin, folders, calls: () => readFileSync(calls, "utf8").trim().split("\n").filter(Boolean) };
}

async function onComputer(machine, work) {
  const prior = process.env.PATH;
  process.env.PATH = machine.bin;
  try {
    return await work();
  } finally {
    process.env.PATH = prior;
    rmSync(machine.root, { recursive: true, force: true });
  }
}

// TST-407001 · level: unit · module: MOD-desktop-shell
// guards: UC-011; UC-044; THE BRIDGE FINDS THE INSTALLED AGENTS; THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
// given: a temporary Bridge data folder whose settings tick only Claude with a working folder, while fixture Claude and Codex executables are installed and OpenCode is missing
// input: MOD-desktop-shell's composition builds the job handlers from the persisted settings and GET /v1/agents is called
// expect: the Bridge offers Claude with its version and readiness; installed but unticked Codex is not offered; missing OpenCode is still listed as missing
// Planted fault: leaving compose.mjs to call jobHandlers without the persisted agents makes the offered list empty.
test("TST-407001: composition offers only selected installed agents with their folders", async () => {
  const machine = computer();
  const { composeJobHandlers } = await desktopComposition(fakeSsh2Module(machine.root));
  await onComputer(machine, async () => {
    const dataFolder = join(machine.root, "data");
    saveSettings(dataFolder, {
      name: "lab-pc",
      port: 4711,
      folder: machine.root,
      agents: [{ name: "claude" }],
      products: [],
      every: 300,
      paused: false,
      jumpHost: null,
      tunnels: [],
    });
    assert.deepEqual(loadSettings(dataFolder).agents.map(({ name, folder }) => ({ name, folder })), [{ name: "claude", folder: join(machine.root, "claude") }],
      "failure node: selected agents are kept in the private settings file, each working in <folder>/<agent>");
    assert.equal(typeof composeJobHandlers, "function", "failure node: composition exposes the job-handler wiring for unit evidence");
    const answer = await composeJobHandlers(loadSettings(dataFolder), openEnclosures())["GET /v1/agents"]({ params: {}, query: {}, body: {} });
    assert.deepEqual(answer, {
      agents: [{ name: "claude", version: "2.1.300", ready: true, loggedIn: true }],
      missing: [{ name: "opencode" }],
    }, "failure node: only the ticked installed agent is offered; the missing supported agent is named");
    assert.equal(machine.calls().some((line) => /codex exec\b/.test(line)), false,
      "failure node: an installed but unticked agent is never given an agent task");
  });
});

class Text {
  constructor(value) { this.value = String(value); this.parentNode = null; }
  get textContent() { return this.value; }
}

class Element extends EventTarget {
  constructor(name) {
    super();
    this.localName = name;
    this.childNodes = [];
    this.attributes = new Map();
    this.className = "";
    this.value = "";
    this.type = "";
    this.checked = false;
    this.disabled = false;
    this.parentNode = null;
  }
  append(...nodes) {
    for (const node of nodes.flat()) {
      const child = typeof node === "string" ? new Text(node) : node;
      this.childNodes.push(child);
      child.parentNode = this;
    }
  }
  replaceChildren(...nodes) {
    this.childNodes = [];
    this.append(...nodes);
  }
  remove() {
    if (this.parentNode) this.parentNode.childNodes.splice(this.parentNode.childNodes.indexOf(this), 1);
  }
  get textContent() {
    return this.childNodes.map((child) => child.textContent).join("");
  }
  set textContent(value) {
    this.replaceChildren(String(value));
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }
  getElementsByTagName(name) {
    return descendants(this, (node) => node.localName === name);
  }
}

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}

function descendants(root, predicate) {
  const found = [];
  const visit = (node) => {
    for (const child of node.childNodes ?? []) {
      if (child instanceof Element) {
        if (predicate(child)) found.push(child);
        visit(child);
      }
    }
  };
  visit(root);
  return found;
}

const buttons = (root, label) => descendants(root, (node) => node.localName === "button" && node.textContent === label);
const click = async (root, label, index = 0) => {
  const control = buttons(root, label)[index];
  assert.ok(control, `${label} is visible`);
  control.dispatchEvent(new Event("click"));
  await new Promise((resolve) => setImmediate(resolve));
};

// TST-407002 · level: unit · module: MOD-desktop-shell
// guards: UC-044; THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT; A LOCAL AGENT USES THE PERSON'S OWN LOGIN; THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
// given: the production Bridge window entry with two installed agents, one of them kept with its working folder in the one folder /tmp/old, one missing supported
//   agent, a constructed folder-dialog result, and a checkout that answers one repository checked out and one not reached
// input: the Agents view is rendered, the one folder is chosen, and agents are saved
// expect: the ticked agent is saved with its declaration and without a folder of its own, beside the chosen folder; the unticked installed agent is not offered;
//   the missing agent shows an install link; after the save the checkout's result shows the commit of the repository checked out and the other with git's
//   reason; counter-proof: the view offers no Test access and no field of an agent's own working folder
// Planted fault: omitting the Agents route leaves no Save agents control and this case fails before any save.
// A kept agent's declaration: the place, the capabilities ticked and each model with its context.
const DECLARED = { place: "this machine", capabilities: ["draft text"], models: [{ model: "claude-opus-5-5", context: 200000 }] };
test("TST-407002: window Agents view keeps the one folder and shows missing installation and the checkout's result", async () => {
  const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
  document.head = document.createElement("head");
  document.body = document.createElement("body");
  globalThis.document = document;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget();
  const location = { hash: "#agents" };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  let saved = null;
  const chosen = "/tmp/agent-m-407-chosen";
  browser.bridge = {
    async state(action, value) {
      if (action === "agents") return {
        platform: "linux",
        // The one folder, each kept agent with its declaration as a connection and its working folder in the one folder (MOD-desktop-shell, Data), and the
        // capabilities a declaration may tick.
        folder: "/tmp/old",
        selected: [{ name: "claude", folder: "/tmp/old/claude", ...DECLARED }],
        capabilities: ["draft text", "use tools"],
        agents: [
          { name: "claude", installed: true, version: "2.1.300", loggedIn: true, install: { linux: "https://claude.ai/code" } },
          { name: "codex", installed: true, version: "1.2.3", loggedIn: true, install: { linux: "https://developers.openai.com/codex" } },
          { name: "opencode", installed: false, version: null, loggedIn: null, install: { linux: "https://opencode.ai/docs/#install" } },
        ],
      };
      if (action === "save-agents") {
        saved = value;
        return { saved: true };
      }
      if (action === "checkout") return { checkout: [
        { agent: "claude", repository: "https://github.com/shell-owner/agent-m", folder: `${chosen}/claude`, commit: "0123456789abcdef0123456789abcdef01234567", reason: null },
        { agent: "claude", repository: "https://github.com/shell-owner/refused", folder: `${chosen}/claude/products/refused`, commit: null, reason: "permission denied" },
      ] };
      return { address: "http://127.0.0.1:4711", token: "fixture-token", paused: false };
    },
    async chooseFolder() { return chosen; },
    async copy() {},
    async quit() {},
    async retryPort() {},
    async pairAnew() {},
    async pause() {},
    async resume() {},
  };

  await import(`../src/desktop-shell/window.mjs?agents-fixture=${Date.now()}`);
  assert.match(document.body.textContent, /Bridge agents/, "failure node: the Agents route is rendered");
  assert.match(document.body.textContent, /claude.*2\.1\.300/s, "failure node: installed selected agent is shown with its version");
  assert.match(document.body.textContent, /codex.*1\.2\.3/s, "failure node: installed unticked agent is shown but not selected");
  assert.match(document.body.textContent, /opencode.*How to install/s, "failure node: missing supported agent is shown with install guidance");
  const install = descendants(document.body, (node) => node.localName === "a" && node.textContent === "How to install")[0];
  assert.equal(install.getAttribute("href"), "https://opencode.ai/docs/#install");

  assert.equal(buttons(document.body, "Choose folder").length, 1, "one folder for every agent");
  assert.equal(buttons(document.body, "Test access").length, 0, "counter-proof: no Test access; the checkout shows what is reached");
  assert.doesNotMatch(document.body.textContent, /Working folder/, "counter-proof: no field of an agent's own working folder");
  await click(document.body, "Choose folder");
  await click(document.body, "Save agents");
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(saved, { agents: [{ name: "claude", ...DECLARED }], folder: chosen },
    "failure node: only the ticked installed agent is saved, with its declaration and no folder of its own, beside the one folder chosen through the window bridge");
  assert.match(document.body.textContent, /shell-owner\/agent-m\s*checked out at 0123456789ab/, "failure node: the checkout's commit is shown");
  assert.match(document.body.textContent, /shell-owner\/refused\s*not reached: permission denied/,
    "failure node: a repository the Bridge does not reach is shown with git's reason");
});
