// Clearing a Bridge names the endpoints and the mailbox that name it (ITM-456) — MOD-settings-pages' settings lines, as
// docs/architecture/MOD-settings-pages.md states them: a Bridge's *Clear* "names first the endpoints, mailbox and resources that name it
// (UC-042, 2a)". Of these, this file checks the endpoints and the mailbox whose connection names it; the resources are
// tests/settings-pages-clear-names-resources.test.mjs's. A CLI session is no setting of this browser — the Bridge keeps its agents' declarations
// (MOD-bridge-http, GET and PUT /v1/agents) —, so the Clear names none. A participant names no Bridge: the register
// names a participant's type and model only (MOD-participant-list), and the Bridge's Clear reads none.
// Run: node --test tests/settings-pages-clear-names.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-042
// Guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// Level: unit
//
// The instance is a fixture: a host, whose default branch is trunk, whose docs/participants.md lists agents and a person, and which holds no resource list; the host records every
// read and every commit. This browser keeps the Bridges lab-pc and laptop, an endpoint hpc through lab-pc, an endpoint hpc2 through lab-pc2, whose name only begins as lab-pc's, and a
// mailbox. The store is a Map-backed localStorage; the DOM is the small one the other tests of this module use.
// Where the module file leaves a reading open, the test states the reading it takes, and the pull request names it:
//   - An endpoint names a Bridge when its `bridge` is the Bridge's name. The mailbox names it when its connection's `imap.bridge` is the
//     Bridge's name (MOD-mail-routes); a Microsoft connection names none.
//   - The question is asked before anything is cleared; Clear changes nothing but the Bridge's entry and its test record, and writes nothing to the
//     instance, the mailbox or the endpoints.
// The counter-proofs are in the pull request.

import test from "node:test";
import assert from "node:assert/strict";
import { view } from "../src/settings-pages/index.mjs";
import { openStore, readSetting, writeSetting } from "../src/browser-store/index.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.files = []; this.attributes = new Map(); }
  append(...nodes) { for (const node of nodes.flat()) this.childNodes.push(typeof node === "string" ? new Text(node) : node); }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  focus() {}
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
}
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}
globalThis.document = { createElement: (name) => new Element(name) };

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));
const click = async (button) => { button.dispatchEvent(new Event("click")); await new Promise((resolve) => setTimeout(resolve, 5)); };
const lineOf = (page, name) => byClass(page, "settings-bridge-named").find((line) => byClass(line, "settings-bridge-named-name")[0]?.textContent === name);

const PARTICIPANTS = `# Participants of this instance

**REGISTER**

| Name | Type | Model |
|---|---|---|
| a-claude | agent | example-model |
| b-codex | agent | other-model |
| e-account | person | — |
`;
const IMAP = { address: "reports@example.test", route: "imap", folders: ["INBOX"], imap: { bridge: "lab-pc", jumpHostNoted: false, account: "reports@example.test", password: "pw-constructed" } };
const GRAPH = { address: "reports@example.test", route: "graph", folders: ["INBOX"], graph: { clientId: "11111111-2222-3333-4444-555555555555", account: "reports@example.test" } };
const ENDPOINT = { url: "http://127.0.0.1:11434", kind: "ollama", model: "llama3", bridge: "lab-pc" };
const OTHER = { ...ENDPOINT, bridge: "lab-pc2" };

function fixture(t, { participants = PARTICIPANTS, mailbox = IMAP, host = "ok" } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("fixture/instance");
  writeSetting(store, "bridge:lab-pc", { port: 40100, token: "lab-token" });
  writeSetting(store, "bridge:laptop", { address: "http://127.0.0.1:4711", token: "laptop-token" });
  writeSetting(store, "jump-host", { hostname: "jump.example.test", user: "agentm", sshPort: 22, portRange: [40100, 40102] });
  writeSetting(store, "last-test:bridge:lab-pc", { at: "2026-10-11T08:00:00.000Z", outcome: "working" });
  writeSetting(store, "endpoint:hpc", ENDPOINT);
  writeSetting(store, "endpoint:hpc2", OTHER);
  if (mailbox) writeSetting(store, "mailbox", mailbox);
  const events = { commits: [], reads: [], questions: [] };
  const instanceHost = {
    repositoryInfo: async () => ({ defaultBranch: "trunk", canWrite: true }),
    readSnapshot: async (branch) => {
      if (host === "unreadable") throw Object.assign(new Error("rate limited"), { name: "RateLimited" });
      return { paths: ["docs/participants.md"], blob: () => "b".repeat(40), read: async (path) => { events.reads.push(path); return path === "docs/participants.md" && branch === "trunk" ? participants : null; } };
    },
    commitFiles: async (...args) => { events.commits.push(args); return { commit: "c".repeat(40) }; },
  };
  const prior = globalThis.confirm;
  t.after(() => { globalThis.confirm = prior; });
  const answers = { next: false };
  globalThis.confirm = (message) => { events.questions.push({ message, stored: readSetting(store, "bridge:lab-pc") !== null || readSetting(store, "bridge:laptop") !== null }); return answers.next; };
  const context = { instance: { repository: "fixture/instance", ...(host === "none" ? {} : { host: instanceHost }) }, product: null, store, go() {} };
  return { store, events, answers, async page() { const target = document.createElement("div"); await view.routes.find((route) => route.name === "settings").render(target, context, {}); return target; } };
}

// TST-472746 · level: unit · module: MOD-settings-pages
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: the mailbox and the endpoint hpc name lab-pc; the endpoint hpc2 names lab-pc2; the instance's register lists agents and a person
// input: Clear on the line of lab-pc, answered no, then yes
// expect: the question, asked before anything is cleared, names the mailbox and the endpoint hpc, and neither hpc2, laptop, a CLI session nor a participant; a no clears nothing and writes nothing; a yes clears the Bridge and
//   its test record and leaves the mailbox and the endpoints as they were, with no commit and no read of the participants file
test("Settings — Clear of a Bridge names the endpoints and the mailbox that name it, and changes neither", async (t) => {
  const f = fixture(t);
  const page = await f.page();
  await click(byClass(lineOf(page, "lab-pc"), "settings-bridge-named-clear")[0]);
  assert.equal(f.events.questions.length, 1);
  const { message, stored } = f.events.questions[0];
  assert.ok(stored, "the question is asked before anything is cleared");
  assert.match(message, /The endpoint hpc names it\./);
  assert.match(message, /mailbox/i);
  for (const other of ["hpc2", "laptop", "CLI session", "a-claude", "b-codex", "e-account", "participant"]) assert.ok(!message.includes(other), `${other} is not named`);
  assert.deepEqual(readSetting(f.store, "bridge:lab-pc"), { port: 40100, token: "lab-token" }, "a no clears nothing");
  assert.deepEqual(f.events.commits, []);

  f.answers.next = true;
  await click(byClass(lineOf(await f.page(), "lab-pc"), "settings-bridge-named-clear")[0]);
  assert.equal(readSetting(f.store, "bridge:lab-pc"), null);
  assert.equal(readSetting(f.store, "last-test:bridge:lab-pc"), null);
  assert.deepEqual(readSetting(f.store, "mailbox"), IMAP);
  assert.deepEqual(readSetting(f.store, "endpoint:hpc"), ENDPOINT);
  assert.deepEqual(readSetting(f.store, "endpoint:hpc2"), OTHER);
  assert.deepEqual(f.events.commits, [], "nothing is written to the instance");
  assert.ok(!f.events.reads.includes("docs/participants.md"), "the participants file is not read");
});

// TST-472747 · level: unit · module: MOD-settings-pages
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: the same browser; laptop, which no mailbox and no endpoint name
// input: Clear on the line of laptop
// expect: the question says that nothing in this browser names this Bridge, and names neither a CLI session, nor a mailbox, nor an endpoint
test("Settings — Clear of a Bridge that nothing names says so", async (t) => {
  const f = fixture(t);
  const page = await f.page();
  await click(byClass(lineOf(page, "laptop"), "settings-bridge-named-clear")[0]);
  const { message } = f.events.questions[0];
  assert.match(message, /Nothing in this browser names this Bridge\./);
  for (const other of ["CLI session", "claude", "mailbox", "hpc"]) assert.ok(!message.toLowerCase().includes(other.toLowerCase()), `${other} is not named`);
});

// TST-472748 · level: unit · module: MOD-settings-pages
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: a Microsoft mailbox, which names no Bridge
// input: Clear on the line of lab-pc
// expect: the endpoint hpc is named and the mailbox is not
test("Settings — a Microsoft mailbox names no Bridge", async (t) => {
  const f = fixture(t, { mailbox: GRAPH });
  const page = await f.page();
  await click(byClass(lineOf(page, "lab-pc"), "settings-bridge-named-clear")[0]);
  const { message } = f.events.questions[0];
  assert.match(message, /The endpoint hpc names it\./, "known positive: the endpoint is named");
  assert.doesNotMatch(message, /mailbox/i);
});

// TST-472749 · level: unit · module: MOD-settings-pages
// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: an instance whose participants file is missing; a page with no instance host
// input: Clear on the line of lab-pc, answered no
// expect: each question names the endpoint hpc and the mailbox and says nothing of participants; each is asked and a no clears nothing
test("Settings — Clear names no participant, with or without the instance's register", async (t) => {
  const missing = fixture(t, { participants: null });
  await click(byClass(lineOf(await missing.page(), "lab-pc"), "settings-bridge-named-clear")[0]);
  const none = fixture(t, { host: "none" });
  await click(byClass(lineOf(await none.page(), "lab-pc"), "settings-bridge-named-clear")[0]);
  for (const f of [missing, none]) {
    const { message } = f.events.questions[0];
    assert.match(message, /The endpoint hpc names it\./, "known positive: the question names what names the Bridge");
    assert.match(message, /mailbox/i);
    assert.doesNotMatch(message, /participant/i);
    assert.deepEqual(readSetting(f.store, "bridge:lab-pc"), { port: 40100, token: "lab-token" });
  }
});
