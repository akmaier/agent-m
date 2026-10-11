// Clearing a Bridge names the participants and the mailbox that name it (ITM-456) — MOD-settings-pages' settings lines, as
// docs/architecture/MOD-settings-pages.md states them: a Bridge's Clear names first the endpoints, participants and mailbox that name it (UC-042, 2a).
// Of these, ITM-405 built the endpoints; this item adds the participants — the rows of the instance's docs/participants.md whose route is
// `bridge <name> agent <agent>` for that Bridge — and the mailbox whose connection names it. The resources are not part of it.
// Run: node --test tests/settings-pages-clear-names.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-042
// Guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
// Level: unit
//
// The instance is a fixture: a host, whose default branch is trunk, whose docs/participants.md names two agents on the Bridge lab-pc and one on laptop, beside rows whose route only
// looks like theirs; the host records every commit. The store is a Map-backed localStorage; the DOM is the small one the other tests of this module use.
// Where the module file leaves a reading open, the test states the reading it takes, and the pull request names it:
//   - A participant names a Bridge when its route is exactly `bridge <name> agent <agent>`; it is named by its name and its agent. The mailbox names it
//     when its connection's `imap.bridge` is the Bridge's name (MOD-mail-routes); a Microsoft connection names none.
//   - When the instance's participants cannot be read, the question says so and is still asked: it never claims that no participant names the Bridge.
//     A page without an instance host has no participants to read and says nothing of them.
//   - The question is asked before anything is cleared; Clear changes nothing but the Bridge's entry and its test record, and writes nothing to the
//     participants file, the mailbox or the endpoints.
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

| Name | Type | Model | Context | Price | Capabilities | Processing place | Route |
|---|---|---|---|---|---|---|---|
| a-claude | CLI agent | example-model | 200000 | — | draft text | this machine | bridge lab-pc agent claude |
| a-codex | CLI agent | example-model | 200000 | — | draft text | this machine | bridge lab-pc agent codex |
| b-claude | CLI agent | example-model | 200000 | — | draft text | this machine | bridge laptop agent claude |
| c-endpoint | model endpoint | example-model | 200000 | — | draft text | NHR@FAU, Erlangen | endpoint lab-pc |
| d-prefix | CLI agent | example-model | 200000 | — | draft text | this machine | bridge lab-pc2 agent claude |
| e-account | person | — | — | — | draft text | — | account github.com/akmaier |
`;
const IMAP = { address: "reports@example.test", route: "imap", folders: ["INBOX"], imap: { bridge: "lab-pc", jumpHostNoted: false, account: "reports@example.test", password: "pw-constructed" } };
const GRAPH = { address: "reports@example.test", route: "graph", folders: ["INBOX"], graph: { clientId: "11111111-2222-3333-4444-555555555555", account: "reports@example.test" } };
const ENDPOINT = { url: "http://127.0.0.1:11434", kind: "ollama", model: "llama3", bridge: "lab-pc" };

function fixture(t, { participants = PARTICIPANTS, mailbox = IMAP, host = "ok" } = {}) {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("fixture/instance");
  writeSetting(store, "bridge:lab-pc", { port: 40100, token: "lab-token" });
  writeSetting(store, "bridge:laptop", { address: "http://127.0.0.1:4711", token: "laptop-token" });
  writeSetting(store, "jump-host", { hostname: "jump.example.test", user: "agentm", sshPort: 22, portRange: [40100, 40102] });
  writeSetting(store, "last-test:bridge:lab-pc", { at: "2026-10-11T08:00:00.000Z", outcome: "working" });
  writeSetting(store, "endpoint:hpc", ENDPOINT);
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

// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: the instance's participants name two agents on lab-pc and one on laptop, beside a model endpoint, a bridge with a similar name and a person; the
//        mailbox and an endpoint name lab-pc
// input: Clear on the line of lab-pc, answered no, then yes
// expect: the question, asked before anything is cleared, names a-claude (claude) and a-codex (codex), the mailbox and the endpoint hpc, and none of the
//         others; a no clears nothing and writes nothing; a yes clears the Bridge and its test record and leaves the participants file, the mailbox and the
//         endpoint as they were, with no commit
test("Settings — Clear of a Bridge names the participants and the mailbox that name it, and changes neither", async (t) => {
  const f = fixture(t);
  const page = await f.page();
  await click(byClass(lineOf(page, "lab-pc"), "settings-bridge-named-clear")[0]);
  assert.equal(f.events.questions.length, 1);
  const { message, stored } = f.events.questions[0];
  assert.ok(stored, "the question is asked before anything is cleared");
  assert.match(message, /a-claude \(claude\)/);
  assert.match(message, /a-codex \(codex\)/);
  assert.match(message, /mailbox/i);
  assert.match(message, /hpc/);
  for (const other of ["b-claude", "c-endpoint", "d-prefix", "e-account", "laptop"]) assert.ok(!message.includes(other), `${other} is not named`);
  assert.deepEqual(readSetting(f.store, "bridge:lab-pc"), { port: 40100, token: "lab-token" }, "a no clears nothing");
  assert.deepEqual(f.events.commits, []);

  f.answers.next = true;
  await click(byClass(lineOf(await f.page(), "lab-pc"), "settings-bridge-named-clear")[0]);
  assert.equal(readSetting(f.store, "bridge:lab-pc"), null);
  assert.equal(readSetting(f.store, "last-test:bridge:lab-pc"), null);
  assert.deepEqual(readSetting(f.store, "mailbox"), IMAP);
  assert.deepEqual(readSetting(f.store, "endpoint:hpc"), ENDPOINT);
  assert.deepEqual(f.events.commits, [], "nothing is written to the instance");
  assert.ok(f.events.reads.every((path) => path === "docs/participants.md"));
  assert.ok(f.events.reads.length >= 1, "the participants file was read");
});

// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: the same instance; laptop, which one participant and no mailbox and no endpoint name
// input: Clear on the line of laptop
// expect: the question names b-claude (claude) and neither the lab-pc participants, nor a mailbox, nor an endpoint
test("Settings — Clear of another Bridge names only the participants of that Bridge", async (t) => {
  const f = fixture(t);
  const page = await f.page();
  await click(byClass(lineOf(page, "laptop"), "settings-bridge-named-clear")[0]);
  const { message } = f.events.questions[0];
  assert.match(message, /b-claude \(claude\)/);
  for (const other of ["a-claude", "a-codex", "mailbox", "hpc"]) assert.ok(!message.toLowerCase().includes(other.toLowerCase()), `${other} is not named`);
});

// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: a Microsoft mailbox, which names no Bridge
// input: Clear on the line of lab-pc
// expect: the participants are named and the mailbox is not
test("Settings — a Microsoft mailbox names no Bridge", async (t) => {
  const f = fixture(t, { mailbox: GRAPH });
  const page = await f.page();
  await click(byClass(lineOf(page, "lab-pc"), "settings-bridge-named-clear")[0]);
  const { message } = f.events.questions[0];
  assert.match(message, /a-claude/, "known positive: the participants are named");
  assert.doesNotMatch(message, /mailbox/i);
});

// guards: A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN; UC-042
// given: an instance whose participants cannot be read; one whose file is missing; a page with no instance host
// input: Clear on the line of lab-pc, answered no
// expect: the first question says the participants could not be read, with the reason, and still names the mailbox; the second names no participant and
//         claims no failure; the third says nothing of participants; each question is asked and a no clears nothing
test("Settings — Clear says when the participants cannot be read, and never claims there are none", async (t) => {
  const unreadable = fixture(t, { host: "unreadable" });
  await click(byClass(lineOf(await unreadable.page(), "lab-pc"), "settings-bridge-named-clear")[0]);
  assert.match(unreadable.events.questions[0].message, /participants.*could not be read.*rate limited/i);
  assert.match(unreadable.events.questions[0].message, /mailbox/i);
  const missing = fixture(t, { participants: null });
  await click(byClass(lineOf(await missing.page(), "lab-pc"), "settings-bridge-named-clear")[0]);
  assert.doesNotMatch(missing.events.questions[0].message, /could not be read|participant/i);
  assert.match(missing.events.questions[0].message, /mailbox/i);
  const none = fixture(t, { host: "none" });
  await click(byClass(lineOf(await none.page(), "lab-pc"), "settings-bridge-named-clear")[0]);
  assert.doesNotMatch(none.events.questions[0].message, /participant/i);
  assert.match(none.events.questions[0].message, /mailbox/i);
  for (const f of [unreadable, missing, none]) assert.deepEqual(readSetting(f.store, "bridge:lab-pc"), { port: 40100, token: "lab-token" });
});
