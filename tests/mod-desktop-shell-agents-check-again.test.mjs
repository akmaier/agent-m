// The Bridge's Agents view checks again for a newly installed agent (ITM-1050), as MOD-desktop-shell's accepted text states it (docs/architecture/MOD-desktop-shell.md:166-167: "*Agents* — every supported agent with its version,
// ready and logged in, … or missing with its vendor's installation page for this platform, and *Check again*") and UC-044 3a (docs/use-cases/UC-044*.md:106-107: "After installing one, **Check again** lists it.").
// Run: node --test tests/mod-desktop-shell-agents-check-again.test.mjs
//
// Module: MOD-desktop-shell
// Guards: THE BRIDGE FINDS THE INSTALLED AGENTS; THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT; UC-044
// Level: unit
//
// The production window entry runs in a small EventTarget DOM, as tests/mod-desktop-shell-window.test.mjs has it; the window's `bridge.state("agents")` answers what src/desktop-shell/main.mjs answers it: the platform, the agents
// MOD-agent-processes' installedAgents finds on the PATH, and the selected ones. Fixture executables on a temporary PATH stand in for installed CLIs; no real agent, service or native window is started. The control is the button
// *Check again*; it reads the agents anew without the Bridge restarting. The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { installedAgents } from "../src/agent-processes/index.mjs";

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
// The agents are found by running each CLI, so a redraw takes a moment: wait, at most three seconds, until the condition holds.
const until = async (condition) => { for (let i = 0; i < 150 && !condition(); i += 1) await settle(); };
const script = (folder, name, body) => writeFileSync(join(folder, name), `#!/bin/sh\n${body}\n`, { mode: 0o755 });

// TST-1050101 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE FINDS THE INSTALLED AGENTS; THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT; UC-044 (3a)
// given: a Bridge computer on whose PATH only the fixture Claude is installed, so that Codex is missing; the window opened on Agents
// input: the fixture Codex is put on the PATH; the view is looked at again (nothing pressed); then the button Check again is pressed
// expect: before the press the view still lists Codex as missing, with its How to install link and one Choose folder (Claude's) — nothing is polled behind the person's back —; the view has a Check again button; after the press Codex is listed as installed — two Choose folder buttons, one How to install link fewer — without the Bridge restarting, and Claude is still listed
test("the Agents view lists a newly installed agent after Check again", async () => {
  const root = mkdtempSync(join(tmpdir(), "agent-m-1050-")), bin = join(root, "bin"), prior = process.env.PATH;
  mkdirSync(bin);
  script(bin, "claude", `case "$*" in '--version') echo '2.1.300';; 'auth status') echo '{"authMethod":"claude.ai"}';; *) exit 64;; esac`);
  process.env.PATH = bin;
  try {
    const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
    document.head = document.createElement("head"); document.body = document.createElement("body");
    globalThis.document = document;
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
    const browser = new EventTarget();
    Object.defineProperty(globalThis, "location", { configurable: true, value: { hash: "#agents" } });
    Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
    let asked = 0;
    browser.bridge = { async state(action) { if (action === "agents") { asked += 1; return { platform: "linux", agents: await installedAgents(), selected: [] }; } return {}; }, async copy() {}, async quit() {} };
    await import(`../src/desktop-shell/window.mjs?check-again=${Date.now()}`);
    await until(() => buttons(document.body, "Choose folder").length === 1);
    const links = () => descendants(document.body, (node) => node.localName === "a" && node.textContent === "How to install").length;
    const folders = () => buttons(document.body, "Choose folder").length;
    assert.equal(folders(), 1, "known positive: the installed Claude is listed with its folder");
    const missingBefore = links();
    assert.ok(missingBefore >= 1, "Codex and the others are missing");

    script(bin, "codex", `case "$*" in '--version') echo 'codex 1.2.3';; 'login status') echo 'Logged in';; *) exit 64;; esac`);
    await settle();
    assert.equal(folders(), 1, "nothing is polled: the view is as it was");
    const check = buttons(document.body, "Check again")[0];
    assert.ok(check, "the Agents view has a Check again button");
    const askedBefore = asked;
    check.dispatchEvent(new Event("click"));
    await until(() => folders() === 2);
    assert.ok(asked > askedBefore, "Check again reads the agents anew");
    assert.equal(folders(), 2, "Codex is listed as installed");
    assert.equal(links(), missingBefore - 1, "one installation link fewer");
    assert.match(document.body.textContent, /codex/i);
  } finally {
    process.env.PATH = prior;
    rmSync(root, { recursive: true, force: true });
  }
});
