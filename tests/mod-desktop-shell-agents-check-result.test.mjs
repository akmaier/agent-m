// The Bridge's Agents view offers Check result beside an agent's Log in, as MOD-desktop-shell's accepted text states it (docs/architecture/MOD-desktop-shell.md, The window's views, *Agents*: "installed but not logged in
// with its own login step (`Agent.login`) and, beside it, *Check result*, which reads the agents anew as *Check again* does, so that the login's result is checked where it was started").
// Run: node --test tests/mod-desktop-shell-agents-check-result.test.mjs
//
// Module: MOD-desktop-shell
// Guards: THE BRIDGE FINDS THE INSTALLED AGENTS; UC-044
// Level: unit
//
// The production window entry runs in a small EventTarget DOM, as tests/mod-desktop-shell-agents-check-again.test.mjs has it; the window's `bridge.state("agents")` answers a fixture state of one installed agent whose
// enclosure works and in which it is not logged in, until the fixture's login step has run; then it answers that the agent is logged in there. No real agent, enclosure, terminal or native window is started.
// The control is the button *Check result* beside *Log in*; it reads the agents anew, as *Check again* does. The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import test from "node:test";

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
const until = async (condition) => { for (let i = 0; i < 150 && !condition(); i += 1) await settle(); };

// TST-1810001 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE FINDS THE INSTALLED AGENTS; UC-044
// given: a Bridge computer with the installed agent codex, offered, whose enclosure works and in which it is not logged in; the window opened on Agents
// input: Log in is pressed, the fixture's login step runs, and then the button Check result beside Log in is pressed
// expect: the panel of codex holds Log in and, in the same paragraph right after it, Check result; the note after Log in tells the person to press Check result; pressing Check result reads the agents anew —
//         the panel then says that codex is enclosed and logged in, and offers Log in no more —; Check again still stands at the bottom of the view, beside Save agents
test("the Agents view offers Check result beside Log in and reads the agents anew with it", async () => {
  const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
  document.head = document.createElement("head"); document.body = document.createElement("body");
  globalThis.document = document;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget();
  Object.defineProperty(globalThis, "location", { configurable: true, value: { hash: "#agents" } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  let asked = 0, loggedIn = false;
  browser.bridge = {
    async state(action, args) {
      if (action === "agents") {
        asked += 1;
        return { platform: "linux", selected: [{ name: "codex", folder: "/work/codex" }], agents: [{ name: "codex", installed: true, version: "codex 1.2.3", loggedIn: true }],
          enclosures: { codex: { works: true, loggedIn } } };
      }
      if (action === "agent-login") { assert.equal(args?.name, "codex"); loggedIn = true; return {}; }
      return {};
    },
    async copy() {}, async quit() {},
  };
  await import(`../src/desktop-shell/window.mjs?check-result=${Date.now()}`);
  await until(() => buttons(document.body, "Log in").length === 1);
  const login = buttons(document.body, "Log in")[0];
  assert.ok(login, "known positive: codex, not logged in in its enclosure, offers its login step");
  const check = buttons(document.body, "Check result")[0];
  assert.ok(check, "the panel offers Check result");
  assert.equal(check.parentNode, login.parentNode, "Check result stands in the same element as Log in");
  const beside = login.parentNode.childNodes;
  assert.equal(beside.indexOf(check), beside.indexOf(login) + 1, "Check result follows Log in directly");
  const again = buttons(document.body, "Check again")[0];
  assert.ok(again, "Check again is still offered");
  assert.notEqual(again.parentNode, login.parentNode, "Check again stays where it was, not in the panel");
  assert.ok(buttons(again.parentNode, "Save agents").length === 1, "Check again stands beside Save agents");

  login.dispatchEvent(new Event("click"));
  await until(() => /press Check result/.test(document.body.textContent));
  assert.match(document.body.textContent, /press Check result when it is done/, "the note after Log in names Check result");

  const askedBefore = asked;
  check.dispatchEvent(new Event("click"));
  await until(() => buttons(document.body, "Log in").length === 0);
  assert.ok(asked > askedBefore, "Check result reads the agents anew");
  assert.equal(buttons(document.body, "Log in").length, 0, "codex is logged in now, so its login step is not offered");
  assert.match(document.body.textContent, /Enclosed and logged in\./);
});
