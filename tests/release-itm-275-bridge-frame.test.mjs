// Independent release coverage for the bounded Bridge frame (ITM-275).
// Run: node --test tests/release-itm-275-bridge-frame.test.mjs
//
// Module: MOD-site-frame · MOD-identifiers
// Level: release
// Guards: UC-003; UC-044; EVERY STEP EXPLAINS ITSELF; ONE CLICK PER DECISION
//
// This file owns the smallest browser fixture needed by the public frame interface. It follows the
// local DOM/storage pattern of tests/site-frame.test.mjs, but does not import, change, or share its helper.

import assert from "node:assert/strict";
import test from "node:test";

class FrameElement extends EventTarget {
  constructor(document, localName) {
    super();
    this.ownerDocument = document;
    this.localName = localName;
    this.children = [];
    this.attributes = new Map();
    this.className = "";
    this.value = "";
    this._html = "";
    this._parent = null;
  }
  get parentNode() { return this._parent; }
  get firstChild() { return this.children[0] ?? null; }
  get textContent() { return this.children.map((child) => typeof child === "string" ? child : child.textContent).join("") || this._html.replace(/<[^>]*>/g, ""); }
  set textContent(value) { this.replaceChildren(String(value)); }
  get innerHTML() { return this._html || this.children.map((child) => typeof child === "string" ? child : child.innerHTML).join(""); }
  set innerHTML(value) { this._html = String(value); this.children = []; }
  append(...children) { for (const child of children) { this.children.push(child); if (typeof child !== "string") child._parent = this; } }
  replaceChildren(...children) { this._html = ""; this.children = []; this.append(...children); }
  remove() { if (!this._parent) return; this._parent.children = this._parent.children.filter((child) => child !== this); this._parent = null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); if (name === "class") this.className = String(value); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  getElementsByTagName(name) {
    const found = [];
    for (const child of this.children) if (typeof child !== "string") {
      if (child.localName === name) found.push(child);
      found.push(...child.getElementsByTagName(name));
    }
    return found;
  }
}

function frameDocument() {
  const document = {
    createElement: (name) => new FrameElement(document, name),
    getElementsByTagName(name) { return [this.head, this.body].flatMap((element) => element.localName === name ? [element] : element.getElementsByTagName(name)); },
  };
  document.head = document.createElement("head");
  document.body = document.createElement("body");
  return document;
}

function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key), get length() { return values.size; }, key: (index) => [...values.keys()][index] ?? null };
}

const document = frameDocument();
globalThis.document = document;
globalThis.window = { document };
const { startPage, notice, confirmDecision, explain } = await import("../src/site-frame/index.mjs");

const all = (root) => [root, ...["header", "main", "section", "p", "a", "button", "textarea", "details", "summary", "link", "img"].flatMap((tag) => root.getElementsByTagName(tag))];

// TST-275001
// Precondition: an own-protocol Bridge window retains a configured GitHub Pages identity and its browser store is empty.
// Input: the public startPage receives one empty-strategy route, then that route uses context.go and the fragment changes.
// Expected: the actual route receives the configured repository, a real scoped store and host, no chosen product, and no
// repository request or write; it rerenders only through the supplied fragment route.
// Planted fault: changing `product: null` in src/site-frame/index.mjs to a value makes the empty-product assertion fail.
test("TST-275001: the release Bridge frame keeps configured identity and routes without repository writes", async () => {
  const previous = { location: globalThis.location, localStorage: globalThis.localStorage, fetch: globalThis.fetch, add: window.addEventListener };
  const location = { hostname: "release-owner.github.io", pathname: "/release-frame/bridge.html", hash: "#pair" };
  const listeners = new Map(), calls = [];
  let requests = 0;
  Object.defineProperty(globalThis, "location", { configurable: true, value: location });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage() });
  globalThis.fetch = async () => { requests += 1; throw new Error("the empty Bridge frame never reads or writes a repository"); };
  window.addEventListener = (kind, listener) => listeners.set(kind, listener);
  document.body.replaceChildren();
  try {
    const view = { strategies: [], routes: [{ name: "pair", entry: null, title: "Pair", async render(target, context, params) {
      calls.push({ context, params }); target.replaceChildren("paired");
    } }] };
    await startPage({ page: "bridge", views: [view], menuViews: [] });
    assert.equal(calls.length, 1, "known positive: the configured initial fragment reaches the loaded public route");
    assert.equal(all(document.body).find((element) => element.localName === "header").className, "site-header top",
      "the bounded Bridge page starts with the shared frame header");
    assert.equal(calls[0].context.instance.repository, "release-owner/release-frame");
    assert.equal(calls[0].context.store.prefix, "agent-m:release-owner/release-frame:");
    assert.equal(typeof calls[0].context.instance.host.repositoryInfo, "function", "the real repository-host interface is passed");
    assert.equal(calls[0].context.product, null, "failure node: the bounded Bridge frame starts with no product");
    assert.equal(requests, 0, "the real host is connected but no repository read or write happens");
    calls[0].context.go("pair", { token: "again" });
    assert.equal(location.hash, "#pair/token=again", "the one route action writes only the browser fragment");
    await listeners.get("hashchange")();
    assert.deepEqual(calls[1].params, { token: "again" }, "the actual public route receives the next fragment parameters");
    assert.equal(requests, 0, "fragment routing still issues no repository request or write");
  } finally {
    document.body.replaceChildren();
    Object.defineProperty(globalThis, "location", { configurable: true, value: previous.location });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: previous.localStorage });
    globalThis.fetch = previous.fetch;
    window.addEventListener = previous.add;
  }
});

// TST-275002
// Precondition: the bounded Bridge frame has started with no route and the shared pairing explanation is available.
// Input: the route shows a supplied notice, the person cancels one decision, then supplies a reason and confirms one.
// Expected: each supplied line explains itself, cancellation has no reason, and exactly one click returns the typed reason.
// Planted fault: changing the cancel answer in src/site-frame/index.mjs to `confirmed: true` makes the cancellation assertion fail.
test("TST-275002: the release frame explains pairing and keeps each confirmation to one person decision", async () => {
  const previous = { location: globalThis.location, localStorage: globalThis.localStorage };
  Object.defineProperty(globalThis, "location", { configurable: true, value: { hostname: "release-owner.github.io", pathname: "/release-frame/", hash: "" } });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage() });
  document.body.replaceChildren();
  try {
    await startPage({ page: "bridge", views: [], menuViews: [] });
    const pairing = explain("bridge-pairing");
    assert.equal(pairing.localName, "details", "known positive: the shared explanation is an unfolded-on-demand details control");
    assert.match(pairing.textContent, /pairs this dashboard with this Bridge/, "the pairing step explains its supplied purpose");
    notice("info", { text: "Pair this Bridge with its dashboard.", link: { label: "Pairing help", href: "#pairing" } });
    const shown = all(document.body).find((element) => element.className.includes("notice"));
    const link = all(shown).find((element) => element.localName === "a");
    assert.equal(link.getAttribute("href"), "#pairing");
    const cancelled = confirmDecision({ title: "Replace pairing", lines: ["The old token stops working."], confirm: "Replace", reason: true });
    all(document.body).find((element) => element.localName === "button" && element.textContent === "Cancel").dispatchEvent(new Event("click"));
    assert.deepEqual(await cancelled, { confirmed: false, reason: null }, "failure node: cancellation remains cancelled and writes no reason");
    const accepted = confirmDecision({ title: "Replace pairing", lines: ["The new token is shown once."], confirm: "Replace", reason: true });
    all(document.body).find((element) => element.localName === "textarea").value = "rotated after loss";
    all(document.body).find((element) => element.localName === "button" && element.textContent === "Replace").dispatchEvent(new Event("click"));
    assert.deepEqual(await accepted, { confirmed: true, reason: "rotated after loss" }, "one confirmation click returns only the person's supplied reason");
  } finally {
    document.body.replaceChildren();
    Object.defineProperty(globalThis, "location", { configurable: true, value: previous.location });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: previous.localStorage });
  }
});
