// MOD-settings-pages — the repository tokens a Bridge holds, as docs/architecture/MOD-settings-pages.md (Interfaces) states them: "While a route of the view is
// shown, each write or clear of a repository token — `github-token`, `github-token:<repository>`, `gitlab-token:<project>` — or of a Bridge — `bridge`,
// `bridge:<name>` —, the import and *Clear everything* included, hands every Bridge this browser keeps, with MOD-bridge-client's `handTokens`, every repository
// token it keeps, each with the address of the repository its key names, as `tokenKeyAddress` reads it; the writes of one click hand them once. A Bridge that
// does not take them is named with the reason in a notice, and keeps what it held"; and, on the route `bridge`, "beside *Pair*, the line that this browser's
// repository tokens go to every Bridge it keeps".
// Run: node --test tests/settings-pages-bridge-tokens.test.mjs
//
// Module: MOD-settings-pages
// Guards: UC-044; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; CONFIGURATION LIVES IN THE BROWSER; A CLEAR IS A REAL CLEAR; THE PAGE NAMES WHERE IT SENDS
// Level: unit
//
// Deterministic: localStorage is a map in memory, the DOM a small EventTarget tree, and every request goes to a fixture fetch that records it. Where the module
// file leaves a reading open, the test states the one it takes:
//   - A Bridge's write in a browser that keeps no repository token hands nothing: there is nothing a Bridge could be told (UC-044 step 4, "Then").
//   - A Bridge reached at an address and one through the jump host are both "a Bridge this browser keeps"; `bridge`, the Bridge paired last, is told once
//     where a named Bridge has its address.
// Each test states its input and its expected result before it runs (given / input / expect).

import assert from "node:assert/strict";
import test from "node:test";
import { view } from "../src/settings-pages/index.mjs";
import { clearSetting, openStore, writeSetting } from "../src/browser-store/index.mjs";
import { noticePlace } from "../src/site-frame/notices.mjs";

class Element extends EventTarget {
  constructor(name) { super(); this.localName = name; this.childNodes = []; this.className = ""; this.value = ""; this.type = ""; this.checked = false; this.parentNode = null; this.attributes = new Map(); }
  append(...nodes) { for (const node of nodes.flat()) { const child = typeof node === "string" ? new Text(node) : node; this.childNodes.push(child); child.parentNode = this; } }
  replaceChildren(...nodes) { this.childNodes = []; this.append(...nodes); }
  get textContent() { return this.childNodes.map((child) => child.textContent).join(""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  focus() {}
}
class Text { constructor(value) { this.value = String(value); } get textContent() { return this.value; } }
globalThis.document = { createElement: (name) => new Element(name) };
class Storage { constructor() { this.values = new Map(); } getItem(key) { return this.values.get(key) ?? null; } setItem(key, value) { this.values.set(key, String(value)); } removeItem(key) { this.values.delete(key); } get length() { return this.values.size; } key(index) { return [...this.values.keys()][index] ?? null; } }
function freshStore() { Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() }); return openStore("fixture/instance"); }
const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
const route = (name) => view.routes.find((candidate) => candidate.name === name);
async function render(store, name = "bridge") {
  const target = document.createElement("div");
  await route(name).render(target, { instance: { repository: "fixture/instance" }, store, go() {} }, {});
  return target;
}
// The fixture fetch: every request recorded; a PUT of the tokens answered `{ kept }`, or 401 for the Bridge at `refusing`.
function recording(t, refusing = null) {
  const calls = [];
  const realFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = realFetch; });
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), method: init.method, body: init.body ? JSON.parse(init.body) : null, token: init.headers?.["x-agent-m-bridge-token"] ?? null });
    if (refusing && String(url).startsWith(refusing)) return new Response(JSON.stringify({ error: "token-refused", message: "Bridge token refused." }), { status: 401 });
    if (String(url).endsWith("/v1/repository-tokens")) return new Response(JSON.stringify({ kept: JSON.parse(init.body).tokens.length }), { status: 200 });
    // A pairing: the Bridge names itself by its port, 4712 the Bridge new.
    if (String(url).endsWith("/v1/pair")) return new Response(JSON.stringify({ bridge: { name: String(url).includes(":4712") ? "new" : "lab", version: null, platform: "linux" }, origin: "https://fixture.github.io" }), { status: 200 });
    return new Response("{}", { status: 200 });
  };
  return calls;
}
const tokenCalls = (calls) => calls.filter((call) => call.url.endsWith("/v1/repository-tokens"));

// TST-20261110401 · level: unit · module: MOD-settings-pages
// guards: UC-044; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT; A CLEAR IS A REAL CLEAR; THE PAGE NAMES WHERE IT SENDS
// given: a browser that keeps two Bridges, bridge:lab at http://127.0.0.1:4711 with pairing token lab-token and bridge:gpu at http://localhost:40101 with gpu-token, and `bridge` with lab's address; no repository token yet; the route bridge shown
// input: writeSetting of github-token (github_pat_I); writeSetting of github-token:fixture/product (github_pat_P) and of gitlab-token:gitlab.example.org/g/p (glpat-G) in one turn; clearSetting of github-token:fixture/product; then writeSetting of an endpoint
// expect: the route says that the repository tokens go to every Bridge this browser keeps; after the first write one PUT /v1/repository-tokens to each Bridge, with its own pairing token, carrying [{ https://github.com/fixture/instance, github_pat_I }]; after the two writes of one turn one PUT to each, carrying all three, each with its repository; after the clear one PUT to each without the product's token; counter-proof: the endpoint's write hands nothing
test("TST-20261110401: each write and clear of a repository token hands every Bridge this browser keeps every repository token, each with its repository", async (t) => {
  const store = freshStore();
  writeSetting(store, "bridge:lab", { address: "http://127.0.0.1:4711", token: "lab-token" });
  writeSetting(store, "bridge:gpu", { address: "http://localhost:40101", token: "gpu-token" });
  writeSetting(store, "bridge", { address: "http://127.0.0.1:4711", token: "lab-token" });
  const calls = recording(t);
  const shown = await render(store);
  assert.match(shown.textContent, /repository tokens go to every Bridge/i, "the page names where the tokens go");

  writeSetting(store, "github-token", { value: "github_pat_I", name: "GitHub token" });
  await settle();
  const instance = { repository: "https://github.com/fixture/instance", token: "github_pat_I" };
  // The module file names no order of the Bridges: the calls are compared by their addresses.
  assert.deepEqual(tokenCalls(calls).map(({ url, method, token, body }) => [method, url, token, body]).sort((a, b) => a[1].localeCompare(b[1])), [
    ["PUT", "http://127.0.0.1:4711/v1/repository-tokens", "lab-token", { tokens: [instance] }],
    ["PUT", "http://localhost:40101/v1/repository-tokens", "gpu-token", { tokens: [instance] }]]);

  calls.length = 0;
  writeSetting(store, "github-token:fixture/product", { value: "github_pat_P" });
  writeSetting(store, "gitlab-token:gitlab.example.org/g/p", { value: "glpat-G" });
  await settle();
  const all = [instance, { repository: "https://github.com/fixture/product", token: "github_pat_P" }, { repository: "https://gitlab.example.org/g/p", token: "glpat-G" }];
  const sorted = (tokens) => [...tokens].sort((a, b) => a.repository.localeCompare(b.repository));
  assert.equal(tokenCalls(calls).length, 2, "the writes of one turn hand the tokens once to each Bridge");
  for (const call of tokenCalls(calls)) assert.deepEqual(sorted(call.body.tokens), sorted(all));

  calls.length = 0;
  clearSetting(store, "github-token:fixture/product");
  await settle();
  assert.equal(tokenCalls(calls).length, 2);
  for (const call of tokenCalls(calls)) assert.deepEqual(sorted(call.body.tokens), sorted(all.filter((each) => each.token !== "github_pat_P")), "a cleared token is no longer handed");

  calls.length = 0;
  writeSetting(store, "endpoint:hub", { url: "https://hub.example.org", kind: "openai-compatible", model: "m" });
  await settle();
  assert.deepEqual(tokenCalls(calls), [], "counter-proof: a setting that is neither a token nor a Bridge hands nothing");
});

// TST-20261110402 · level: unit · module: MOD-settings-pages
// guards: UC-044; A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
// given: a browser that keeps github-token and the Bridge bridge:lab; the frame's notice place; a second Bridge, bridge:old at http://127.0.0.1:4799, whose pairing is refused (401); the route bridge shown
// input: Pair Bridge on the route with the address http://127.0.0.1:4712 and the copied token new-token; then writeSetting of bridge:far at a port of the jump host, as + Bridge through the jump host stores it; then, in a fresh browser that keeps no repository token, Pair Bridge with lab's address and token
// expect: after the pairing one PUT to each of the three Bridges — lab, old and the new one — with the instance's token; the refusing one named in a notice with the reason; counter-proofs: the Bridge stored through the jump host, which is no pairing, hands nothing; and in the browser that keeps no token, the pairing hands nothing
test("TST-20261110402: a pairing hands the Bridges the tokens at once, a Bridge that refuses them is named, and a Bridge stored without a pairing is not contacted", async (t) => {
  const byClass = (root, name) => { const found = []; (function visit(node) { for (const child of node.childNodes ?? []) { if (child instanceof Element) { if (child.className.split(" ").includes(name)) found.push(child); visit(child); } } })(root); return found; };
  const pairOn = async (target, address, token) => {
    byClass(target, "bridge-address")[0].value = address;
    byClass(target, "bridge-token")[0].value = token;
    byClass(target, "bridge-pair")[0].dispatchEvent(new Event("click"));
    await settle();
  };
  const store = freshStore();
  writeSetting(store, "github-token", { value: "github_pat_I" });
  writeSetting(store, "bridge:lab", { address: "http://127.0.0.1:4711", token: "lab-token" });
  writeSetting(store, "bridge:old", { address: "http://127.0.0.1:4799", token: "old-token" });
  const place = noticePlace();
  const calls = recording(t, "http://127.0.0.1:4799");
  const shown = await render(store);
  await pairOn(shown, "http://127.0.0.1:4712", "new-token");
  assert.deepEqual(tokenCalls(calls).map(({ url }) => url).sort(), ["http://127.0.0.1:4711/v1/repository-tokens", "http://127.0.0.1:4712/v1/repository-tokens",
    "http://127.0.0.1:4799/v1/repository-tokens"]);
  assert.match(place.textContent, /old.*(refused|pairing token)/is, "the Bridge that did not take the tokens is named with the reason");

  calls.length = 0;
  writeSetting(store, "bridge:far", { port: 40102, token: "far-token" });
  await settle();
  assert.deepEqual(tokenCalls(calls), [], "counter-proof: a Bridge stored without a pairing is not contacted");

  const empty = freshStore();
  calls.length = 0;
  await pairOn(await render(empty), "http://127.0.0.1:4711", "lab-token");
  assert.ok(calls.some(({ url }) => url.endsWith("/v1/pair")), "known positive: the pairing was made");
  assert.deepEqual(tokenCalls(calls), [], "counter-proof: a browser that keeps no repository token hands nothing");
});
