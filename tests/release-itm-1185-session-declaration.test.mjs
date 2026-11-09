// Release tests of ITM-1185 — UC-049 (a CLI session the prompt bar offers declares its place, models with their context, and capabilities) and UC-044 (step 5: "The Bridge keeps the declaration, and
// its list of agents gives it to the dashboard"): the declaration of a CLI session is no setting of this browser. The behaviour is docs/architecture/MOD-browser-store.md (its catalogue, which holds no
// key of a CLI session, and "A key outside this catalogue is never written: `writeSetting` refuses it, so no key exists that the settings page does not show"; `importSettings` "adds every setting the
// file holds that this browser lacks") and docs/architecture/MOD-settings-pages.md (`bridge`: each CLI session's declaration "as the Bridge keeps them, saved to the Bridge with MOD-bridge-client's
// `declareAgent`") as they state it; the store is the real MOD-browser-store over a Map-backed localStorage, the page is the real route `settings` of MOD-settings-pages, and the Bridge is a stand-in for
// `fetch` that answers as the Bridge's `/v1/pair` and `/v1/agents` do, listing each agent with the declaration it keeps, and records every request.
// Run: node --test tests/release-itm-1185-session-declaration.test.mjs
//
// Module: MOD-browser-store; MOD-settings-pages
// Guards: UC-049; UC-044; EVERY SETTING IS REACHED FROM ONE PAGE; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// Level: release
//
// Written for the release testing of sprint 121 by a participant who implemented none of ITM-1185 (RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER), and moved to the declaration the Bridge keeps. The
// expected values are written here from those texts, and none is read from a document. Readings taken where the texts leave one open:
//   - "A key outside this catalogue is never written" is read for every way a value reaches this browser's store: writeSetting, and importSettings of an export file an earlier dashboard wrote, which
//     may hold a key `session:<bridge>:<agent>`. The texts do not say whether such a file is refused or read without that key; the sure part checked is that no key of a CLI session is written, and
//     that a refusal is `NotAnExport`, the one refusal of a plain file importSettings names.
//   - The Settings page "shows no value" of a session is read as: no line titled "CLI session: …", and no field of the declaration the Bridge keeps (place, model, context, capabilities) anywhere in
//     the page's text.
//   - The former cases of a session's line on the Settings page — its Test, Change and Clear — have no subject left, since the page holds no such line; asking a Bridge which CLI sessions it offers is
//     the Bridge page's Test (tests/release-itm-1186-bridge-sessions.test.mjs, TST-1186301).

import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { view } from "../src/settings-pages/index.mjs";
import { StoreError, exportSettings, importSettings, listSettings, openStore, readExport, readSetting, secretValues, writeSetting } from "../src/browser-store/index.mjs";

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
Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true, writable: true });

function descendants(root, predicate) {
  const found = [];
  (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (predicate(child)) found.push(child); visit(child); } } })(root);
  return found;
}
const byClass = (root, name) => descendants(root, (node) => node.className.split(" ").includes(name));

const INSTANCE = "fixture/instance";
const PREFIX = `agent-m:${INSTANCE}:`;
const ORIGIN = "https://published.example.test";
const SESSION = "session:lab:claude";
// The declaration the Bridge lab keeps for its agent claude (MOD-bridge-http, GET /v1/agents).
const DECLARATION = { place: "Lab server, Erlangen", capabilities: ["read the repository", "run code and tests"], models: [{ model: "model-lab-9", context: 200000 }] };
const BRIDGE = { address: "http://127.0.0.1:4711", token: "lab-bridge-token-constructed" };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const offering = (...names) => (url) => (url.endsWith("/v1/pair") ? json({ bridge: { name: "lab", version: "1", platform: "linux" }, origin: ORIGIN })
  : json({ agents: names.map((name) => ({ name, version: "2", ready: true, loggedIn: true, ...DECLARATION })), missing: [] }));

function freshStorage() { const storage = new Storage(); Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage }); return storage; }
const freshStore = () => openStore(INSTANCE);
function stand(t, answer) {
  const calls = [];
  const prior = globalThis.fetch, priorLocation = Object.getOwnPropertyDescriptor(globalThis, "location");
  globalThis.fetch = async (url, init = {}) => { calls.push({ url: String(url), init }); return answer(String(url), init); };
  Object.defineProperty(globalThis, "location", { configurable: true, value: { origin: ORIGIN } });
  t.after(() => { globalThis.fetch = prior; if (priorLocation) Object.defineProperty(globalThis, "location", priorLocation); else delete globalThis.location; });
  return calls;
}
// The Settings page drawn into a new target.
async function settingsPage(store) {
  const target = document.createElement("div");
  await view.routes.find((route) => route.name === "settings").render(target, { instance: { repository: INSTANCE }, product: null, store, go: () => {} }, {});
  return target;
}
const keysOf = (storage) => [...storage.values.keys()];

// TST-1185301 · level: release · module: MOD-browser-store
// guards: UC-049; UC-044; EVERY SETTING IS REACHED FROM ONE PAGE
// given: an instance's store holding the Bridge lab with its token; known positive first — the Bridge's setting is written and listed
// input: writeSetting of session:lab:claude with a declaration; listSettings; secretValues
// expect: known positive — bridge:lab stands in localStorage under the instance's prefix and is listed as "Bridge: lab"; writing session:lab:claude throws UnknownSetting naming the key, and localStorage is byte for byte what it was before; no setting is listed as a CLI session; secretValues holds the Bridge's token alone
test("TST-1185301 a CLI session's declaration is no setting of this browser: it is refused, and nothing of it is listed", () => {
  const storage = freshStorage();
  const opened = freshStore();
  writeSetting(opened, "bridge:lab", BRIDGE);
  assert.ok(keysOf(storage).includes(`${PREFIX}bridge:lab`), "known positive: the Bridge stands under the instance's prefix");
  assert.ok(listSettings(opened).some((setting) => setting.label === "Bridge: lab"), "known positive: the Bridge is listed");
  const before = JSON.stringify([...storage.values]);
  assert.throws(() => writeSetting(opened, SESSION, DECLARATION), (error) => error instanceof StoreError && error.name === "UnknownSetting" && error.key === SESSION);
  assert.equal(JSON.stringify([...storage.values]), before, "the refused key writes nothing");
  assert.equal(readSetting(opened, SESSION), null);
  assert.deepEqual(listSettings(opened).filter((setting) => /session/i.test(setting.key) || /CLI session/.test(setting.label)), [], "no CLI session is listed");
  assert.deepEqual(secretValues(opened), [BRIDGE.token], "only the Bridge's token is a secret value");
});

// TST-1185302 · level: release · module: MOD-browser-store
// guards: UC-049; SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
// given: a browser holding the Bridge lab; an export file an earlier dashboard wrote, holding the Bridge lab and the key session:lab:claude with a declaration; two empty browsers
// input: exportSettings of the browser plain; importSettings of that export into the first empty browser; importSettings of the earlier file into the second
// expect: the export carries the Bridge lab and no key of a CLI session; known positive — its import adds bridge:lab; the import of the earlier file writes no key of a CLI session — refused, it is refused as NotAnExport; read, session:lab:claude is in neither list it returns — and localStorage holds no key of a CLI session
test("TST-1185302 the export carries no session declaration, and an import of an earlier export writes none", async () => {
  freshStorage();
  const source = freshStore();
  writeSetting(source, "bridge:lab", BRIDGE);
  const plain = await exportSettings(source);
  assert.deepEqual(Object.keys((await readExport(plain)).settings).filter((key) => key.startsWith("session:")), [], "the export carries no session");
  assert.deepEqual((await readExport(plain)).settings["bridge:lab"], BRIDGE, "known positive: the export carries the Bridge");

  freshStorage();
  assert.ok((await importSettings(freshStore(), plain)).added.includes("bridge:lab"), "known positive: the export is imported, its Bridge added");

  const earlier = JSON.parse(plain);
  earlier.settings[SESSION] = DECLARATION;
  const storage = freshStorage();
  const result = await importSettings(freshStore(), JSON.stringify(earlier)).catch((error) => {
    assert.ok(error instanceof StoreError && error.name === "NotAnExport", `a refusal is NotAnExport: ${error}`);
    return { added: [], kept: [] };
  });
  assert.deepEqual([...result.added, ...result.kept].filter((key) => key.startsWith("session:")), [], "no session is added or kept");
  assert.deepEqual(keysOf(storage).filter((key) => key.includes(":session:")), [], "no key of a CLI session is written");
});

// TST-1185303 · level: release · module: MOD-browser-store
// guards: UC-049; THE PROMPT BAR'S ENDPOINTS AND CLI SESSIONS ARE BOUND AS PARTICIPANTS ARE
// given: a store holding the products setting; endpoint:lab is the known positive
// input: writeSetting of the keys session:lab:claude, session, session:, sessions:lab:claude, Session:lab:claude, " session:lab:claude", session-lab:claude and agent-session:lab:claude
// expect: the known positive is accepted; each of the others throws UnknownSetting naming the key, and localStorage is byte for byte what it was before
test("TST-1185303 a key of a CLI session, well formed or not, is refused, and a refused key writes nothing", () => {
  const storage = freshStorage();
  const opened = freshStore();
  writeSetting(opened, "products", []);
  writeSetting(opened, "endpoint:lab", { kind: "openai-compatible", url: "https://models.example/v1", model: "model-lab-9", place: "Lab server, Erlangen", context: 200000 });
  assert.ok(keysOf(storage).includes(`${PREFIX}endpoint:lab`), "known positive: a key of the catalogue is written");
  const before = JSON.stringify([...storage.values]);
  for (const key of [SESSION, "session", "session:", "sessions:lab:claude", "Session:lab:claude", " session:lab:claude", "session-lab:claude", "agent-session:lab:claude"]) {
    assert.throws(() => writeSetting(opened, key, DECLARATION), (error) => error instanceof StoreError && error.name === "UnknownSetting" && error.key === key, `${JSON.stringify(key)}`);
  }
  assert.equal(JSON.stringify([...storage.values]), before);
});

// TST-1185304 · level: release · module: MOD-browser-store
// guards: UC-049
// given: a store
// input: writeSetting of session:lab (no agent), session:lab: (an empty agent) and session::claude (an empty Bridge)
// expect: each throws UnknownSetting naming the key
test("TST-1185304 a session key that lacks its Bridge or its agent is refused", () => {
  freshStorage();
  const opened = freshStore();
  for (const key of ["session:lab", "session:lab:", "session::claude"]) {
    assert.throws(() => writeSetting(opened, key, DECLARATION), (error) => error instanceof StoreError && error.name === "UnknownSetting" && error.key === key, `${JSON.stringify(key)}`);
  }
});

// TST-1185305 · level: release · module: MOD-settings-pages
// guards: UC-049; EVERY SETTING IS REACHED FROM ONE PAGE
// given: this browser keeps the Bridge lab, which keeps the declaration of its agent claude and lists it ready (a fake Bridge); known positive — the page shows the line of the Bridge lab
// input: the Settings page is drawn
// expect: known positive — the page names the Bridge lab; it holds no line titled "CLI session: …" and neither the place nor the model of the declaration the Bridge keeps anywhere in its text, nor the Bridge's token; drawing it made no request
test("TST-1185305 the Settings page shows no line of a CLI session and no field of its declaration", async (t) => {
  freshStorage();
  const opened = freshStore();
  writeSetting(opened, "bridge:lab", BRIDGE);
  const calls = stand(t, offering("claude"));
  const page = await settingsPage(opened);
  assert.match(page.textContent, /Bridge: lab/, "known positive: the page shows the Bridge lab's line");
  assert.deepEqual(byClass(page, "settings-session"), [], "no line of a CLI session");
  assert.doesNotMatch(page.textContent, /CLI session: lab:/);
  // The capabilities are left out: the page names every capability where coding agents on CI are configured.
  for (const field of ["Lab server, Erlangen", "model-lab-9", BRIDGE.token]) assert.equal(page.textContent.includes(field), false, `the page shows ${field}`);
  assert.deepEqual(calls, [], "drawing the page requests nothing");
});
