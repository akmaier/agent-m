// Each view of the Bridge's window carries its own explanation (ITM-1051), as MOD-desktop-shell's accepted text states it (docs/architecture/MOD-desktop-shell.md:165: "The window's views, drawn with the site's frame as the page
// `bridge`, each with its explanation") and UC-044 step 3 (docs/use-cases/UC-044*.md:73-74): "A folded explanation says that the agent will use its own login on this computer, so no key is needed and the person's subscription pays."
// The topics are MOD-site-frame's (src/site-frame/explanations.md, ITM-1052): bridge-pairing, bridge-own-login, bridge-tunnels and bridge-import-export.
// Run: node --test tests/mod-desktop-shell-view-explanations.test.mjs
//
// Module: MOD-desktop-shell
// Guards: EVERY STEP EXPLAINS ITSELF; UC-044
// Level: unit
//
// The production window entry runs in the frame's fixture DOM (tests/site-frame-dom.mjs), which renders an explanation's text, with a constructed preload state. Readings taken, named in the pull request: the views that the window has — Agents, Pairing,
// Tunnels and Settings — name their topics: Pairing `bridge-pairing`, Agents `bridge-own-login`, Tunnels `bridge-tunnels`, Settings `bridge-import-export`; the window has no Updates view yet (the module text lists one), so none is asserted.
// Each topic is recognised in the drawn view by a phrase of its own that this file writes out; a view draws its own phrase and none of the others'. The frame's own check (tests/site-frame-topics.mjs) reads the source of the window.
// The counter-proofs are in the pull request.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { topicFindings, topicsNamed } from "./site-frame-topics.mjs";
import { installDocument } from "./site-frame-dom.mjs";

class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); } get length() { return this.values.size; } key(index) { return [...this.values.keys()][index] ?? null; } }

// A phrase of each topic, as the topic's text writes it.
const PHRASE = {
  "bridge-pairing": "authorises that dashboard to ask this local app",
  "bridge-own-login": "runs on your computer with the agent's own login",
  "bridge-tunnels": "A tunnel is a connection the Bridge opens itself",
  "bridge-import-export": "import the settings export from the dashboard",
};
const VIEW_TOPIC = { pairing: "bridge-pairing", agents: "bridge-own-login", tunnels: "bridge-tunnels", settings: "bridge-import-export" };

async function window_() {
  const document = installDocument();
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget(), location = { hash: "#pairing" };
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.assign(globalThis.window, { addEventListener: browser.addEventListener.bind(browser), dispatchEvent: browser.dispatchEvent.bind(browser) });
  const target = globalThis.window;
  target.bridge = {
    async state(action) {
      if (action === "settings") return { settings: { name: "This computer", port: 4711, products: [], every: 30, jumpHost: { hostname: "jump.example.test", user: "agentm", sshPort: 22 } } };
      if (action === "tunnels") return { publicKey: "ssh-ed25519 fixture", tunnels: [{ name: "own", state: "open" }] };
      if (action === "agents") return { platform: "linux", agents: [{ name: "claude", installed: true, version: "2.1.300", loggedIn: true }, { name: "codex", installed: false, install: { linux: "https://example.test/codex" } }], selected: [] };
      return { address: "http://127.0.0.1:4711", token: "fixture-token", paused: false };
    },
    async copy() {}, async quit() {},
  };
  await import(`../src/desktop-shell/window.mjs?view-explanations=${Date.now()}`);
  const show = async (view) => { location.hash = `#${view}`; browser.dispatchEvent(new Event("hashchange")); await new Promise((resolve) => setTimeout(resolve, 20)); return document.body.textContent; };
  return show;
}

// TST-1051101 · level: unit · module: MOD-desktop-shell
// guards: EVERY STEP EXPLAINS ITSELF; UC-044
// given: the production Bridge window and a constructed preload state; each of its views drawn in turn: Pairing, Agents, Tunnels, Settings
// input: the text each view draws
// expect: each view holds the phrase of its own topic — Pairing that of bridge-pairing, Agents that of bridge-own-login, Tunnels that of bridge-tunnels, Settings that of bridge-import-export — and none holds the phrase of another view's topic
test("each view of the window draws its own explanation and no other view's", async () => {
  const show = await window_();
  for (const [view, topic] of Object.entries(VIEW_TOPIC)) {
    const text = await show(view);
    assert.ok(text.includes(PHRASE[topic]), `${view} draws ${topic}`);
    for (const [other, phrase] of Object.entries(PHRASE)) if (other !== topic) assert.equal(text.includes(phrase), false, `${view} does not draw ${other}`);
  }
});

// TST-1051102 · level: unit · module: MOD-desktop-shell
// guards: EVERY STEP EXPLAINS ITSELF
// given: the source of src/desktop-shell/window.mjs and src/site-frame/explanations.md, read by the frame's own check
// input: topicsNamed of the window's source; topicFindings of it against the explanations file
// expect: the window names bridge-pairing, bridge-own-login, bridge-tunnels and bridge-import-export; the check finds none of the topics it names missing from the file
test("the frame's own check finds every topic the window names", () => {
  const files = [{ path: "src/desktop-shell/window.mjs", text: readFileSync(new URL("../src/desktop-shell/window.mjs", import.meta.url), "utf8") }];
  const named = topicsNamed(files[0].text);
  for (const topic of Object.values(VIEW_TOPIC)) assert.ok(named.includes(topic), `the window names ${topic}`);
  assert.deepEqual(topicFindings(files, readFileSync(new URL("../src/site-frame/explanations.md", import.meta.url), "utf8")), []);
});
