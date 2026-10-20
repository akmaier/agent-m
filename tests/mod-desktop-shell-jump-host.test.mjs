// The jump host is set in the Bridge's window (ITM-1053), as MOD-desktop-shell's accepted text states it (docs/architecture/MOD-desktop-shell.md:64-65: "It keeps the Bridge's settings, set in the window or taken from the dashboard's
// export"; :174 *Tunnels* — the jump host …) and UC-044 6a.1 (docs/use-cases/UC-044*.md:123-124): "In the bridge's window the person enters the jump host — hostname, SSH user —, or imports the dashboard's settings export".
// Run: node --test tests/mod-desktop-shell-jump-host.test.mjs
//
// Module: MOD-desktop-shell
// Guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; THE BRIDGE OPENS ITS TUNNELS ITSELF; UC-044
// Level: unit
//
// The production window entry runs in a small EventTarget DOM, as tests/mod-desktop-shell-window.test.mjs has it. The window's `bridge.state(...)` is a constructed preload: it answers the settings and tunnels the test sets, records what the window sends and, for `save-jump-host`, answers what the test says. What the entry
// does with that request is tests/mod-desktop-shell-jump-host-entry.test.mjs's, over the app's real entry (src/desktop-shell/main.mjs); nothing of its dispatch is written again here. Readings taken, named in the pull request: the window asks `save-jump-host` with the hostname, the SSH
// user and the SSH port as typed (the port a text), and shows a refusal as "Not saved: …"; the file's `setJumpHost(dataFolder, { hostname, user, sshPort })` keeps them; an empty SSH port is 22; an empty hostname or an empty user, or a port outside
// 1 to 65535, is refused with an error named InvalidSettings and nothing is written. The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
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

// The production window over a constructed preload. `sent` records every `save-jump-host` request; `answer` is what the test makes the preload do with it: a function that updates the constructed jump host, or throws.
async function windowOver(answer) {
  const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
  document.head = document.createElement("head"); document.body = document.createElement("body");
  globalThis.document = document;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget(), location = { hash: "#tunnels" };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  const sent = [];
  let jumpHost = null;
  browser.bridge = {
    async state(action, value) {
      if (action === "settings") return { settings: { name: "This computer", port: 4711, products: [], every: 30, jumpHost } };
      if (action === "tunnels") return { publicKey: "ssh-ed25519 fixture", tunnels: [] };
      if (action === "save-jump-host") { sent.push(value); jumpHost = answer(value) ?? jumpHost; return {}; }
      return { address: "http://127.0.0.1:4711", token: "fixture-token", paused: false };
    },
    async copy() {}, async quit() {},
  };
  await import(`../src/desktop-shell/window.mjs?jump-host=${Date.now()}`);
  await settle();
  return { document, sent };
}
const fill = (document, host, user, port) => { inputOf(document.body, "Jump host").value = host; inputOf(document.body, "SSH user").value = user; inputOf(document.body, "SSH port").value = port; };

// TST-1053101 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; UC-044 (6a.1)
// given: the production window on Tunnels over a constructed preload that keeps no jump host at first and, when it is sent one, keeps it
// input: hostname jump.example.test, SSH user agentm and SSH port 2222 entered, then the button Save jump host pressed
// expect: before: no sentence names user@hostname; the window sent exactly one save-jump-host with { hostname: "jump.example.test", user: "agentm", sshPort: "2222" } — as typed, the port a text —; after: the Tunnels view is drawn again and names agentm@jump.example.test in its sentence
test("the window sends the jump host as typed and names it in the Tunnels view", async () => {
  const { document, sent } = await windowOver((value) => ({ hostname: value.hostname, user: value.user, sshPort: Number(value.sshPort) }));
  assert.doesNotMatch(document.body.textContent, /@jump\.example\.test/, "known positive: no jump host at first");
  fill(document, "jump.example.test", "agentm", "2222");
  const save = buttons(document.body, "Save jump host")[0];
  assert.ok(save, "the Tunnels view has a Save jump host button");
  save.dispatchEvent(new Event("click"));
  await settle();
  assert.deepEqual(sent, [{ hostname: "jump.example.test", user: "agentm", sshPort: "2222" }]);
  assert.match(document.body.textContent, /agentm@jump\.example\.test/);
});

// TST-1053102 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; UC-044 (6a.1)
// given: the production window on Tunnels over a constructed preload that refuses the request with an error named InvalidSettings ("The jump host needs a hostname.")
// input: the hostname left empty, SSH user agentm, SSH port 22, then Save jump host
// expect: the window shows "Not saved: The jump host needs a hostname." and names no user@hostname
test("the window shows a refusal of the jump host as not saved", async () => {
  const { document, sent } = await windowOver(() => { throw Object.assign(new Error("The jump host needs a hostname."), { name: "InvalidSettings" }); });
  fill(document, "", "agentm", "22");
  buttons(document.body, "Save jump host")[0].dispatchEvent(new Event("click"));
  await settle();
  assert.equal(sent.length, 1);
  assert.match(document.body.textContent, /Not saved: The jump host needs a hostname\./);
  assert.doesNotMatch(document.body.textContent, /agentm@/);
});

// TST-1053103 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT; UC-044 (6a.1)
// given: a Bridge data folder with no settings file
// input: setJumpHost with an empty hostname, an empty user, a blank hostname, the port 70000 and the port 0; then with hostname " jump.example.test ", user "agentm" and an empty port; then with the port "2222"
// expect: the first five throw an error named InvalidSettings and no settings.json exists; the sixth keeps { hostname: "jump.example.test", user: "agentm", sshPort: 22 }, the seventh the port 2222; the other settings are those of loadSettings
test("setJumpHost refuses what is not a jump host, trims, and takes 22 for an empty port", () => {
  const folder = mkdtempSync(join(tmpdir(), "agent-m-1053-"));
  try {
    for (const value of [{ hostname: "", user: "agentm", sshPort: 22 }, { hostname: "jump.example.test", user: "", sshPort: 22 }, { hostname: " ", user: "agentm", sshPort: 22 },
      { hostname: "jump.example.test", user: "agentm", sshPort: "70000" }, { hostname: "jump.example.test", user: "agentm", sshPort: "0" }]) {
      assert.throws(() => shell.setJumpHost(folder, value), (error) => error.name === "InvalidSettings", JSON.stringify(value));
    }
    assert.equal(existsSync(join(folder, "settings.json")), false, "nothing written");
    assert.deepEqual(shell.setJumpHost(folder, { hostname: " jump.example.test ", user: "agentm", sshPort: "" }).jumpHost, { hostname: "jump.example.test", user: "agentm", sshPort: 22 });
    assert.deepEqual(shell.setJumpHost(folder, { hostname: "jump.example.test", user: "agentm", sshPort: "2222" }).jumpHost, { hostname: "jump.example.test", user: "agentm", sshPort: 2222 });
    assert.deepEqual(shell.loadSettings(folder).jumpHost, { hostname: "jump.example.test", user: "agentm", sshPort: 2222 });
  } finally { rmSync(folder, { recursive: true, force: true }); }
});
