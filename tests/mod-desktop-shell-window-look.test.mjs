// The Bridge's window wears the site's look (MOD-desktop-shell, Files: "window.html, window.mjs — ... the page links no style sheet, since startPage gives
// it the site's look, and the routes draw their buttons, fields, tables and lists in that look's classes, with no style of their own"; MOD-site-frame,
// startPage: "links look.css in the page's head where the page does not link it itself, as the Bridge's window does not").
// Run: node --test tests/mod-desktop-shell-window-look.test.mjs
//
// Module: MOD-desktop-shell
// Guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; UC-044
// Level: unit
//
// This drives the production window entry through a small EventTarget DOM, as tests/mod-desktop-shell-window.test.mjs does. It opens no native window,
// contacts no service, and uses only constructed preload replies. The expected results are written here from the two texts above, and none is read from
// the code. Readings taken where the texts leave one open:
//   - "The routes" are the five routes the window serves — Pairing (also as it stands when the Bridge could not start), Agents, Settings, Tunnels and
//     Updates (with a release offered, before and after its download) — each drawn with a state that shows every button it can draw.
//   - "The look's classes" for a button are `btn`, with `primary` or `small` beside it (MOD-site-frame, look.css): every button a route draws carries `btn`.
//     A table is drawn in the look's class `list`.
//   - "No style of their own" is no `style` attribute and no <style> or <link> element in what a route draws.
//   - "The site's style sheet" is src/site-frame/look.css: the window's head links it, and no other.
//   - The known positive of the button check is the decision's Cancel and Accept, which MOD-site-frame draws with `btn`.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
const classes = (element) => String(element.className ?? "").split(/\s+/).filter(Boolean);

// TST-1105202 · level: unit · module: MOD-desktop-shell
// guards: EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE; UC-044
// given: the production Bridge window entry, src/desktop-shell/window.html, and constructed preload states that make each route draw every button it can: a Bridge that could not start (port in use), one paired, an installed agent whose enclosure needs its setup, one whose enclosure needs a login, a missing agent, the settings, a jump host with a tunnel, and a release offered, before and after its download
// input: the routes pairing, agents, settings, tunnels and updates are drawn in turn; then Pair anew opens its decision
// expect: window.html links no style sheet and holds no <style>; the window's head links exactly one style sheet, src/site-frame/look.css; every button each route draws carries the class btn, and every table the class list; no element a route draws has a style attribute, and none is a <style> or <link>; the known positive — the decision's buttons, MOD-site-frame's — carries btn
// Planted fault: a route's button drawn without btn, a <link rel="stylesheet"> put into window.html, or a style attribute on a route's element fails it.
test("TST-1105202 the Bridge window's routes use only the site's style sheet, and their buttons carry btn", async () => {
  const html = readFileSync(new URL("../src/desktop-shell/window.html", import.meta.url), "utf8");
  assert.doesNotMatch(html, /<link\b[^>]*rel=["']?stylesheet/i, "window.html links no style sheet");
  assert.doesNotMatch(html, /<style\b/i, "window.html holds no style of its own");

  const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
  document.head = document.createElement("head"); document.body = document.createElement("body");
  globalThis.document = document;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget();
  const location = { hash: "#pairing" };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  let failure = null, ready = false;
  browser.bridge = {
    async state(action) {
      if (action === "agents") return { platform: "darwin", selected: [{ name: "claude", folder: "/work" }],
        agents: [{ name: "claude", installed: true, version: "1.0", loggedIn: true }, { name: "codex", installed: true, version: "2.0", loggedIn: false },
          { name: "gemini", installed: false, install: { darwin: "https://example.test/install" } }],
        enclosures: { claude: { works: false, reason: "no sandbox", setup: "install the sandbox" }, codex: { works: true, loggedIn: false } } };
      if (action === "settings") return { settings: { name: "This computer", port: 4711, products: ["https://products.example.test"], every: 30, jumpHost: { hostname: "jump.example.test", user: "agentm", sshPort: 22 } } };
      if (action === "tunnels") return { publicKey: "ssh-ed25519 fixture", tunnels: [{ name: "own", state: "open" }] };
      if (action === "updates") return { version: "2026.10.0", offer: { version: "2026.11.0", notes: "Fixes the tunnels." }, ready, refused: null, error: null };
      if (action === "running-jobs") return { jobs: [] };
      return failure ?? { address: "http://127.0.0.1:4711", token: "fixture-token", paused: false, pairedWith: null };
    },
    async copy() {}, async quit() {}, async retryPort() {}, async pairAnew() {}, async pause() {}, async resume() {},
  };
  await import(`../src/desktop-shell/window.mjs?window-look=${Date.now()}`);
  const show = async (hash) => { location.hash = hash; browser.dispatchEvent(new Event("hashchange")); await new Promise((resolve) => setImmediate(resolve)); };

  const sheets = descendants(document.head, (node) => node.localName === "link" && node.getAttribute("rel") === "stylesheet").map((link) => link.getAttribute("href"));
  assert.equal(sheets.length, 1, `the window's head links one style sheet, not ${JSON.stringify(sheets)}`);
  assert.match(sheets[0], /\/src\/site-frame\/look\.css$/, "the one style sheet is the site's look.css");

  const route = () => descendants(document.body, (node) => node.localName === "main")[0];
  const drawn = [];
  const inspect = (name) => {
    const target = route();
    const buttons = descendants(target, (node) => node.localName === "button");
    assert.ok(buttons.length > 0, `${name} draws its buttons`);
    drawn.push(...buttons.map((button) => button.textContent));
    for (const button of buttons) assert.ok(classes(button).includes("btn"), `${name}: the button "${button.textContent}" carries btn, not "${button.className}"`);
    for (const table of descendants(target, (node) => node.localName === "table")) assert.ok(classes(table).includes("list"), `${name}: a table carries list`);
    for (const element of descendants(target, () => true)) {
      assert.equal(element.getAttribute("style"), null, `${name}: the ${element.localName} "${element.textContent.slice(0, 40)}" has no style of its own`);
      assert.ok(!["style", "link"].includes(element.localName), `${name}: no <${element.localName}> in the route`);
    }
  };
  // The known positive first: the decision MOD-site-frame draws, beside the route, carries btn on its buttons.
  descendants(route(), (node) => node.localName === "button" && node.textContent === "Pair anew")[0].dispatchEvent(new Event("click"));
  await new Promise((resolve) => setImmediate(resolve));
  const decision = descendants(document.body, (node) => node.localName === "section" && node.className === "decision")[0];
  assert.ok(decision, "the decision is drawn");
  const decided = descendants(decision, (node) => node.localName === "button");
  assert.deepEqual(decided.map((button) => [button.textContent, classes(button).includes("btn")]), [["Cancel", true], ["Pair anew", true]], "the known positive carries btn");
  decided[0].dispatchEvent(new Event("click"));
  await new Promise((resolve) => setImmediate(resolve));

  await show("#pairing"); inspect("pairing");
  failure = { failure: { name: "PortInUse", message: "occupied" } }; await show("#pairing"); inspect("pairing, not started"); failure = null;
  await show("#agents"); inspect("agents");
  await show("#settings"); inspect("settings");
  await show("#tunnels"); inspect("tunnels");
  await show("#updates"); inspect("updates, offered");
  ready = true; await show("#updates"); inspect("updates, downloaded");
  for (const label of ["Use this port", "Quit", "Copy token", "Pair anew", "Choose folder", "Set up", "Log in", "Check again", "Save agents",
    "Save settings", "Import settings export", "Copy public key", "Save jump host", "Download", "Install and restart", "Agents", "Updates"]) {
    assert.ok(drawn.includes(label), `the routes drew the button ${label}`);
  }
});
