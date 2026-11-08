// The frames hand the prompt bar each product's tokenKey (UC-049 4c; UC-010, Precondition) — MOD-site-frame, as docs/architecture/MOD-site-frame.md states it: `attachPromptBar` is handed
// "the chosen product and the products this browser manages, each entry of `products` with the host `productHostFollowingStore` gives for it (UC-049 3d), and each with `tokenKey`, the key
// `tokenKeyOf` gives for its token"; startPage and the live page's app (dashboard-app.mjs) both hand them. The bar asks MOD-runtimes' actionsSetup with that key for the value of
// AGENT_M_TOKEN; tokenKeyOf stays the one place of the key's rule.
// Run: node --test tests/site-frame-bar-token-key.test.mjs
//
// Module: MOD-site-frame
// Guards: UC-049; UC-010
// Level: unit
//
// Each test states its expected result in its own text; none reads it from a document. The store is MOD-browser-store's over a Storage in memory; nothing reaches the network. The live page's
// app runs only in a browser over GitHub, so its startBar is read as source text, the way tests/site-frame-token-key-once.test.mjs reads the pages that compute a token's key. startPage's
// handing of the chosen product is proven by its effect in tests/site-frame-prompt-bar.test.mjs (TST-2026111010). The counter-proofs (a planted fault in src/site-frame/ and each test's
// failing result) are recorded in the commit message.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { openStore, writeSetting } from "../src/browser-store/index.mjs";
import { managedProducts, tokenKeyOf } from "../src/site-frame/routing.mjs";
import { parseAddress } from "../src/repository-hosts/index.mjs";

class Storage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
}

// TST-2026111011 · level: unit · module: MOD-site-frame
// guards: UC-049; UC-010
// given: a browser that manages the GitHub product https://github.com/acme/widget, the GitLab project https://gitlab.example.org/team/app, and an entry that is no repository address
// input: managedProducts({ store }), called
// expect: two entries, the widget's with the tokenKey "github-token:acme/widget" and the project's with "gitlab-token:gitlab.example.org/team/app" — each the key tokenKeyOf gives for its
//   address —, each with its web address and a host; the entry that is no address is left out
test("TST-2026111011: managedProducts hands each product with the tokenKey tokenKeyOf gives for its address", () => {
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: new Storage() });
  const store = openStore("acme/instance");
  writeSetting(store, "products", ["https://github.com/acme/widget", "https://gitlab.example.org/team/app", "not an address"]);
  const entries = managedProducts({ store })();
  assert.deepEqual(entries.map(({ address, tokenKey }) => ({ address, tokenKey })), [
    { address: "https://github.com/acme/widget", tokenKey: "github-token:acme/widget" },
    { address: "https://gitlab.example.org/team/app", tokenKey: "gitlab-token:gitlab.example.org/team/app" },
  ]);
  for (const entry of entries) {
    assert.equal(entry.tokenKey, tokenKeyOf(parseAddress(entry.address)));
    assert.equal(typeof entry.host?.readSnapshot, "function");
  }
});

// The text of a function of a module's source: from its declaration to the first line that closes it at the start of a line.
const sourceOf = (text, name) => {
  const from = text.indexOf(`function ${name}(`);
  assert.ok(from >= 0, `${name} is declared`);
  return text.slice(from, text.indexOf("\n}\n", from) + 2);
};

// TST-2026111012 · level: unit · module: MOD-site-frame
// guards: UC-049; UC-010
// given: src/site-frame/dashboard-app.mjs, whose startBar attaches the bar on the review pages; known positive: the same reading finds `products: managedProducts(` there, which TST-2026111011
//   shows hands the tokenKey
// input: the source of startBar
// expect: the product it hands the bar carries `tokenKey: tokenKeyOf(parseAddress(T.product.address))` — the key computed by tokenKeyOf, spelled nowhere else in startBar; counter-proof: the
//   reading finds no `tokenKey` in the source as it stood before (`{ address: T.product.address, host: pagesHost() }`)
test("TST-2026111012: the live page's startBar hands the bar the product shown with the tokenKey tokenKeyOf gives", () => {
  const startBar = sourceOf(readFileSync(new URL("../src/site-frame/dashboard-app.mjs", import.meta.url), "utf8"), "startBar");
  assert.ok(startBar.includes("products: managedProducts("), "known positive: the products are handed through managedProducts");
  const product = /product: \(\) => \(isInstance\(\) \? null : \{([^\n]*)\}\)/.exec(startBar)?.[1] ?? "";
  assert.ok(product.includes("tokenKey: tokenKeyOf(parseAddress(T.product.address))"), product || startBar);
  assert.doesNotMatch(startBar, /github-token:|gitlab-token:/, "no key is spelled in startBar");
  assert.equal(/tokenKey/.test(" address: T.product.address, host: pagesHost() "), false, "counter-proof: the reading finds no tokenKey in the entry without it");
});
