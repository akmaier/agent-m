// *Quit* names the jobs still running (ITM-1055), as MOD-desktop-shell's accepted text states it (docs/architecture/MOD-desktop-shell.md:179-181: "*Quit* names the jobs still running, which then end as cancelled, and stops the
// watching, the tunnels and the server") and UC-044 7b (docs/use-cases/UC-044*.md:143-144): "Jobs running there end as *cancelled*". The window asks the entry for the jobs still running (`running-jobs`, answered from
// MOD-bridge-jobs' `listJobs`, ITM-1097); with some, *Quit* shows a decision that names each and quits only when it is confirmed; with none, it quits at once.
// Run: node --test tests/mod-desktop-shell-quit.test.mjs
//
// Module: MOD-desktop-shell
// Guards: THE BRIDGE RUNS AS AN APP; UC-044
// Level: unit
//
// The production window entry runs in a small EventTarget DOM, as tests/mod-desktop-shell-window.test.mjs has it, over a constructed preload: it answers the jobs the test sets for `running-jobs` and counts `quit`. What the entry
// answers is tests/mod-desktop-shell-quit-entry.test.mjs's, over the app's real entry. That the Bridge's jobs end as cancelled when it is stopped for a quit is MOD-bridge-jobs' (tests/bridge-jobs-watch.test.mjs, TST-472105) and
// the composition's `close` (tests/mod-desktop-shell-jobs-composition.test.mjs). Each test states its input and its expected result before it runs (given / input / expect). The counter-proofs are in the pull request.

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


const JOBS = [{ id: "JOB-20261019-0900-aaaa", product: "https://github.com/acme/product-a", kind: "implement", agent: "opencode", state: "running", started: "2026-10-19T09:00:00.000Z", usage: null },
  { id: "JOB-20261019-0905-bbbb", product: "https://github.com/acme/product-b", kind: "write-tests", agent: "claude", state: "running", started: "2026-10-19T09:05:00.000Z", usage: null }];

// The production window over a constructed preload that answers `running-jobs` with `jobs` and counts quit.
async function windowOver(jobs) {
  const document = { createElement: (name) => new Element(name), createTextNode: (value) => new Text(value) };
  document.head = document.createElement("head"); document.body = document.createElement("body");
  globalThis.document = document;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const browser = new EventTarget();
  Object.defineProperty(globalThis, "location", { configurable: true, value: { hash: "#pairing" } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  const calls = { quit: 0, asked: [], onQuitRequested: null };
  browser.bridge = {
    async state(action) {
      calls.asked.push(action);
      if (action === "running-jobs") return { jobs };
      return { address: "http://127.0.0.1:4711", token: "fixture-token", paused: false };
    },
    async copy() {}, async quit() { calls.quit += 1; }, onQuitRequested(callback) { calls.onQuitRequested = callback; },
  };
  await import(`../src/desktop-shell/window.mjs?quit=${Date.now()}`);
  await settle();
  return { document, calls };
}
const decision = (document) => descendants(document.body, (node) => node.className === "decision")[0];

// TST-1055101 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE RUNS AS AN APP; UC-044
// given: the production window on Pairing, over a Bridge with two jobs still running (JOB-20261019-0900-aaaa on opencode, JOB-20261019-0905-bbbb on claude)
// input: Quit pressed; then Cancel on what it shows; then Quit again and the confirmation Quit of the decision
// expect: after the first press the window asked the entry for the running jobs, shows a decision whose text names both job identifiers and says they end as cancelled, and has quit nothing; after Cancel the decision is gone and quit was not called; after the second press and the confirmation quit was called once
test("Quit with two jobs running shows a decision that names both, and quits only when it is confirmed", async () => {
  const { document, calls } = await windowOver(JOBS);
  assert.equal(calls.quit, 0);
  buttons(document.body, "Quit")[0].dispatchEvent(new Event("click"));
  await settle();
  assert.ok(calls.asked.includes("running-jobs"), "the window asked for the running jobs");
  const shown = decision(document);
  assert.ok(shown, "a decision is shown");
  for (const job of JOBS) assert.ok(shown.textContent.includes(job.id), `it names ${job.id}`);
  assert.match(shown.textContent, /cancelled/);
  assert.equal(calls.quit, 0, "nothing is quit before the confirmation");
  buttons(shown, "Cancel")[0].dispatchEvent(new Event("click"));
  await settle();
  assert.equal(decision(document), undefined, "the decision is gone");
  assert.equal(calls.quit, 0, "declining leaves the Bridge running");
  buttons(document.body, "Quit")[0].dispatchEvent(new Event("click"));
  await settle();
  buttons(decision(document), "Quit")[0].dispatchEvent(new Event("click"));
  await settle();
  assert.equal(calls.quit, 1, "confirming quits");
});

// TST-1055102 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE RUNS AS AN APP; UC-044
// given: the production window on Pairing, over a Bridge with no job running
// input: Quit pressed
// expect: quit was called once at once, and no decision was shown
test("Quit with no job running quits at once", async () => {
  const { document, calls } = await windowOver([]);
  buttons(document.body, "Quit")[0].dispatchEvent(new Event("click"));
  await settle();
  assert.equal(calls.quit, 1);
  assert.equal(decision(document), undefined);
});

// TST-1055106 · level: unit · module: MOD-desktop-shell
// guards: THE BRIDGE RUNS AS AN APP; UC-044
// given: the production window over a Bridge with two jobs running, and the main process's request to quit — what the tray's Quit sends (TST-1055105) — delivered through the preload's onQuitRequested
// input: the request; then the confirmation Quit of the decision it shows
// expect: the window registered a handler; the request shows the same decision, naming both job identifiers, and quits nothing; the confirmation quits once
test("the main process's request to quit shows the same decision and quits on its confirmation", async () => {
  const { document, calls } = await windowOver(JOBS);
  assert.equal(typeof calls.onQuitRequested, "function", "the window registered a handler for the request");
  calls.onQuitRequested();
  await settle();
  const shown = decision(document);
  assert.ok(shown, "a decision is shown");
  for (const job of JOBS) assert.ok(shown.textContent.includes(job.id), `it names ${job.id}`);
  assert.equal(calls.quit, 0);
  buttons(shown, "Quit")[0].dispatchEvent(new Event("click"));
  await settle();
  assert.equal(calls.quit, 1);
});
