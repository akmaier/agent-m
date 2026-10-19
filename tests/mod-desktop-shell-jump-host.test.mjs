// The jump host is set in the Bridge's window (ITM-1053), as MOD-desktop-shell's accepted text states it (docs/architecture/MOD-desktop-shell.md:64-65: "It keeps the Bridge's settings, set in the window or taken from the dashboard's
// export"; :174 *Tunnels* — the jump host …) and UC-044 6a.1 (docs/use-cases/UC-044*.md:123-124): "In the bridge's window the person enters the jump host — hostname, SSH user —, or imports the dashboard's settings export".
// Run: node --test tests/mod-desktop-shell-jump-host.test.mjs
//
// Module: MOD-desktop-shell
// Guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-044
// Level: unit
//
// The production window entry runs in a small EventTarget DOM, as tests/mod-desktop-shell-window.test.mjs has it. The window's `bridge.state(...)` answers as src/desktop-shell/main.mjs does for the actions it names: here the
// settings are the real ones, MOD-desktop-shell's settings.mjs, kept in a temporary data folder as `settings.json`. Readings taken, named in the pull request: the window asks `save-jump-host` with the hostname, the SSH
// user and the SSH port, and the file's `setJumpHost(dataFolder, { hostname, user, sshPort })` keeps them; an empty SSH port is 22; an empty hostname or an empty user, or a port outside 1 to 65535, is refused with an error named
// InvalidSettings and nothing is written. The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import * as shell from "../src/desktop-shell/settings.mjs";

class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.attributes = new Map(); this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.innerHTML = ""; this.parentNode = null; }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  remove() { if (this.parentNode) this.parentNode.childNodes.splice(this.parentNode.childNodes.indexOf(this), 1); }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  getElementsByTagName(name) { return descendants(this, (node) => node.localName === name); }
}
class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); } get length() { return this.values.size; } key(index) { return [...this.values.keys()][index] ?? null; } }
const descendants = (root, predicate) => { const found = []; const visit = (node) => { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } }; visit(root); return found; };
const buttons = (root, label) => descendants(root, (node) => node.localName === "button" && node.textContent === label);
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
// The input inside the label whose text starts with `caption`.
const inputOf = (root, caption) => descendants(root, (node) => node.localName === "label" && node.textContent.startsWith(caption))[0]?.childNodes.find((child) => child instanceof Element && child.localName === "input");

async function windowOver(dataFolder) {
  const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
  document.head = document.createElement("head"); document.body = document.createElement("body");
  globalThis.document = document;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget(), location = { hash: "#tunnels" };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  browser.bridge = {
    async state(action, value) {
      if (action === "settings") return { settings: shell.loadSettings(dataFolder) };
      if (action === "tunnels") return { publicKey: "ssh-ed25519 fixture", tunnels: [] };
      if (action === "save-jump-host") { shell.setJumpHost(dataFolder, value); return {}; }
      return { address: "http://127.0.0.1:4711", token: "fixture-token", paused: false };
    },
    async copy() {}, async quit() {},
  };
  await import(`../src/desktop-shell/window.mjs?jump-host=${Date.now()}`);
  await settle();
  return document;
}
const fill = (document, host, user, port) => { inputOf(document.body, "Jump host").value = host; inputOf(document.body, "SSH user").value = user; inputOf(document.body, "SSH port").value = port; };

// TST-1053101 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; UC-044 (6a.1)
// given: a Bridge data folder with no jump host, and the production window on Tunnels
// input: hostname jump.example.test, SSH user agentm and SSH port 2222 entered, then the button Save jump host pressed
// expect: before: the sentence asks for a jump host and does not name one; after: settings.json holds jumpHost { hostname: "jump.example.test", user: "agentm", sshPort: 2222 } and the Tunnels view names agentm@jump.example.test in its sentence
test("a jump host entered in the window is kept in settings.json and named in the Tunnels view", async () => {
  const folder = mkdtempSync(join(tmpdir(), "agent-m-1053-"));
  try {
    const document = await windowOver(folder);
    assert.equal(shell.loadSettings(folder).jumpHost, null, "known positive: no jump host at first");
    assert.doesNotMatch(document.body.textContent, /@jump\.example\.test/);
    fill(document, "jump.example.test", "agentm", "2222");
    const save = buttons(document.body, "Save jump host")[0];
    assert.ok(save, "the Tunnels view has a Save jump host button");
    save.dispatchEvent(new Event("click"));
    await settle();
    assert.deepEqual(JSON.parse(readFileSync(join(folder, "settings.json"), "utf8")).jumpHost, { hostname: "jump.example.test", user: "agentm", sshPort: 2222 });
    assert.match(document.body.textContent, /agentm@jump\.example\.test/);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

// TST-1053102 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; UC-044 (6a.1)
// given: a Bridge data folder with no jump host, and the production window on Tunnels
// input: the hostname left empty, SSH user agentm, SSH port 22, then Save jump host; then the user left empty with a hostname; then SSH port 70000
// expect: each is refused: nothing is written (no settings.json) and the view says it was not saved; the same button with a hostname, a user and an empty port keeps the jump host with SSH port 22
test("an empty hostname, an empty user or a port outside 1 to 65535 is refused, and an empty port is 22", async () => {
  const folder = mkdtempSync(join(tmpdir(), "agent-m-1053-"));
  try {
    const document = await windowOver(folder);
    const press = async () => { buttons(document.body, "Save jump host")[0].dispatchEvent(new Event("click")); await settle(); };
    for (const [host, user, port] of [["", "agentm", "22"], ["jump.example.test", "", "22"], ["jump.example.test", "agentm", "70000"]]) {
      fill(document, host, user, port);
      await press();
      assert.equal(existsSync(join(folder, "settings.json")), false, `nothing written for ${JSON.stringify([host, user, port])}`);
      assert.match(document.body.textContent, /not saved/i);
    }
    assert.throws(() => shell.setJumpHost(folder, { hostname: " ", user: "agentm", sshPort: 22 }), (error) => error.name === "InvalidSettings");
    fill(document, "jump.example.test", "agentm", "");
    await press();
    assert.deepEqual(shell.loadSettings(folder).jumpHost, { hostname: "jump.example.test", user: "agentm", sshPort: 22 });
  } finally { rmSync(folder, { recursive: true, force: true }); }
});
